import { Box, Heading, Image, SimpleGrid, Text } from "@chakra-ui/react";
import { getResultImageUrls } from "../utils/getResultImageUrls";
import { Result } from "../interfaces/Result";

function PreviousResults(props: { result: Result; onClick?: () => any }) {
	const images = getResultImageUrls(props.result);

	return (
		<Box cursor={"pointer"} onClick={props.onClick}>
			<Text noOfLines={1} mb={0} mt={2}>
				{props.result.prompt}
			</Text>
			<SimpleGrid columns={6} spacing={0.5}>
				{images.map((src, i) => (
					<Image key={i} src={src} w="100%" borderRadius={4} />
				))}
			</SimpleGrid>
		</Box>
	);
}

export default function SidebarPage(props: {
	allResults: Result[];
	onSidebarResultClick: (result: Result) => any;
}) {
	return (
		<Box padding={4}>
			<Heading size={"md"}>Last prompts</Heading>
			{props.allResults.map(result => (
				<PreviousResults
					key={result.id}
					result={result}
					onClick={() => props.onSidebarResultClick(result)}
				/>
			))}
		</Box>
	);
}
