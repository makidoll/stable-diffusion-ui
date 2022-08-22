import { Prompt } from "./interfaces/Prompt";

const promptDefaults: Prompt = {
	prompt: "",
	seed: -1,
	inferenceSteps: 50,
};

export const Consts = {
	variations: 3,
	// etaPerImageWith50InfSteps: 10, // seconds
	promptDefaults,
};
