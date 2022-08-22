import { Prompt } from "./interfaces/Prompt";

const promptDefaults: Prompt = {
	prompt: "",
	seed: -1,
	inferenceSteps: 50,
};

export const Consts = {
	variations: 3,
	// with 50 steps at 512 x 512
	// its 10s on my 3060 ti
	etaPerImage: 10, // seconds
	promptDefaults,
};
