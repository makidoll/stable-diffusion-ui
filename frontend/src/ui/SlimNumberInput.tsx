import {
	Box,
	Button,
	Flex,
	InputGroup,
	InputLeftAddon,
	InputRightAddon,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Slider,
	SliderFilledTrack,
	SliderMark,
	SliderThumb,
	SliderTrack,
	Text,
	Tooltip,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import { Md10K } from "react-icons/md";

export default function SlimNumberInput(props: {
	name: string;
	min: number;
	max: number;
	default: number;
	icon: ReactElement;
	field: any;
	form: any;
	disabled?: boolean;
	width?: number;
	tooltip?: string;
	slider?: boolean;
	step?: number;
	prefix?: string;
}) {
	const size = "sm";
	const slimNumberInput = (
		<Flex flexDirection={"row"}>
			{props.slider ? (
				<>
					<InputGroup size={size}>
						<InputLeftAddon>{props.name}</InputLeftAddon>
						<Box borderWidth={1} px={2}>
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
						<InputRightAddon fontWeight={600}>
							{props.field.value +
								(props.prefix ? " " + props.prefix : "")}
						</InputRightAddon>
					</InputGroup>
				</>
			) : (
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
						<InputLeftAddon children={props.name} />
						<NumberInputField />
						<NumberInputStepper>
							<NumberIncrementStepper />
							<NumberDecrementStepper />
						</NumberInputStepper>
					</InputGroup>
				</NumberInput>
			)}
			{props.field.value != props.default ? (
				<Button
					colorScheme={"red"}
					size={size}
					leftIcon={props.icon}
					onClick={() => {
						props.form.setFieldValue(
							props.field.name,
							props.default,
						);
					}}
					disabled={props.disabled}
					ml={props.slider ? -3 : 0}
					borderLeftRadius={0}
					borderRightRadius={3}
				>
					Reset
				</Button>
			) : null}
		</Flex>
	);

	// return props.tooltip ? (
	// 	<Tooltip label={props.tooltip}>{slimNumberInput}</Tooltip>
	// ) : (
	// 	slimNumberInput
	// );

	return slimNumberInput;
}
