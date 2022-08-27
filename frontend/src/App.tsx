import {
	Box,
	Flex,
	Grid,
	Heading,
	HStack,
	IconButton,
	Image,
	Text,
	useToast,
} from "@chakra-ui/react";
import { FormikProps } from "formik";
import { useEffect, useRef, useState } from "react";
import { MdRefresh } from "react-icons/md";
import { Consts } from "./consts";
import { Progress } from "./interfaces/Progress";
import { Prompt } from "./interfaces/Prompt";
import { Result } from "./interfaces/Result";
import { useResultsStore } from "./state/Results";
import ImageResult from "./ui/ImageResult";
import PreviousResults from "./ui/PreviousResults";
import PromptInput from "./ui/PromptInput";
import TopScreenLoadingBar from "./ui/TopScreenLoadingBar";
import { getRandomAreWorkingXTo } from "./utils/getRandomAreWorkingXTo";
import { getResultImageUrls } from "./utils/getResultImageUrls";

export default function App() {
	const [loading, setLoading] = useState(false);
	const [areWorkingXTo, setAreWorkingXTo] = useState<string[]>(null);

	const [progress, setProgress] = useState<Progress>(null);

	useEffect(() => {
		setAreWorkingXTo(loading ? getRandomAreWorkingXTo(6) : null);
	}, [loading]);

	const [result, setResult] = useState<Result>(null);
	const { results, refresh: refreshResults } = useResultsStore();

	useEffect(() => {
		refreshResults();
	}, []);

	const promptFormRef = useRef<FormikProps<Prompt>>();

	const toast = useToast();

	const onPrompt = async ({
		prompt,
		seed,
		inferenceSteps,
		guidanceScale,
		width,
		height,
	}: Prompt) => {
		setLoading(true);

		setProgress({
			finished: false,
			id: null,
			completed: 0,
			variations: 0,
			prompt: "",
			percentage: 0,
		});

		const body: Prompt = {
			prompt,
			seed: Number(seed),
			inferenceSteps: Number(inferenceSteps),
			guidanceScale: Number(guidanceScale),
			width: Number(width),
			height: Number(height),
		};

		const response = await fetch("/api/generate", {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const reader = response.body.getReader();

		while (true) {
			try {
				const { value, done } = await reader.read();
				if (done) break;

				const string = new TextDecoder().decode(value);

				const data: Progress & Result & { error: string } =
					JSON.parse(string);

				if (data.error) {
					// show error
					toast({
						title: data.error,
						status: "error",
						isClosable: true,
						position: "top-left",
					});
				}

				if (data.finished) {
					setResult(data);
					refreshResults();
				} else {
					setProgress(progress => ({ ...progress, ...data }));
				}
			} catch (error) {
				console.error(error);
			}
			// to avoid locking up
			await new Promise(resolve => {
				setTimeout(() => {
					resolve(null);
				}, 10);
			});
		}

		setLoading(false);
		setProgress(null);
	};

	const onSidebarResultClick = (result: Result) => {
		setLoading(false);
		setResult(result);

		let values = {};
		for (let key of Object.keys(Consts.promptDefaults)) {
			// get from result otherwise if null, use default
			values[key] = result[key] ?? Consts.promptDefaults[key];
		}

		promptFormRef.current.resetForm({
			values: values as any,
			errors: {},
		});
	};

	return (
		<div>
			<TopScreenLoadingBar
				enabled={loading && progress != null}
				percentage={progress?.percentage ?? 0}
			/>
			<HStack>
				<Flex
					flexGrow="1"
					h="100vh"
					overflow="hidden"
					p={4}
					pr={2}
					flexDirection="column"
					alignItems="center"
					// vertical alignment
					justifyContent={result || loading ? "flex-start" : "center"}
				>
					{result || loading ? null : (
						<>
							<Image
								src={
									new URL("../icon.svg", import.meta.url)
										.pathname
								}
								h={24}
								mb={4}
							></Image>
							<Heading>Cutelab and Blåhaj</Heading>
							<Heading size="lg" mb={6}>
								make Stable Diffusion
							</Heading>
						</>
					)}
					<PromptInput
						promptFormRef={promptFormRef}
						onPrompt={onPrompt}
						resultForDisplay={result}
						width={result || loading ? "100%" : "80%"}
					/>
					{result || loading ? null : <Box mb={8}></Box>}
					{result || loading ? (
						<Grid
							templateColumns={"repeat(3, auto)"}
							alignItems={"center"}
							justifyContent={"center"}
							h="100%"
							pb={32}
							// justifyContent={"flex-start"}
							gap={2}
						>
							{getResultImageUrls(
								loading ? progress : result,
							).map(({ src, prompt }, i) => (
								<ImageResult
									key={i}
									prompt={prompt}
									src={src}
									// height="41.5vh"
									height="44vh"
									areWorkingXTo={
										loading && areWorkingXTo
											? areWorkingXTo[i]
											: null
									}
								/>
							))}
						</Grid>
					) : null}
				</Flex>
				<Box
					w={300}
					minW={300}
					h="100vh"
					overflow="hidden"
					p={4}
					pl={0}
				>
					<Box
						h="100%"
						borderWidth={1}
						// borderWidth={2}
						// borderColor="blackAlpha.200"
						// borderColor="blackAlpha.100"
						borderRadius={8}
						// shadow={"xl"}
						overflow="scroll"
					>
						<Box padding={4}>
							<Flex flexDirection={"row"} w="100%">
								<Box flexGrow={1}>
									<Heading size={"md"}>Last prompts</Heading>
									<Text fontWeight={500}>
										{`${results.length} ${
											results.length == 1
												? "picture"
												: "pictures"
										} generated`}
									</Text>
								</Box>
								<IconButton
									fontSize={24}
									variant="ghost"
									aria-label="Refresh"
									icon={<MdRefresh />}
									onClick={() => {
										refreshResults();
									}}
								/>
							</Flex>
							{results.map(result => (
								<PreviousResults
									key={result.id}
									result={result}
									onClick={() => {
										onSidebarResultClick(result);
									}}
								/>
							))}
						</Box>
					</Box>
				</Box>
			</HStack>
		</div>
	);
}
