import { Stack, Flex, Text, Group, Box, MantineSize } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ReactNode } from "react";
import { startOfDay, isAfter, isBefore } from "date-fns";

interface CampaignDatesProps {
	title?: string;
	icon?: ReactNode;
	hideTitleIcon?: boolean;
	dateRange: { from: Date | null; to: Date | null };
	onChange: (range: { from: Date | null; to: Date | null }) => void;
	startLabel?: string;
	endLabel?: string;
	startPlaceholder?: string;
	endPlaceholder?: string;
	labelSize?: MantineSize;
	titleLabelSize?: MantineSize;
	inputSize?: MantineSize;
	gap?: number;

	/** Optional bounds: when BOTH are provided, user can only pick within [minDate, maxDate] */
	minDate?: Date;
	maxDate?: Date;
}

const CampaignDates = ({
	title,
	titleLabelSize = "sm",
	icon,
	hideTitleIcon,
	dateRange,
	onChange,
	startLabel = "Start Date",
	endLabel = "End Date",
	startPlaceholder = "Start Date",
	endPlaceholder = "End Date",
	labelSize = "sm",
	inputSize = "md",
	gap = 15,
	minDate,
	maxDate,
}: CampaignDatesProps) => {
	const hasBounds = !!minDate && !!maxDate;

	const norm = (d: Date | null) => (d ? startOfDay(d) : d);
	const minN = hasBounds ? startOfDay(minDate as Date) : null;
	const maxN = hasBounds ? startOfDay(maxDate as Date) : null;

	const clampToBounds = (d: Date | null) => {
		if (!hasBounds || !d) return d;
		const nd = startOfDay(d);
		if (isBefore(nd, minN!)) return minN;
		if (isAfter(nd, maxN!)) return maxN;
		return nd;
	};

	const handleFromChange = (d: Date | null) => {
		let nextFrom = clampToBounds(d ? startOfDay(d) : d);
		let nextTo = norm(dateRange.to);

		// Always enforce start <= end if both present
		if (nextFrom && nextTo && isAfter(nextFrom, nextTo)) {
			nextTo = nextFrom;
		}

		onChange({ from: nextFrom, to: nextTo });
	};

	const handleToChange = (d: Date | null) => {
		let nextTo = clampToBounds(d ? startOfDay(d) : d);
		let nextFrom = norm(dateRange.from);

		// Always enforce end >= start if both present
		if (nextFrom && nextTo && isBefore(nextTo, nextFrom)) {
			nextFrom = nextTo;
		}

		onChange({ from: nextFrom, to: nextTo });
	};

	return (
		<Stack gap={5}>
			{title && (
				<Group gap={8} align="center" mb={5}>
					{!hideTitleIcon && icon}
					{title && (
						<Text size={titleLabelSize} fw={500}>
							{title}
						</Text>
					)}
				</Group>
			)}

			<Flex align="center" justify="space-between" gap={gap}>
				<DateInput
					w="100%"
					pointer
					size={inputSize}
					radius={10}
					valueFormat="DD MMM YYYY"
					leftSection={icon}
					value={dateRange.from}
					onChange={handleFromChange}
					label={
						<Text size={labelSize} c="gray.9" fw={500}>
							{startLabel}
						</Text>
					}
					placeholder={startPlaceholder}
					{...(hasBounds ? { minDate: minN!, maxDate: maxN! } : {})}
				/>

				{/* spacer for variant 2 (filters style) */}
				{gap < 15 && <Box w={10}></Box>}

				<DateInput
					w="100%"
					pointer
					size={inputSize}
					radius={10}
					valueFormat="DD MMM YYYY"
					leftSection={icon}
					value={dateRange.to}
					onChange={handleToChange}
					label={
						<Text size={labelSize} c="gray.9" fw={500}>
							{endLabel}
						</Text>
					}
					placeholder={endPlaceholder}
					{...(hasBounds ? { minDate: minN!, maxDate: maxN! } : {})}
				/>
			</Flex>
		</Stack>
	);
};

export default CampaignDates;
