import {
	Box,
	Flex,
	Grid,
	Heading,
	HStack,
	Image,
	Text,
	useToast,
} from "@chakra-ui/react";
import { FormikProps } from "formik";
import { useEffect, useRef, useState } from "react";
import { Consts } from "./consts";
import { Prompt } from "./interfaces/Prompt";
import { Result } from "./interfaces/Result";
import { useResultsStore } from "./state/Results";
import ImageResult from "./ui/ImageResult";
import PreviousResults from "./ui/PreviousResults";
import PromptInput from "./ui/PromptInput";
import { getRandomAreWorkingXTo } from "./utils/getRandomAreWorkingXTo";
import { getResultImageUrls } from "./utils/getResultImageUrls";

export default function App() {
	const [loading, setLoading] = useState(false);
	const [loadingWithAreWorkingXTo, setLoadingWithAreWorkingXTo] =
		useState<string[]>(null);

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

	const onPrompt = async ({ prompt, seed, inferenceSteps }: Prompt) => {
		setLoading(true);

		const response = await fetch("/api/generate", {
			method: "POST",
			body: JSON.stringify({
				prompt,
				seed: Number(seed),
				inferenceSteps: Number(inferenceSteps),
			}),
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
		promptFormRef.current.resetForm({
			values: {
				prompt: result.prompt ?? Consts.promptDefaults.prompt,
				seed: result.seed ?? Consts.promptDefaults.seed,
				inferenceSteps:
					result.inferenceSteps ??
					Consts.promptDefaults.inferenceSteps,
			},
			errors: {},
		});
	};

	// TODO: add loading back in with eta per image
	return (
		<div>
			{/* {loading ? (
				<Progress
					// size="xs"
					h="1"
					mb="-1"
					value={0}
					isIndeterminate
					colorScheme="pink"
				/>
			) : null} */}
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
							<Heading size={"md"}>Last prompts</Heading>
							<Text fontWeight={500}>
								{`${results.length} ${
									results.length == 1 ? "picture" : "pictures"
								} generated`}
							</Text>
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
