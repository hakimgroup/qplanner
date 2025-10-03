import { useUpdateCampaignTier } from "@/hooks/campaign.hooks";
import { MultiSelect, Tooltip, useMantineTheme, Text } from "@mantine/core";
import { tiers } from "@/filters.json";
import { useMemo } from "react";

type TierValue = "good" | "better" | "best";

export default function TierCell({
	row,
}: {
	row: {
		id: string;
		tiers?: TierValue[] | null; // new multi-tier
	};
}) {
	const C = useMantineTheme().colors;
	const { mutate: updateTier, isPending } = useUpdateCampaignTier();

	// Normalize to an array for the UI
	const selected: TierValue[] = useMemo(() => {
		if (Array.isArray(row.tiers))
			return row.tiers.filter(Boolean) as TierValue[];
		return [];
	}, [row.tiers]);

	const hasSelection = selected.length > 0;

	return (
		<Tooltip
			label={
				<Text key={row.id} size="xs" fw={500} c="gray.9">
					Assign Good / Better / Best (clear to unset; multi-select
					allowed)
				</Text>
			}
			withArrow
			style={{ border: `1px solid ${C.blue[1]}` }}
			bg={"blue.0"}
		>
			<MultiSelect
				value={selected}
				data={tiers}
				// placeholder="No tier"
				clearable
				searchable={false}
				radius="md"
				size="xs"
				w={170}
				variant={hasSelection ? "filled" : "default"}
				styles={{
					input: { fontWeight: hasSelection ? 700 : 400 },
				}}
				onChange={(values) => {
					// Treat empty array as "no tier"
					const next = Array.isArray(values)
						? (values as TierValue[])
						: [];
					// Send null for none; otherwise the array of tiers
					updateTier({
						id: row.id,
						tiers: next.length ? next : null,
					} as any);
				}}
				disabled={isPending}
			/>
		</Tooltip>
	);
}
