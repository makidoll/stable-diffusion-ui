import { Box, HStack } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import LoadingPage from "../components/pages/LoadingPage";
import PromptPage from "../components/pages/PromptPage";
import ResultsPage from "../components/pages/ResultsPage";
import SidebarPage from "../components/pages/SidebarPage";
import { Prompt } from "../utils/Prompt";
import { Result } from "../utils/Result";

const Home: NextPage = () => {
	const [promptValues, setPromptValues] = useState<Prompt>(null);
	const [loadingPrompt, setLoadingPrompt] = useState("");

	const [result, setResult] = useState<Result>(null);

	const [allResults, setAllResults] = useState<Result[]>([]);

	const refreshAllResults = async () => {
		const req = await fetch("/api/results");
		const results = await req.json();
		setAllResults(results);
	};

	useEffect(() => {
		refreshAllResults();
	}, []);

	const onPrompt = async (prompt: string, seed: number) => {
		setLoadingPrompt(prompt);

		const response = await fetch("/api/generate", {
			method: "POST",
			body: JSON.stringify({ prompt, seed }),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const result = await response.json();

		setTimeout(() => {
			setResult(result);
			setLoadingPrompt("");

			refreshAllResults();
		}, 1000 * 2);
	};

	const onStartOver = (reproduceResult?: Result) => {
		setPromptValues(
			reproduceResult
				? {
						prompt: reproduceResult.prompt,
						seed: reproduceResult.seed,
				  }
				: null,
		);

		setResult(null);
		setLoadingPrompt("");
	};

	const onSidebarResultClick = (result: Result) => {
		setResult(result);
		setLoadingPrompt("");
	};

	return (
		<div>
			<Head>
				<title>Cutelab and Blåhaj: Stable Diffusion</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<HStack>
				<Box flexGrow="1" h="100vh">
					{result ? (
						<ResultsPage
							result={result}
							onStartOver={onStartOver}
						/>
					) : loadingPrompt != "" ? (
						<LoadingPage prompt={loadingPrompt} />
					) : (
						<PromptPage
							promptValues={promptValues}
							picturesGenerated={allResults.length}
							onPrompt={onPrompt}
						/>
					)}
				</Box>
				<Box w={300} minW={300} h={"100vh"} p={4} pl={0}>
					<Box
						h="100%"
						// borderWidth={1}
						borderWidth={2}
						borderColor="blackAlpha.200"
						// borderColor="blackAlpha.100"
						borderRadius={8}
						// shadow={"xl"}
					>
						<SidebarPage
							allResults={allResults}
							onSidebarResultClick={onSidebarResultClick}
						/>
					</Box>
				</Box>
			</HStack>
		</div>
	);
};

export default Home;
