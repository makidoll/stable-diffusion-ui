import os
import random

import k_diffusion as K
import numpy as np
import torch
from diffusers.pipelines.stable_diffusion.safety_checker import \
    StableDiffusionSafetyChecker
from einops import rearrange
from ldm.util import instantiate_from_config
from omegaconf import OmegaConf
from PIL import Image
from torch import autocast
from tqdm.auto import trange
from transformers import AutoFeatureExtractor

def load_model_from_config(config, ckpt, verbose=False):
	print(f"Loading model from {ckpt}")
	pl_sd = torch.load(ckpt, map_location="cpu")
	if "global_step" in pl_sd:
		print(f"Global Step: {pl_sd['global_step']}")
	sd = pl_sd["state_dict"]
	model = instantiate_from_config(config.model)
	m, u = model.load_state_dict(sd, strict=False)
	if len(m) > 0 and verbose:
		print("missing keys:")
		print(m)
	if len(u) > 0 and verbose:
		print("unexpected keys:")
		print(u)

	model.cuda()
	model.eval()
	return model

# load model

server_path = os.path.join(os.path.dirname(os.path.abspath(__file__)))

config = OmegaConf.load(os.path.join(server_path, "v1-inference.yaml"))
model = load_model_from_config(
    config, os.path.join(server_path, "../sd-v1-4-full-ema.ckpt")
)

use_float16 = os.environ.get("USE_FLOAT16") == "1"

model = model
if use_float16:
	print("Using float16 instead of float32")
	model = model.half()

device = "cuda"
model = model.to(device)

# load safety model

safety_model_id = "CompVis/stable-diffusion-safety-checker"
safety_feature_extractor = AutoFeatureExtractor.from_pretrained(safety_model_id)
safety_checker = StableDiffusionSafetyChecker.from_pretrained(safety_model_id)

# should be fixed or it would break the model
opt_C = 4
opt_f = 8

def generate_seed():
	return random.randint(0, 2**32 - 1)

def seed_to_int(s):
	if type(s) is int:
		return s
	if s is None or s == '':
		return generate_seed()
	# n = abs(int(s) if s.isdigit() else random.Random(s).randint(0, 2**32 - 1))
	# while n >= 2**32:
	# 	n = n >> 32
	# return n

def torch_gc():
	torch.cuda.empty_cache()
	torch.cuda.ipc_collect()

def check_prompt_length(prompt):
	"""this function tests if prompt is too long, and if so, adds a message to comments"""

	tokenizer = model.cond_stage_model.tokenizer
	max_length = model.cond_stage_model.max_length

	info = model.cond_stage_model.tokenizer(
	    [prompt],
	    truncation=True,
	    max_length=max_length,
	    return_overflowing_tokens=True,
	    padding="max_length",
	    return_tensors="pt"
	)
	ovf = info['overflowing_tokens'][0]
	overflowing_count = ovf.shape[0]
	if overflowing_count == 0:
		return

	vocab = {v: k for k, v in tokenizer.get_vocab().items()}
	overflowing_words = [vocab.get(int(x), "") for x in ovf]
	# overflowing_text = tokenizer.convert_tokens_to_string(
	#     ''.join(overflowing_words)
	# )

	return f"Prompt was too long, last {len(overflowing_words)} word{'' if len(overflowing_words) == 1 else 's'} were ignored"

def create_random_tensors(shape, seeds):
	xs = []
	for seed in seeds:
		torch.manual_seed(seed)

		# randn results depend on device; gpu and cpu get different results for same seed;
		# the way I see it, it's better to do this on CPU, so that everyone gets same result;
		# but the original script had it like this so i do not dare change it for now because
		# it will break everyone's seeds.
		xs.append(torch.randn(shape, device=device))
	x = torch.stack(xs)
	return x

class CFGDenoiser(torch.nn.Module):
	def __init__(self, model):
		super().__init__()
		self.inner_model = model

	def forward(self, x, sigma, uncond, cond, cond_scale):
		x_in = torch.cat([x] * 2)
		sigma_in = torch.cat([sigma] * 2)
		cond_in = torch.cat([uncond, cond])
		uncond, cond = self.inner_model(x_in, sigma_in, cond=cond_in).chunk(2)
		return uncond + (cond - uncond) * cond_scale

def x_to_image(x, batch_index=0):
	x_samples_ddim = model.decode_first_stage(x)
	x_samples_ddim = torch.clamp((x_samples_ddim + 1.0) / 2.0, min=0.0, max=1.0)

	x_sample = 255. * rearrange(
	    x_samples_ddim[batch_index].cpu().numpy(), 'c h w -> h w c'
	)
	x_sample = x_sample.astype(np.uint8)

	return Image.fromarray(x_sample)

