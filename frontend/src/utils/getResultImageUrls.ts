import { Progress } from "../interfaces/Progress";
import { Result } from "../interfaces/Result";

export function getResultImageUrls(data: Result | Progress) {
	if (data == null || data.id == null) return [];

	const variations = data == null ? 0 : data.variations;
	const completed = data == null ? null : (data as any).completed;

	return new Array(variations).fill(null).map((_, i) =>
		completed == null || i < completed
			? {
					src: "/api/image/id" + data.id + "_v" + i + ".png",
					result: data as Result,
			  }
			: { src: "", result: null },
	);
}
