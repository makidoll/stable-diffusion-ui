import {
	Button,
	Center,
	Heading,
	HStack,
	Image,
	Input,
	InputGroup,
	InputLeftAddon,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Text,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { FaCookieBite } from "react-icons/fa";
import { MdBrush } from "react-icons/md";
import { Prompt } from "../../utils/Prompt";

export default function PromptPage(props: {
	promptValues?: Prompt;
	picturesGenerated: number;
	onPrompt?: (prompt: string, seed: number) => any;
}) {
	const onSubmit = async ({ prompt, seed }: Prompt) => {
		if (props.onPrompt) props.onPrompt(prompt, seed);
	};

	const validatePrompt = (value: string) => {
		if (value.trim() == "") return "Can't be empty!";
	};

	const formik = (
		<Formik
			initialValues={
				props.promptValues ?? {
					prompt: "",
					seed: -1,
				}
			}
			onSubmit={onSubmit}
		>
			{({ dirty, isValid }) => (
				<Form style={{ width: "100%", height: "100%" }}>
					<Center flexDirection="column" h="100%">
						<Image src="/icon.svg" h={24} m={2}></Image>
						<Heading>Cutelab and Blåhaj</Heading>
						<Heading size="lg">make Stable Diffusion</Heading>
						<Field name="prompt" validate={validatePrompt}>
							{({ field }) => (
								<Input
									{...field}
									placeholder="Squirrel scientists in the high energy nut research laboratory"
									size="lg"
									width="80%"
									mt={6}
									mb={3}
								/>
							)}
						</Field>
						<Field name="seed">
							{({ field, form }) => (
								<NumberInput
									{...field}
									onChange={value =>
										form.setFieldValue(field.name, value)
									}
									step={1}
									min={-1}
									mb={6}
									size="sm"
									width={250}
								>
									<InputGroup size="sm">
										<InputLeftAddon children="Seed" />
										<NumberInputField />
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</InputGroup>
								</NumberInput>
							)}
						</Field>
						<HStack m={2}>
							<Button
								leftIcon={<MdBrush />}
								colorScheme="pink"
								size="lg"
								type="submit"
								disabled={!dirty || !isValid}
							>
								Generate
							</Button>
							<Button
								leftIcon={<FaCookieBite />}
								size="lg"
								variant="outline"
								disabled
							>
								Try my luck
							</Button>
						</HStack>

						<Text opacity={0.5} m={2}>
							{`${props.picturesGenerated} ${
								props.picturesGenerated == 1
									? "picture"
									: "pictures"
							} generated`}
						</Text>
					</Center>
				</Form>
			)}
		</Formik>
	);

	return formik;
}
