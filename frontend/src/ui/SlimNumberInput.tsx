import {
	Button,
	Flex,
	InputGroup,
	InputLeftAddon,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Tooltip,
} from "@chakra-ui/react";
import { ReactElement } from "react";

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
}) {
	const size = "sm";
	const slimNumberInput = (
		<Flex flexDirection={"row"}>
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
					mr={0}
					borderRightRadius={0}
				>
					Reset
				</Button>
			) : null}
			<NumberInput
				{...props.field}
				onChange={value =>
					props.form.setFieldValue(props.field.name, value)
				}
				step={1}
				min={props.min}
				max={props.max}
				size={size}
				width={props.width ?? 250}
				disabled={props.disabled}
			>
				<InputGroup size={size}>
					<InputLeftAddon children={props.name} />
					<NumberInputField borderRightRadius={4} />
					<NumberInputStepper>
						<NumberIncrementStepper />
						<NumberDecrementStepper />
					</NumberInputStepper>
				</InputGroup>
			</NumberInput>
		</Flex>
	);

	return props.tooltip ? (
		<Tooltip label={props.tooltip}>{slimNumberInput}</Tooltip>
	) : (
		slimNumberInput
	);
}
