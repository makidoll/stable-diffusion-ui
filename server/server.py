import datetime
import hashlib
import os
import random
from io import BytesIO
from pathlib import Path
from time import sleep
from urllib import request

from flask import (
    Flask, Response, jsonify, request, send_file, send_from_directory,
    stream_with_context
)
from PIL import Image, ImageDraw
from tinydb import TinyDB
from waitress import serve

# DEV=1 python3 server.py
make_test_images = os.environ.get("DEV") == "1"
if make_test_images:
	print("IN DEV=1 MODE, WILL MAKE TEST IMAGES INSTEAD")

use_float16 = os.environ.get("USE_FLOAT16") != None

if not make_test_images:
	import torch
	from diffusers import LMSDiscreteScheduler
	from torch import autocast

	# https://github.com/huggingface/diffusers/blob/main/src/diffusers/pipelines/stable_diffusion/pipeline_stable_diffusion.py
	import custom_pipeline_stable_diffusion

if make_test_images:

	def fakeImage(i, prompt):
		img = Image.new(
		    "RGB", (256, 256),
		    color=(
		        random.randrange(0, 128),
		        random.randrange(0, 128),
		        random.randrange(0, 128),
		    )
		)
		imgDraw = ImageDraw.Draw(img)
		imgDraw.text((10, 10), prompt, fill=(255, 255, 255))
		imgDraw.text((10, 25), "output " + str(i), fill=(255, 255, 255))
		return img
else:

	model_id = "CompVis/stable-diffusion-v1-4"

	scheduler = LMSDiscreteScheduler(
	    beta_start=0.00085,
	    beta_end=0.012,
	    beta_schedule="scaled_linear",
	    num_train_timesteps=1000
	)

	pipe = custom_pipeline_stable_diffusion.StableDiffusionPipeline.from_pretrained(
	    model_id,
	    scheduler=scheduler,
	    revision="fp16" if use_float16 else None,
	    torch_dtype=torch.float16 if use_float16 else torch.float32,
	    use_auth_token=os.environ.get("HUGGINGFACE_AUTH_TOKEN"),
	).to("cuda")

# paths, server and database

data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data")
frontend_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "../frontend/dist"
)

app = Flask(__name__, static_folder=frontend_path, static_url_path="/")

Path(data_path).mkdir(parents=True, exist_ok=True)

db = TinyDB(os.path.join(data_path, "db.json"))

# web server api

generating = False

@app.route("/api/generate", methods=["POST"])
def generate():
	global generating
	if generating:
		return jsonify({"error": "Busy generating another"}), 400

	@stream_with_context
	def generate_stream():
		global generating
		try:
			generating = True

			variations = 3

			prompt = request.json["prompt"]
			seed = int(request.json["seed"])
			inference_steps = int(request.json["inferenceSteps"])
			width = int(request.json["width"])
			height = int(request.json["height"])

			if inference_steps > 150:
				generating = False
				yield jsonify(
				    {
				        "error": "Please don't do more than 150 inference steps"
				    }
				).data
				return

			id = len(db.table("generated").all()) + 1

			yield jsonify(
			    {
			        "id": id,
			        "completed": 0,
			        "variations": variations,
			        "prompt": prompt,
			        "percentage": 0
			    }
			).data

			if make_test_images:
				if seed == -1:
					seed = random.randint(0, 9007199254740991)

				for i in range(0, variations):
					sleep(1)

					image = fakeImage(i, prompt)
					filename = "id" + str(id) + "_v" + str(i) + ".png"
					save_path = os.path.join(data_path, filename)
					image.save(save_path)

					yield jsonify(
					    {
					        "completed": i + 1,
					        "percentage": ((i + 1) / variations) * 100
					    }
					).data
			else:
				generator = torch.Generator("cuda")
				if seed == -1:
					seed = generator.seed()
				else:
					generator = generator.manual_seed(seed)

				for i in range(0, variations):
					with autocast("cuda"):

						def yield_on_step(step):
							return jsonify(
							    {
							        "percentage":
							            (
							                (i / variations) + (
							                    step / inference_steps /
							                    variations
							                )
							            ) * 100
							    }
							).data

						result = yield from pipe(
						    prompt,
						    generator=generator,
						    num_inference_steps=inference_steps,
						    width=width,
						    height=height,
						    # guidance_scale=7.5, # 0 to 20
						    yield_on_step=yield_on_step
						)

						image = result["sample"][0]
						filename = "id" + str(id) + "_v" + str(i) + ".png"
						save_path = os.path.join(data_path, filename)
						image.save(save_path)

						yield jsonify(
						    {
						        "completed": i + 1,
						        "percentage": ((i + 1) / variations) * 100
						    }
						).data

			data = {
			    "prompt": prompt,
			    "seed": seed,
			    "inferenceSteps": inference_steps,
			    "width": width,
			    "height": height,
			    # other
			    "variations": variations,
			    "created": datetime.datetime.utcnow().isoformat() + "Z"
			}

			# should be the same as id but this is more correct
			id = db.table("generated").insert(data)

			# add to response
			data["finished"] = True
			data["id"] = id

			generating = False

			yield jsonify(data).data

		except Exception as e:
			generating = False
			print(e)
			yield jsonify(
			    {
			        "error": "Something went wrong, try again soon"
			    }
			).data

	return Response(generate_stream())

@app.route("/api/results", methods=["GET"])
def results():
	results = db.table("generated").all()
	for i in range(0, len(results)):
		results[i]["id"] = i + 1
	results.reverse()
	return jsonify(results)

@app.route("/api/image/<path:path>")
def image(path):
	return send_from_directory(data_path, path)

@app.route("/api/preview/<path:id>")
def preview(id):
	size = 64

	images = [
	    Image.open(os.path.join(data_path, "id" + id + "_v0.png")),
	    Image.open(os.path.join(data_path, "id" + id + "_v1.png")),
	    Image.open(os.path.join(data_path, "id" + id + "_v2.png")),
	    # Image.open(os.path.join(data_path, "id" + id + "_v3.png")),
	    # Image.open(os.path.join(data_path, "id" + id + "_v4.png")),
	    # Image.open(os.path.join(data_path, "id" + id + "_v5.png")),
	]

	etag_hash = ""
	for image in images:
		etag_hash += hashlib.md5(image.tobytes()).hexdigest()
	etag_hash = hashlib.md5(bytes(etag_hash, "utf-8")).hexdigest()

	final_image = Image.new("RGB", (size * len(images), size))
	for i in range(0, len(images)):
		image = images[i].resize(
		    (size, size), resample=Image.Resampling.LANCZOS
		)
		final_image.paste(image, (size * i, 0))

	final_image_io = BytesIO()
	final_image.save(final_image_io, "JPEG", quality=70)
	final_image_io.seek(0)

	return send_file(final_image_io, mimetype="image/png", etag=etag_hash)

# web server frontend

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
	return app.send_static_file("index.html")

# dont run flask cli

if __name__ == "__main__":
	print("Server running at http://127.0.0.1:5000")
	serve(app, port=5000, host="0.0.0.0", threads=16)
