export interface Result {
	id: number;
	prompt: string;
	seed: number;
	inferenceSteps: number;
	guidanceScale: number;
	width: number;
	height: number;
	// other
	variations: number;
	created: string;
}
