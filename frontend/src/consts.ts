import { Prompt, Sampler } from "./interfaces/Prompt";

const promptDefaults: Prompt = {
	prompt: "",
	seed: -1,
	inferenceSteps: 50,
	guidanceScale: 7.5,
	width: 512,
	height: 512,
	sampler: Sampler.k_euler,
};

export const Consts = {
	variations: 3,
	promptDefaults,
};
