import { Group, Select } from "@mantine/core";
import StyledButton from "@/components/styledButton/StyledButton";
import { IconDownload } from "@tabler/icons-react";
import { useBulkUpdateCampaignTier } from "@/hooks/campaign.hooks";
import { CampaignsTableHandle } from "./CampaignsTable";
import { tiers } from "@/filters.json";

export default function CampaignsFilters({
	tableRef,
}: {
	tableRef: React.RefObject<CampaignsTableHandle>;
}) {
	const { mutate: bulkTier, isPending } = useBulkUpdateCampaignTier();

	return (
		<Group justify="space-between" mb="sm">
			<Group gap="xs">
				<Select
					radius={10}
					placeholder="Bulk set tier…"
					data={tiers}
					onChange={(tier) => {
						const ids = tableRef.current?.getSelectedIds() ?? [];
						if (!tier || ids.length === 0) return;
						bulkTier({ ids, tier });
					}}
				/>
			</Group>

			<StyledButton
				fw={500}
				variant="default"
				leftSection={<IconDownload size={16} />}
				onClick={() =>
					tableRef.current?.exportCsv({
						fileName: "campaigns.csv",
						columnKeys: ["name", "category", "tier", "status"],
					})
				}
			>
				Export CSV
			</StyledButton>
		</Group>
	);
}
