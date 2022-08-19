import {
	Badge,
	Button,
	Center,
	HStack,
	SimpleGrid,
	Text,
} from "@chakra-ui/react";
import { format, formatDistance, formatRelative } from "date-fns";
import { MdOutbox, MdRefresh } from "react-icons/md";
import { getResultImageUrls } from "../../utils/GetResultImageUrls";
import { Result } from "../../utils/Result";
import { ImageResult } from "../ui/ImageResult";
import PromptBox from "../ui/PromptBox";

export default function ResultsPage(props: {
	result: Result;
	onStartOver: (reproduceResult?: Result) => any;
}) {
	const images = getResultImageUrls(props.result);

	return (
		<Center h="100%" flexDirection="column">
			<PromptBox prompt={props.result.prompt} />
			<HStack mt={2}>
				<Badge colorScheme={"blue"}>
					{formatRelative(new Date(props.result.created), new Date())}
				</Badge>
				<Badge colorScheme={"orange"}>seed: {props.result.seed}</Badge>
			</HStack>
			<SimpleGrid columns={3} spacing={4} padding={4} mt={2}>
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
