import {
	Box,
	Button,
	Flex,
	Icon,
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
	SliderThumb,
	SliderTrack,
	Tooltip,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { BiReset } from "react-icons/bi";

export default function SlimNumberInput(props: {
	name: string;
	min: number;
	max: number;
	default: number;
	icon: IconType;
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
	const showReset = props.field.value != props.default;
	const slimNumberInput = (
		<Flex flexDirection={"row"}>
			{props.slider ? (
				<>
					<InputGroup size={size}>
						<InputLeftAddon borderLeftRadius={4}>
							<Icon mr={2} as={props.icon} />
							{props.name}
						</InputLeftAddon>
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
						<InputRightAddon
							fontWeight={600}
							borderRightRadius={showReset ? 0 : 4}
						>
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
					ml={props.slider ? -2 : 0}
					borderLeftRadius={0}
					borderRightRadius={4}
					fontSize={12}
				>
					Reset
				</Button>
			) : null}
		</Flex>
	);

	return slimNumberInput;
}
