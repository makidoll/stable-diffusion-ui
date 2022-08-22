import { Result } from "./Result";

export const loadingVariations = 3;

export function getResultImageUrls(result: Result) {
	return new Array(result.variations)
		.fill(null)
		.map((_, i) => "/api/image/id" + result.id + "_v" + i + ".png");
}