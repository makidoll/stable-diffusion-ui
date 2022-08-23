import { Prompt } from "./interfaces/Prompt";

const promptDefaults: Prompt = {
	prompt: "",
	seed: -1,
	inferenceSteps: 50,
	width: 512,
	height: 512,
};

export const Consts = {
	variations: 3,
	// with 50 steps at 512 x 512
	// its 10s on my 3060 ti (linux)
	// its 6s on my 3080 ti (windows)
	etaPerImage: 6, // seconds
	promptDefaults,
};
