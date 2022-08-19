import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method != "GET") {
		return res.status(404).json({ error: "GET please" });
	}

	const pyReq = await fetch("http://127.0.0.1:5000/api/results", {
		method: "GET",
	});

	res.json(await pyReq.json());
}
