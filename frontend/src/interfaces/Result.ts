import { Sampler } from "./Prompt";

export interface Result {
	id: number;
	prompt: string;
	seed: number;
	inferenceSteps: number;
	guidanceScale: number;
	width: number;
	height: number;
	sampler: Sampler;
	// other
	warning: string;
	variations: number;
	created: string;
}
