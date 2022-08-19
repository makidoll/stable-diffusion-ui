import { Center, Progress, Text } from "@chakra-ui/react";
import PromptBox from "../ui/PromptBox";

export default function LoadingPage(props: { prompt: string }) {
	return (
		<Center h="100%" flexDirection="column">
			<PromptBox prompt={props.prompt} />
			<Progress
				size="xs"
				colorScheme="pink"
				w="80%"
				isIndeterminate
				mt={8}
				mb={6}
			/>
			<Text opacity={0.5}>
				The foxes, squirrels and sharks are working really hard to make
				your pictures!
			</Text>
		</Center>
	);
}
