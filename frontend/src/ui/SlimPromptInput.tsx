import {
	Box,
	Button,
	Flex,
	Heading,
	Icon,
	InputGroup,
	InputLeftAddon,
	InputRightAddon,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Select,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Text,
	Tooltip,
} from "@chakra-ui/react";
import { IconType } from "react-icons";

export default function SlimPromptInput(props: {
	name: string;
	min?: number;
	max?: number;
	default: any;
	icon: IconType;
	field: any;
	form: any;
	disabled?: boolean;
	width?: number;
	tooltip?: string;
	step?: number;
	prefix?: string;
	type?: "slider" | "dropdown";
	values?: string[];
}) {
	const size = "sm";
	const showReset = props.field.value != props.default;

	// TODO: lower opacity of text when disabled

	const slimPromptInput = (
		<Flex flexDirection={"row"}>
			{props.type == null ? (
				<NumberInput
					{...props.field}
					onChange={value =>
						props.form.setFieldValue(props.field.name, value)
					}
					step={props.step ?? 1}
					min={props.min}
					max={props.max}
					size={size}
					width={props.width ?? 250}
					disabled={props.disabled}
				>
					<InputGroup size={size}>
						<InputLeftAddon borderLeftRadius={4}>
							<Icon mr={2} as={props.icon} />
							{props.name}
						</InputLeftAddon>
						<Box>
							<NumberInputField
								borderRadius={0}
								borderRightRadius={showReset ? 0 : 4}
							/>
						</Box>
						<NumberInputStepper>
							<NumberIncrementStepper />
							<NumberDecrementStepper />
						</NumberInputStepper>
					</InputGroup>
				</NumberInput>
			) : (
				<>
					<InputGroup size={size} mr={showReset ? -1.5 : 0}>
						<InputLeftAddon borderLeftRadius={4}>
							<Icon mr={2} as={props.icon} />
							{props.name}
						</InputLeftAddon>
						{props.type == "slider" ? (
							<Box borderWidth={1} px={3}>
								<Box mt={1}>
									<Slider
										{...props.field}
										onChange={value =>
											props.form.setFieldValue(
												props.field.name,
												value,
											)
										}
										colorScheme="pink"
										step={props.step ?? 1}
										min={props.min}
										max={props.max}
										size={"md"}
										width={props.width ?? 200}
										isDisabled={props.disabled}
									>
										<SliderTrack>
											<SliderFilledTrack />
										</SliderTrack>
										<SliderThumb />
									</Slider>
								</Box>
							</Box>
						) : (
							<Select
								{...props.field}
								size={size}
								borderRightRadius={showReset ? 0 : 4}
								width={props.width ?? 200}
								disabled={props.disabled}
							>
								{props.values.map((value, i) => (
									<option key={i} value={value}>
										{value}
									</option>
								))}
							</Select>
						)}
						{props.type != "dropdown" ? (
							<InputRightAddon
								fontWeight={600}
								borderRightRadius={showReset ? 0 : 4}
							>
								{props.field.value +
									(props.prefix ? " " + props.prefix : "")}
							</InputRightAddon>
						) : null}
					</InputGroup>
				</>
			)}

			{showReset ? (
				<Button
					colorScheme={"red"}
					size={size}
					onClick={() => {
						props.form.setFieldValue(
							props.field.name,
							props.default,
						);
					}}
					disabled={props.disabled}
					borderLeftRadius={0}
					borderRightRadius={4}
					fontSize={12}
				>
					Reset
				</Button>
			) : null}
		</Flex>
	);

	const slimPromptInputWithResetOutline = (
		<Box
			boxShadow={
				showReset ? "0 0 0 1px var(--chakra-colors-red-200)" : null
			}
			borderRadius={4}
		>
			{slimPromptInput}
		</Box>
	);

	return props.tooltip ? (
		<Tooltip label={props.tooltip}>
			{slimPromptInputWithResetOutline}
		</Tooltip>
	) : (
		slimPromptInputWithResetOutline
	);
}
