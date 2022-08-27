export interface Progress {
	finished: boolean;
	id: number;
	completed: number;
	variations: number;
	prompt: string;
	// step: number;
	percentage: number;
}
