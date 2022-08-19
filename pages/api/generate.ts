import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method != "POST") {
		return res.status(404).json({ error: "POST please" });
	}

	const prompt = req.body.prompt;
	if (prompt == null) {
		return res.status(400).json({ error: "No prompt given" });
	}

	const seed = req.body.seed;
	if (seed == null) {
		return res.status(400).json({ error: "No seed given" });
	}

	console.log(seed);

	const pyReq = await fetch("http://127.0.0.1:5000/api/generate", {
		method: "POST",
		body: JSON.stringify({ prompt, seed }),
		headers: {
			"Content-Type": "application/json",
		},
	});

	res.json(await pyReq.json());
}
