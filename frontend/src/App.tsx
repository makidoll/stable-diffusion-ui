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
	const [loadingWithAreWorkingXTo, setLoadingWithAreWorkingXTo] =
		useState<string[]>(null);

	const [loadingStartTime, setLoadingStartTime] = useState<number>(0);
	const [loadingEndTime, setLoadingEndTime] = useState<number>(0);

	useEffect(() => {
		setLoadingWithAreWorkingXTo(loading ? getRandomAreWorkingXTo(6) : null);
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
		width,
		height,
	}: Prompt) => {
		setLoading(true);

		const etaInSeconds =
			(Consts.etaPerImage / 50) * inferenceSteps * Consts.variations;

		setLoadingStartTime(Date.now());
		setLoadingEndTime(Date.now() + etaInSeconds * 1000);

		const body: Prompt = {
			prompt,
			seed: Number(seed),
			inferenceSteps: Number(inferenceSteps),
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

		const result = await response.json();

		setLoading(false);

		if (result.error) {
			// show error
			toast({
				title: result.error,
				status: "error",
				isClosable: true,
				position: "top-left",
			});
		} else {
			setResult(result);
			refreshResults();
		}
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

	// TODO: add loading back in with eta per image
	return (
		<div>
			<TopScreenLoadingBar
				enabled={loading}
				startTime={loadingStartTime}
				endTime={loadingEndTime}
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
							<Image src="/icon.svg" h={24} mb={4}></Image>
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
							{(loading
								? new Array(Consts.variations).fill("")
								: getResultImageUrls(result)
							).map((src, i) => (
								<ImageResult
									key={i}
									prompt={loading ? "" : result.prompt}
									src={src}
									// height="41.5vh"
									height="44vh"
									loadingWithAreWorkingXTo={
										loading && loadingWithAreWorkingXTo
											? loadingWithAreWorkingXTo[i]
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
