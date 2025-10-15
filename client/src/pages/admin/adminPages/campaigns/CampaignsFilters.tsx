import { Button, Group, Select } from "@mantine/core";
import StyledButton from "@/components/styledButton/StyledButton";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import {
	useBulkUpdateCampaignTier,
	useBulkDeleteCampaigns,
} from "@/hooks/campaign.hooks";
import { CampaignsTableHandle } from "./CampaignsTable";
import { tiers } from "@/filters.json";

export default function CampaignsFilters({
	tableRef,
	selectedIds = [],
}: {
	tableRef: React.RefObject<CampaignsTableHandle>;
	selectedIds?: string[];
}) {
	const { mutate: bulkTier, isPending } = useBulkUpdateCampaignTier();
	const { mutate: bulkDelete, isPending: deleting } =
		useBulkDeleteCampaigns();

	const hasSelection = selectedIds.length > 0;

	return (
		<Group justify="space-between" mb="sm">
			<Group gap="xs">
				<Select
					radius={10}
					placeholder="Bulk set tier…"
					data={tiers}
					disabled={isPending}
					onChange={(tier) => {
						if (!tier || !hasSelection) return;
						bulkTier({ ids: selectedIds, tier });
					}}
				/>

				{hasSelection && (
					<Button
						color="red"
						variant="light"
						leftSection={<IconTrash size={16} />}
						loading={deleting}
						onClick={() => {
							bulkDelete(
								{ ids: selectedIds },
								{
									onSuccess: () => {
										// tableRef.current?.refresh()
									},
								}
							);
						}}
					>
						Delete Selected Campaigns
					</Button>
				)}
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
