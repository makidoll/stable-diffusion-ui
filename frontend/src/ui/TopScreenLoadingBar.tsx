import { Progress } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function TopScreenLoadingBar(props: {
	enabled: boolean;
	startTime: number;
	endTime: number;
}) {
	const [progress, setProgress] = useState(0);
	const [intervalId, setIntervalId] = useState<number>(null);

	useEffect(() => {
		if (props.enabled) {
			setIntervalId(
				setInterval(() => {
					const total = props.endTime - props.startTime;
					const current = Date.now() - props.startTime;
					const percentage = (current / total) * 100;
					setProgress(
						percentage < 0
							? 0
							: percentage > 100
							? 100
							: percentage,
					);
				}, 1000 / 60),
			);
		} else {
			if (intervalId) {
				clearInterval(intervalId);
				setIntervalId(null);
			}
			setProgress(0);
		}
	}, [props.enabled]);

	return props.enabled ? (
		<Progress
			h="1"
			mb="-1"
			value={progress}
			// isIndeterminate
			colorScheme="pink"
		/>
	) : null;
}
