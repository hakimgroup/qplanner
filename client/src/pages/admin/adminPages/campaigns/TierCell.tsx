import { useUpdateCampaignTier } from "@/hooks/campaign.hooks";
import { Select, Tooltip, useMantineTheme, Text } from "@mantine/core";
import { tiers } from "@/filters.json";

export default function TierCell({
	row,
}: {
	row: { id: string; tier?: "good" | "better" | "best" | null };
}) {
	const C = useMantineTheme().colors;
	const { mutate: updateTier, isPending } = useUpdateCampaignTier();

	return (
		<Tooltip
			label={
				<Text key={row.id} size="xs" fw={500} c="gray.9">
					Assign Good / Better / Best (clear to unset)
				</Text>
			}
			withArrow
			style={{ border: `1px solid ${C.blue[1]}` }}
			bg={"blue.0"}
		>
			<Select
				fw={row.tier ? 700 : 400}
				variant={row.tier ? "filled" : "default"}
				size="xs"
				radius="md"
				placeholder="No tier"
				data={tiers}
				value={row.tier ?? null}
				onChange={(v) => {
					updateTier({ id: row.id, tier: v as any });
				}}
				clearable
				searchable={false}
				disabled={isPending}
				w={190}
			/>
		</Tooltip>
	);
}
