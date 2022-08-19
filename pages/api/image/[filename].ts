import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";

const stableDiffusionPath = path.resolve(__dirname, "../../../../../data");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const filename = req.query.filename;
	if (
		req.method != "GET" ||
		typeof filename != "string" ||
		!filename.endsWith(".png")
	) {
		return res.status(404).end();
	}

	fs.readFile(path.resolve(stableDiffusionPath, filename))
		.then(file => {
			res.setHeader("Content-Type", "image/png").send(file);
		})
		.catch(error => {
			res.status(404).end();
		});
}
