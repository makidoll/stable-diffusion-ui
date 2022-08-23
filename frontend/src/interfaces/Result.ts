export interface Result {
	id: string;
	prompt: string;
	seed: number;
	inferenceSteps: number;
	width: number;
	height: number;
	// other
	variations: number;
	created: string;
}