class KDiffusionSampler:
	def __init__(self, m, sampler):
		self.model = m
		self.model_wrap = K.external.CompVisDenoiser(m)
		self.schedule = sampler

	# i copied this function so we can yield to flask
	# its not a good solution especially because i could just callback
	# but i have no idea how to stream data without yielding in flask
	# https://github.com/hlky/k-diffusion-sd/blob/master/k_diffusion/sampling.py

	@torch.no_grad()
	def sample_lms(
	    self,
	    model,
	    x,
	    sigmas,
	    extra_args=None,
	    callback=None,
	    disable=None,
	    order=4,
	    yield_on_step=None
	):
		extra_args = {} if extra_args is None else extra_args
		s_in = x.new_ones([x.shape[0]])
		ds = []
		for i in trange(len(sigmas) - 1, disable=disable):
			if yield_on_step != None:
				yield yield_on_step(i) # optionally pass x

			denoised = model(x, sigmas[i] * s_in, **extra_args)
			d = K.sampling.to_d(x, sigmas[i], denoised)
			ds.append(d)
			if len(ds) > order:
				ds.pop(0)
			if callback is not None:
				callback(
				    {
				        'x': x,
				        'i': i,
				        'sigma': sigmas[i],
				        'sigma_hat': sigmas[i],
				        'denoised': denoised
				    }
				)
			cur_order = min(i + 1, order)
			coeffs = [
			    K.sampling.linear_multistep_coeff(
			        cur_order, sigmas.cpu(), i, j
			    ) for j in range(cur_order)
			]
			x = x + sum(coeff * d for coeff, d in zip(coeffs, reversed(ds)))
		return x

	def sample(
	    self,
	    S,
	    conditioning,
	    batch_size,
	    shape,
	    verbose,
	    unconditional_guidance_scale,
	    unconditional_conditioning,
	    eta,
	    x_T,
	    yield_on_step=None
	):
		sigmas = self.model_wrap.get_sigmas(S)
		x = x_T * sigmas[0]
		model_wrap_cfg = CFGDenoiser(self.model_wrap)

		# samples_ddim = K.sampling.__dict__[f'sample_{self.schedule}'](
		samples_ddim = yield from self.sample_lms(
		    model_wrap_cfg,
		    x,
		    sigmas,
		    extra_args={
		        'cond': conditioning,
		        'uncond': unconditional_conditioning,
		        'cond_scale': unconditional_guidance_scale
		    },
		    disable=False,
		    yield_on_step=yield_on_step
		)

		return samples_ddim, None

def numpy_to_pil(images):
	"""
    Convert a numpy image or a batch of images to a PIL image.
    """
	if images.ndim == 3:
		images = images[None, ...]
	images = (images * 255).round().astype("uint8")
	pil_images = [Image.fromarray(image) for image in images]

	return pil_images

def check_safety_fn(x_image):
	safety_checker_input = safety_feature_extractor(
	    numpy_to_pil(x_image), return_tensors="pt"
	)
	_, has_nsfw_concept = safety_checker(
	    images=x_image, clip_input=safety_checker_input.pixel_values
	)
	return has_nsfw_concept

# starts here

def generate_image(
    prompt: str,
    seed: int = None,
    width: int = 512,
    height: int = 512,
    ddim_steps: int = 50,
    cfg_scale: int = 7.5,
    yield_on_step=None,
    check_safety=False
):
	torch_gc()

	prompt_length_warning = check_prompt_length(prompt)

	sampler = KDiffusionSampler(model, "lms")

	with torch.no_grad(), autocast("cuda"), model.ema_scope():
		# batch size
		prompts = [prompt]
		seeds = [seed]

		uc = model.get_learned_conditioning(len(prompts) * [""])

		c = model.get_learned_conditioning(prompts)

		# we manually generate all input noises because each one should have a specific seed
		shape = [opt_C, height // opt_f, width // opt_f]
		x = create_random_tensors(shape, seeds=seeds)

		samples_ddim, _ = yield from sampler.sample(
		    S=ddim_steps,
		    conditioning=c,
		    batch_size=int(x.shape[0]),
		    shape=x[0].shape,
		    verbose=False,
		    unconditional_guidance_scale=cfg_scale,
		    unconditional_conditioning=uc,
		    eta=0.0,
		    x_T=x,
		    yield_on_step=yield_on_step
		)

		x_samples_ddim = model.decode_first_stage(samples_ddim)
		x_samples_ddim = torch.clamp(
		    (x_samples_ddim + 1.0) / 2.0, min=0.0, max=1.0
		)

		has_nsfw_concept = False
		if check_safety:
			has_nsfw_concept = check_safety_fn(
			    x_samples_ddim.cpu().permute(0, 2, 3, 1).numpy()
			)[0]

		for i, x_sample in enumerate(x_samples_ddim):
			x_sample = 255. * rearrange(
			    x_sample.cpu().numpy(), 'c h w -> h w c'
			)
			x_sample = x_sample.astype(np.uint8)

		return {
		    "image": Image.fromarray(x_sample),
		    "prompt_length_warning": prompt_length_warning,
		    "has_nsfw_concept": has_nsfw_concept
		}
