import { Badge, Button, Center, HStack, SimpleGrid } from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import { MdOutbox, MdRefresh } from "react-icons/md";
import { getResultImageUrls } from "../utils/getResultImageUrls";
import { Result } from "../interfaces/Result";
import PromptBox from "../ui/PromptBox";
import ImageResult from "../ui/ImageResult";

export default function ResultsPage(props: {
	result: Result;
	onStartOver: (reproduceResult?: Result) => any;
}) {
	const images = getResultImageUrls(props.result);

	return (
		<Center h="100%" flexDirection="column">
			<PromptBox prompt={props.result.prompt} />
			<HStack mt={4}>
				<Badge colorScheme={"blue"}>
					{formatRelative(new Date(props.result.created), new Date())}
				</Badge>
				<Badge colorScheme={"orange"}>Seed: {props.result.seed}</Badge>
			</HStack>
			<SimpleGrid columns={3} spacing={4} padding={4} mt={1}>
				{images.map((src, i) => (
					<ImageResult
						key={i}
						prompt={props.result.prompt}
						src={src}
					/>
				))}
			</SimpleGrid>
			<HStack mt={0}>
				<Button
					leftIcon={<MdRefresh />}
					colorScheme="pink"
					onClick={() => props.onStartOver(null)}
				>
					Start over
				</Button>
				<Button
					leftIcon={<MdOutbox />}
					onClick={() => props.onStartOver(props.result)}
					variant="outline"
				>
					Reproduce exactly
				</Button>
			</HStack>
		</Center>
	);
}
