import { useMemo } from "react";
import {
	ActionIcon,
	Box,
	Checkbox,
	Group,
	SimpleGrid,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { IconMinus, IconPlus, IconAlertTriangle } from "@tabler/icons-react";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import {
	EventDeliverable,
	ChosenEventDeliverable,
} from "@/models/bespokeBrief.models";

export const keyOfEventDeliverable = (
	d: Pick<EventDeliverable, "channel" | "group" | "name">,
) => `${d.channel}:${d.group}:${d.name}`;

interface Props {
	catalog: EventDeliverable[];
	value: Record<string, ChosenEventDeliverable>;
	onChange: (next: Record<string, ChosenEventDeliverable>) => void;
	disabled?: boolean;
}

const CHANNELS: {
	key: "print" | "digital" | "direct_comms";
	label: string;
	help: string;
}[] = [
	{ key: "print", label: "Print", help: "Please write the quantity you require for each." },
	{ key: "digital", label: "Digital", help: "Please tick all that apply." },
	{ key: "direct_comms", label: "Direct Communications", help: "Please tick all that apply." },
];

function QtyStepper({
	value,
	onChange,
	disabled,
}: {
	value: number;
	onChange: (v: number) => void;
	disabled?: boolean;
}) {
	const T = useMantineTheme();
	return (
		<Group
			gap={0}
			wrap="nowrap"
			w={104}
			style={{
				border: `1px solid ${T.colors.blue[2]}`,
				borderRadius: 8,
				overflow: "hidden",
				background: "white",
			}}
		>
			<ActionIcon
				variant="subtle"
				color="blue"
				radius={0}
				size="sm"
				disabled={disabled || value <= 1}
				onClick={() => onChange(Math.max(1, value - 1))}
			>
				<IconMinus size={12} />
			</ActionIcon>
			<Text size="xs" fw={600} ta="center" style={{ flex: 1 }} c="gray.8">
				{value}
			</Text>
			<ActionIcon
				variant="subtle"
				color="blue"
				radius={0}
				size="sm"
				disabled={disabled}
				onClick={() => onChange(value + 1)}
			>
				<IconPlus size={12} />
			</ActionIcon>
		</Group>
	);
}

/**
 * Event deliverables — Print (quantity steppers), Digital & Direct
 * Communications (tick-only). Per-item disclaimers (e.g. paid social) show
 * inline. Print in a compact 2-column grid; tick channels as single-column
 * lists (their labels are long).
 */
export default function EventDeliverablesPicker({
	catalog,
	value,
	onChange,
	disabled,
}: Props) {
	const T = useMantineTheme();

	const grouped = useMemo(() => {
		const out: Record<string, Record<string, EventDeliverable[]>> = {
			print: {},
			digital: {},
			direct_comms: {},
		};
		for (const d of catalog) {
			(out[d.channel][d.group] ??= []).push(d);
		}
		return out;
	}, [catalog]);

	const toggle = (d: EventDeliverable, checked: boolean) => {
		const key = keyOfEventDeliverable(d);
		const next = { ...value };
		if (!checked) {
			delete next[key];
		} else {
			next[key] = {
				key,
				channel: d.channel,
				group: d.group,
				name: d.name,
				input_mode: d.input_mode,
				quantity: d.input_mode === "quantity" ? 1 : null,
			};
		}
		onChange(next);
	};

	const setQty = (key: string, quantity: number) =>
		onChange({ ...value, [key]: { ...value[key], quantity } });

	const renderItem = (d: EventDeliverable) => {
		const key = keyOfEventDeliverable(d);
		const chosen = value[key];
		const isChecked = !!chosen;
		const isQty = d.input_mode === "quantity";

		return (
			<Box
				key={key}
				px={8}
				py={7}
				style={{
					borderRadius: 8,
					border: `1px solid ${isChecked ? T.colors.blue[2] : "transparent"}`,
					background: isChecked ? T.colors.blue[0] : "transparent",
					transition: "background 0.12s, border-color 0.12s",
				}}
			>
				<Group justify="space-between" wrap="nowrap" gap="sm" align="flex-start">
					<Checkbox
						size="xs"
						radius="sm"
						color="blue.5"
						disabled={disabled}
						checked={isChecked}
						onChange={(e) => toggle(d, e.currentTarget.checked)}
						label={
							<Text size="sm" fw={500} c={isChecked ? "gray.9" : "gray.7"}>
								{d.name}
							</Text>
						}
					/>
					{isQty && isChecked && (
						<QtyStepper
							value={chosen.quantity ?? 1}
							disabled={disabled}
							onChange={(v) => setQty(key, v)}
						/>
					)}
				</Group>

				{d.disclaimer && (
					<Group gap={6} wrap="nowrap" mt={6} pl={26} align="flex-start">
						<IconAlertTriangle
							size={13}
							color={T.colors.orange[6]}
							style={{ marginTop: 2, flexShrink: 0 }}
						/>
						<Text size="xs" c="orange.8" style={{ lineHeight: 1.4 }}>
							{d.disclaimer}
						</Text>
					</Group>
				)}
			</Box>
		);
	};

	return (
		<Stack gap={14}>
			{CHANNELS.map(({ key: channel, label, help }) => {
				const groups = grouped[channel];
				const groupNames = Object.keys(groups);
				if (groupNames.length === 0) return null;

				const isPrint = channel === "print";

				return (
					<Box key={channel}>
						<Text fw={700} size="sm" c="blue.5" tt="uppercase">
							{label}
						</Text>
						<Text size="xs" c="gray.5" mb={8}>
							{help}
						</Text>
						<Stack gap={10}>
							{groupNames.map((grp) => {
								const items = groups[grp];
								const showGroupHeader =
									!(items.length === 1 && items[0].name === grp) &&
									grp !== label &&
									grp !== "Direct Communications";
								return (
									<Box key={grp}>
										{showGroupHeader && (
											<Text size="xs" fw={600} c="gray.6" mb={4}>
												{grp}
											</Text>
										)}
										{isPrint ? (
											<SimpleGrid cols={{ base: 1, xs: 2 }} spacing={6} verticalSpacing={6}>
												{items.map(renderItem)}
											</SimpleGrid>
										) : (
											<Stack gap={4}>{items.map(renderItem)}</Stack>
										)}
									</Box>
								);
							})}
						</Stack>
						<GradientDivider my={10} />
					</Box>
				);
			})}
		</Stack>
	);
}
