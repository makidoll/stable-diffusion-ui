import { Badge, Box, Button, HStack, Input, VStack } from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import { Field, Form, Formik, FormikProps } from "formik";
import { MutableRefObject } from "react";
import { BsBarChartSteps } from "react-icons/bs";
import { FaSeedling } from "react-icons/fa";
import { MdCloud } from "react-icons/md";
import { Consts } from "../consts";
import { Prompt } from "../interfaces/Prompt";
import { Result } from "../interfaces/Result";
import SlimNumberInput from "./SlimNumberInput";

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
			initialValues={Consts.promptDefaults}
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
										<SlimNumberInput
											name={"Seed"}
											min={-1}
											max={Number.MAX_SAFE_INTEGER}
											default={Consts.promptDefaults.seed}
											icon={<FaSeedling />}
											field={field}
											form={form}
											disabled={isSubmitting}
											width={200}
										/>
									)}
								</Field>
								<Field name="inferenceSteps">
									{({ field, form }) => (
										<SlimNumberInput
											name={"Inf. Steps"}
											min={50}
											max={150}
											default={
												Consts.promptDefaults
													.inferenceSteps
											}
											icon={<BsBarChartSteps />}
											field={field}
											form={form}
											disabled={isSubmitting}
											width={200}
											tooltip={
												"50 works best, but 150 for highest detail"
											}
										/>
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
