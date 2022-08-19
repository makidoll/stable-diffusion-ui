import { Box, Heading } from "@chakra-ui/react";

export default function PromptBox(props: { prompt: string }) {
	return (
		<Box
			borderWidth={2}
			borderColor="blackAlpha.200"
			rounded={8}
			px={5}
			py={3}
			textAlign={"center"}
			maxW="80%"
		>
			<Heading size="md" fontWeight={500}>
				{props.prompt}
			</Heading>
		</Box>
	);
}
