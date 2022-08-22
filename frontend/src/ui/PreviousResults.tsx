import { Box, Image, Text } from "@chakra-ui/react";
import { Result } from "../interfaces/Result";

export default function PreviousResults(props: {
	result: Result;
	onClick?: () => any;
}) {
	// const images = getResultImageUrls(props.result);

	return (
		<Box cursor={"pointer"} onClick={props.onClick}>
			<Text noOfLines={1} mb={0} mt={1}>
				{props.result.prompt}
			</Text>
			<Image
				src={"/api/preview/" + props.result.id}
				w="100%"
				borderRadius={4}
			/>
			{/* <SimpleGrid columns={6} spacing={0.5}>
				{images.map((src, i) => (
					<Image key={i} src={src} w="100%" borderRadius={4} />
				))}
			</SimpleGrid> */}
		</Box>
	);
}
