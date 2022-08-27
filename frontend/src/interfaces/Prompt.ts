export enum Sampler {
	k_lms = "k_lms",
	k_euler = "k_euler",
	k_euler_a = "k_euler_a",
}

export interface Prompt {
	prompt: string;
	seed: number;
	inferenceSteps: number;
	guidanceScale: number;
	width: number;
	height: number;
	sampler: Sampler;
}
