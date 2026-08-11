import { useMemo } from "react";
import {
	ActionIcon,
	Box,
	Checkbox,
	Group,
	Paper,
	SegmentedControl,
	SimpleGrid,
	Stack,
	Text,
	Badge,
	useMantineTheme,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import {
	BespokeDeliverable,
	ChosenDeliverable,
} from "@/models/bespokeBrief.models";

export const keyOfDeliverable = (
	d: Pick<BespokeDeliverable, "channel" | "group" | "name">,
) => `${d.channel}:${d.group}:${d.name}`;

interface Props {
	catalog: BespokeDeliverable[];
	value: Record<string, ChosenDeliverable>;
	onChange: (next: Record<string, ChosenDeliverable>) => void;
	disabled?: boolean;
}

const CHANNELS: { key: "print" | "digital"; label: string }[] = [
	{ key: "print", label: "Print" },
	{ key: "digital", label: "Digital" },
];

/** Compact − / + quantity stepper. */
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
 * Hierarchical deliverables checklist — compact 2-column grid. Selected
 * items tint + reveal a control below the label (a − / + stepper for
 * quantity items, a segmented run picker for priced ones), so the modal
 * stays short. Live estimated total (priced items only) at the bottom.
 */
export default function BespokeDeliverablesPicker({
	catalog,
	value,
	onChange,
	disabled,
}: Props) {
	const T = useMantineTheme();

	// channel -> group -> items (catalog arrives pre-sorted by sort_order)
	const grouped = useMemo(() => {
		const out: Record<string, Record<string, BespokeDeliverable[]>> = {
			print: {},
			digital: {},
		};
		for (const d of catalog) {
			(out[d.channel][d.group] ??= []).push(d);
		}
		return out;
	}, [catalog]);

	const selectedCount = Object.keys(value).length;

	const toggle = (d: BespokeDeliverable, checked: boolean) => {
		const key = keyOfDeliverable(d);
		const next = { ...value };
		if (!checked) {
			delete next[key];
		} else {
			const opts = d.options ?? [];
			const hasOptions = opts.length > 0;
			next[key] = {
				key,
				channel: d.channel,
				group: d.group,
				name: d.name,
				quantity: hasOptions ? null : 1,
				optionLabel: hasOptions ? opts[0].label : null,
				price: hasOptions ? opts[0].value : (d.price ?? null),
			};
		}
		onChange(next);
	};

	const patch = (key: string, p: Partial<ChosenDeliverable>) =>
		onChange({ ...value, [key]: { ...value[key], ...p } });

	const renderCell = (d: BespokeDeliverable, useGroupName = false) => {
		const key = keyOfDeliverable(d);
		const chosen = value[key];
		const isChecked = !!chosen;
		const opts = d.options ?? [];
		const hasOptions = opts.length > 0;

		return (
			<Box
				key={key}
				px={8}
				py={7}
				style={{
					borderRadius: 8,
					border: `1px solid ${
						isChecked ? T.colors.blue[2] : "transparent"
					}`,
					background: isChecked ? T.colors.blue[0] : "transparent",
					transition: "background 0.12s, border-color 0.12s",
				}}
			>
				<Stack gap={6}>
					<Checkbox
						size="xs"
						radius="sm"
						color="blue.5"
						disabled={disabled}
						checked={isChecked}
						onChange={(e) => toggle(d, e.currentTarget.checked)}
						label={
							<Text size="sm" fw={500} c={isChecked ? "gray.9" : "gray.7"}>
								{useGroupName ? d.group : d.name}
							</Text>
						}
					/>

					{isChecked &&
						(hasOptions ? (
							<SegmentedControl
								fullWidth
								size="xs"
								radius="md"
								disabled={disabled}
								value={chosen.optionLabel ?? opts[0].label}
								onChange={(label) => {
									const opt = opts.find((o) => o.label === label);
									patch(key, {
										optionLabel: label,
										price: opt?.value ?? null,
									});
								}}
								data={opts.map((o) => ({
									value: o.label,
									label: `${o.label} · £${o.value.toFixed(2)}`,
								}))}
							/>
						) : (
							<Group justify="flex-end">
								<QtyStepper
									value={chosen.quantity ?? 1}
									disabled={disabled}
									onChange={(v) => patch(key, { quantity: v })}
								/>
							</Group>
						))}
				</Stack>
			</Box>
		);
	};

	return (
		<Stack gap={12}>
			{CHANNELS.map(({ key: channel, label }) => {
				const groups = grouped[channel];
				const groupNames = Object.keys(groups);
				if (groupNames.length === 0) return null;

				return (
					<Box key={channel}>
						<Text fw={700} size="sm" c="blue.5" tt="uppercase" mb={6}>
							{label}
						</Text>
						<Stack gap={10}>
							{groupNames.map((grp) => {
								const items = groups[grp];
								// Single item whose name == group (e.g. "Social Media").
								const flat = items.length === 1 && items[0].name === grp;

								if (flat) {
									return (
										<SimpleGrid key={grp} cols={{ base: 1, xs: 2 }}>
											{renderCell(items[0], true)}
										</SimpleGrid>
									);
								}

								return (
									<Box key={grp}>
										<Text size="xs" fw={600} c="gray.6" mb={4}>
											{grp}
										</Text>
										<SimpleGrid cols={{ base: 1, xs: 2 }} spacing={6} verticalSpacing={6}>
											{items.map((d) => renderCell(d))}
										</SimpleGrid>
									</Box>
								);
							})}
						</Stack>
						<GradientDivider my={10} />
					</Box>
				);
			})}

			<Paper
				p="sm"
				radius="md"
				bg={T.colors.blue[0]}
				style={{ border: `1px solid ${T.colors.blue[1]}` }}
			>
				<Badge color="blue" variant="light" size="lg">
					{selectedCount} selected
				</Badge>
			</Paper>
		</Stack>
	);
}
