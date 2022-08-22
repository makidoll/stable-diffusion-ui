import {
	Box,
	Button,
	Flex,
	InputGroup,
	InputLeftAddon,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
} from "@chakra-ui/react";
import { ReactElement } from "react";

export default function SlimNumberInput(props: {
	name: string;
	default: number;
	icon: ReactElement;
	field: any;
	form: any;
	disabled?: boolean;
	width?: number;
}) {
	return (
		<Flex flexDirection={"row"}>
			{props.field.value != props.default ? (
				<Button
					colorScheme={"red"}
					size="xs"
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
				min={-1}
				size="xs"
				width={props.width ?? 250}
				disabled={props.disabled}
			>
				<InputGroup size="xs">
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
}
