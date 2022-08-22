import create from "zustand";
import { Result } from "../interfaces/Result";

interface ResultsState {
	results: Result[];
	refresh: () => Promise<any>;
}

export const useResultsStore = create<ResultsState>(set => ({
	results: [],
	refresh: async () => {
		const req = await fetch("/api/results");
		const results = await req.json();
		set({ results });
	},
}));
