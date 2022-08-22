import {
	Badge,
	Box,
	Button,
	HStack,
	Input,
	InputGroup,
	InputLeftAddon,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	VStack,
} from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import { Field, Form, Formik, FormikProps } from "formik";
import { MutableRefObject } from "react";
import { FaSeedling } from "react-icons/fa";
import { MdCloud } from "react-icons/md";
import { Prompt } from "../interfaces/Prompt";
import { Result } from "../interfaces/Result";

export default function PromptInput(props: {
	promptFormRef?: MutableRefObject<FormikProps<Prompt>>;
	onPrompt?: (prompt: Prompt) => any;
	resultForDisplay?: Result;
	width?: string;
}) {
	const validatePrompt = (value: string) => {
		if ((value ?? "").trim() == "") return "Can't be empty!";
	};

	return (
		<Formik
			initialValues={{
				prompt: "",
				seed: -1,
			}}
			initialErrors={{ prompt: "Can't be empty!" }}
			onSubmit={props.onPrompt}
			innerRef={props.promptFormRef}
		>
			{form => {
				const { isValid, isSubmitting } = form;
				return (
					<Form style={{ width: props.width }}>
						<VStack flexGrow="1">
							<Field name="prompt" validate={validatePrompt}>
								{({ field }) => (
									<Input
										{...field}
										placeholder="Squirrel scientists in the high energy nut research laboratory"
										size="lg"
										disabled={isSubmitting}
									/>
								)}
							</Field>
							<HStack w="100%">
								<Field name="seed">
									{({ field, form }) => (
										<>
											{field.value != -1 ? (
												<Button
													colorScheme={"red"}
													size="sm"
													leftIcon={<FaSeedling />}
													onClick={() => {
														form.setFieldValue(
															"seed",
															-1,
														);
													}}
													disabled={isSubmitting}
												>
													Reset
												</Button>
											) : null}
											<NumberInput
												{...field}
												onChange={value =>
													form.setFieldValue(
														field.name,
														value,
													)
												}
												step={1}
												min={-1}
												size="sm"
												width={250}
												disabled={isSubmitting}
											>
												<InputGroup size="sm">
													<InputLeftAddon
														children="Seed"
														borderRadius={4}
													/>
													<NumberInputField
														borderRadius={4}
													/>
													<NumberInputStepper>
														<NumberIncrementStepper />
														<NumberDecrementStepper />
													</NumberInputStepper>
												</InputGroup>
											</NumberInput>
										</>
									)}
								</Field>
								<Box flexGrow={1}></Box>
								{props.resultForDisplay ? (
									<Box pr={2}>
										<Badge colorScheme={"pink"}>
											{formatRelative(
												new Date(
													props.resultForDisplay.created,
												),
												new Date(),
											)}
										</Badge>
									</Box>
								) : null}
								<Button
									leftIcon={<MdCloud />}
									colorScheme="pink"
									size="sm"
									type="submit"
									loadingText="Dreaming"
									isLoading={isSubmitting}
									disabled={!isValid || isSubmitting}
								>
									Dream
								</Button>
							</HStack>
						</VStack>
					</Form>
				);
			}}
		</Formik>
	);
}
