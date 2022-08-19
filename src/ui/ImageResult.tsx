import {
	Button,
	ButtonGroup,
	Center,
	Flex,
	Image,
	Modal,
	ModalContent,
	ModalOverlay,
	useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdCallSplit, MdDownload } from "react-icons/md";

async function downloadFile(url: string, filename: string) {
	// const a = document.createElement("a");
	// a.href = url;
	// a.download = filename;
	// document.body.appendChild(a);
	// a.click();
	const res = await fetch(url);
	const buffer = await res.arrayBuffer();
	const objectUrl = window.URL.createObjectURL(new Blob([buffer]));
	const link = document.createElement("a");
	link.href = objectUrl;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
}

export default function ImageResult(props: { src: string; prompt: string }) {
	const [downloading, setDownloading] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();
	return (
		<Flex w="100%" flexDirection={"column"} alignItems={"center"}>
			<Image
				src={props.src}
				h="35vh"
				style={{ aspectRatio: "1 / 1" }}
				backgroundColor="rgba(0,0,0,0.05)"
				borderRadius={8}
				onClick={onOpen}
				cursor={"pointer"}
				objectFit={"contain"}
			/>

			<Modal onClose={onClose} isOpen={isOpen} isCentered size={"2xl"}>
				<ModalOverlay />
				<ModalContent
					borderRadius={8}
					background="transparent"
					shadow={"none"}
				>
					{/* <ModalCloseButton color={"white"} /> */}
					<Center flexDirection={"column"}>
						<Image
							src={props.src}
							width="90%"
							style={{ aspectRatio: "1" }}
							backgroundColor="rgba(0,0,0,0.05)"
							borderRadius={8}
							objectFit={"contain"}
						></Image>
						<ButtonGroup isAttached variant="outline" mt={2}>
							<Button
								isLoading={downloading}
								loadingText="Downloading"
								leftIcon={<MdDownload />}
								colorScheme={"pink"}
								variant="solid"
								onClick={() => {
									setDownloading(true);
									downloadFile(
										props.src,
										props.prompt,
									).finally(() => {
										setDownloading(false);
									});
								}}
							>
								Download
							</Button>
							<Button
								leftIcon={<MdCallSplit />}
								variant="outline"
								background={"white"}
								borderColor={"transparent"}
							>
								Variant
							</Button>
						</ButtonGroup>
					</Center>
				</ModalContent>
			</Modal>
		</Flex>
	);
}
