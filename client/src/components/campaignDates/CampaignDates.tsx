import { Stack, Flex, Text, Group, Box, MantineSize } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ReactNode } from "react";
import { startOfDay, isAfter, isBefore } from "date-fns";
import { IconAsterisk } from "@tabler/icons-react";

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
	required?: boolean;

	/** Optional minimum selectable date */
	minDate?: Date;
	/** Optional maximum selectable date */
	maxDate?: Date;

	/** When true, show only the "from" input and use it as both from & to */
	isSingleDate?: boolean;
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
	isSingleDate = false,
	required = false,
}: CampaignDatesProps) => {
	const norm = (d: Date | null) => (d ? startOfDay(d) : d);
	const minN = minDate ? startOfDay(minDate) : null;
	const maxN = maxDate ? startOfDay(maxDate) : null;

	const clampToBounds = (d: Date | null) => {
		if (!d) return d;
		const nd = startOfDay(d);
		if (minN && isBefore(nd, minN)) return minN;
		if (maxN && isAfter(nd, maxN)) return maxN;
		return nd;
	};

	const handleFromChange = (d: Date | null) => {
		let nextFrom = clampToBounds(d ? startOfDay(d) : d);
		let nextTo = norm(dateRange.to);

		if (isSingleDate) {
			onChange({ from: nextFrom, to: nextFrom });
			return;
		}

		// Enforce start <= end
		if (nextFrom && nextTo && isAfter(nextFrom, nextTo)) {
			nextTo = nextFrom;
		}

		onChange({ from: nextFrom, to: nextTo });
	};

	const handleToChange = (d: Date | null) => {
		let nextTo = clampToBounds(d ? startOfDay(d) : d);
		let nextFrom = norm(dateRange.from);

		// Enforce end >= start
		if (nextFrom && nextTo && isBefore(nextTo, nextFrom)) {
			nextFrom = nextTo;
		}

		onChange({ from: nextFrom, to: nextTo });
	};

	// ---- Dynamic picker constraints (disable dates outside range) ----
	const fromVal = norm(dateRange.from);
	const toVal = norm(dateRange.to);

	// For the START picker:
	//  - min is global min (minN)
	//  - max is the earlier of (global max, selected end date if present)
	const startMinDate = minN ?? undefined;
	const startMaxDate = (() => {
		if (toVal && maxN) {
			return isBefore(toVal, maxN) ? toVal : maxN;
		}
		return toVal ?? maxN ?? undefined;
	})();

	// For the END picker:
	//  - min is the later of (global min, selected start date if present)
	//  - max is global max (maxN)
	const endMinDate = (() => {
		if (fromVal && minN) {
			return isAfter(fromVal, minN) ? fromVal : minN;
		}
		return fromVal ?? minN ?? undefined;
	})();
	const endMaxDate = maxN ?? undefined;

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
					clearable
					size={inputSize}
					radius={10}
					valueFormat="DD MMM YYYY"
					leftSection={icon}
					value={dateRange.from}
					onChange={handleFromChange}
					label={
						<Group align="flex-start" gap={3}>
							<Text size={labelSize} c="gray.9" fw={500}>
								{startLabel}
							</Text>
							{required && <IconAsterisk size={9} color="red" />}
						</Group>
					}
					placeholder={startPlaceholder}
					minDate={startMinDate}
					maxDate={startMaxDate}
				/>

				{/* spacer for variant 2 (filters style) */}
				{!isSingleDate && gap < 15 && <Box w={10} />}

				{!isSingleDate && (
					<DateInput
						w="100%"
						pointer
						clearable
						size={inputSize}
						radius={10}
						valueFormat="DD MMM YYYY"
						leftSection={icon}
						value={dateRange.to}
						onChange={handleToChange}
						label={
							<Group align="flex-start" gap={3}>
								<Text size={labelSize} c="gray.9" fw={500}>
									{endLabel}
								</Text>
								{required && (
									<IconAsterisk size={9} color="red" />
								)}
							</Group>
						}
						placeholder={endPlaceholder}
						minDate={endMinDate}
						maxDate={endMaxDate}
					/>
				)}
			</Flex>
		</Stack>
	);
};

export default CampaignDates;
