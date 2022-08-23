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
	promptDefaults,
};
