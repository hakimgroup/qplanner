import { Box, Button, Group, ActionIcon, Select, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconTrash, IconPlus, IconCalendar, IconClock } from "@tabler/icons-react";
import { format, isValid } from "date-fns";
import { DateSlot } from "@/models/bespokeBrief.models";

/** 15-minute time options across the day. value = 24h "HH:mm", label = 12h AM/PM. */
const TIME_OPTIONS = (() => {
	const out: { value: string; label: string }[] = [];
	for (let h = 0; h < 24; h++) {
		for (let m = 0; m < 60; m += 15) {
			const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
			const period = h < 12 ? "AM" : "PM";
			const h12 = h % 12 === 0 ? 12 : h % 12;
			out.push({ value, label: `${h12}:${String(m).padStart(2, "0")} ${period}` });
		}
	}
	return out;
})();

interface Props {
	slots: DateSlot[];
	onChange: (slots: DateSlot[]) => void;
	minDate?: Date;
	maxDate?: Date;
	disabled?: boolean;
}

const emptySlot: DateSlot = { date: "", start: "", end: "" };

/**
 * One or more date/time slots for an event. Each slot = date + start + end.
 * The parent derives the overall from/to (min/max date) for the existing
 * schema; the detailed slots go into brief.date_slots.
 */
export default function EventDateSlots({
	slots,
	onChange,
	minDate,
	maxDate,
	disabled,
}: Props) {
	const patch = (i: number, p: Partial<DateSlot>) =>
		onChange(slots.map((s, idx) => (idx === i ? { ...s, ...p } : s)));
	const add = () => onChange([...slots, { ...emptySlot }]);
	const remove = (i: number) => onChange(slots.filter((_, idx) => idx !== i));

	return (
		<Box>
			<Group gap={6} mb={4} align="flex-start">
				<Text size="md" c="gray.9" fw={500}>
					Date(s) and time(s) of the event
				</Text>
				<Text component="span" c="red">
					*
				</Text>
			</Group>
			<Text size="xs" c="gray.5" mb={10}>
				If your event runs over multiple days with different opening hours,
				add a slot for each.
			</Text>

			<Box>
				{/* Column headers */}
				<Group gap={8} wrap="nowrap" mb={4} px={2}>
					<Text flex={1} size="xs" fw={600} c="gray.6">
						Date
					</Text>
					<Text w={130} size="xs" fw={600} c="gray.6">
						Start time
					</Text>
					<Text w={130} size="xs" fw={600} c="gray.6">
						End time
					</Text>
					<Box w={36} />
				</Group>

				{slots.map((slot, i) => (
					<Group key={i} gap={8} wrap="nowrap" mb={8} align="flex-end">
						<DateInput
							flex={1}
							radius={10}
							size="sm"
							placeholder="Pick a date"
							valueFormat="ddd D MMM YYYY"
							leftSection={<IconCalendar size={15} />}
							minDate={minDate}
							maxDate={maxDate}
							disabled={disabled}
							value={slot.date && isValid(new Date(slot.date)) ? new Date(slot.date) : null}
							onChange={(d) =>
								patch(i, {
									date: d && isValid(new Date(d)) ? format(new Date(d), "yyyy-MM-dd") : "",
								})
							}
						/>
						<Select
							radius={10}
							size="sm"
							w={130}
							aria-label="Start time"
							placeholder="Start"
							searchable
							maxDropdownHeight={220}
							leftSection={<IconClock size={14} />}
							data={TIME_OPTIONS}
							disabled={disabled}
							value={slot.start || null}
							onChange={(v) => patch(i, { start: v ?? "" })}
							nothingFoundMessage="No match"
						/>
						<Select
							radius={10}
							size="sm"
							w={130}
							aria-label="End time"
							placeholder="End"
							searchable
							maxDropdownHeight={220}
							leftSection={<IconClock size={14} />}
							data={TIME_OPTIONS}
							disabled={disabled}
							value={slot.end || null}
							onChange={(v) => patch(i, { end: v ?? "" })}
							nothingFoundMessage="No match"
						/>
						<ActionIcon
							color="red"
							variant="subtle"
							size="lg"
							radius={10}
							disabled={disabled || slots.length <= 1}
							onClick={() => remove(i)}
							aria-label="Remove date"
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Group>
				))}
			</Box>

			<Button
				variant="light"
				color="blue"
				radius={10}
				size="xs"
				mt={4}
				leftSection={<IconPlus size={14} />}
				disabled={disabled}
				onClick={add}
			>
				Add a new date
			</Button>
		</Box>
	);
}
