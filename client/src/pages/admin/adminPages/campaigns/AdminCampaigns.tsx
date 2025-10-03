import {
	Card,
	Grid,
	Stack,
	Title,
	Text,
	TextInput,
	Select,
	Group,
	useMantineTheme,
} from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useContext, useMemo, useRef, useState } from "react";
import StyledButton from "@/components/styledButton/StyledButton";
import { useCampaignsCatalog } from "@/hooks/campaign.hooks";
import CampaignModal from "./CampaignModal";
import CampaignsFilters from "./CampaignsFilters";
import CampaignsTable, { CampaignsTableHandle } from "./CampaignsTable";
import AppContext from "@/shared/AppContext";
import { startCase } from "lodash";

export default function AdminCampaigns() {
	const T = useMantineTheme().colors;
	const [opened, setOpened] = useState(false);
	const tableRef = useRef<CampaignsTableHandle>(null);
	const [row, setRow] = useState(null);
	const {
		state: { filtersOptions },
	} = useContext(AppContext);

	// filters (server-side-ish; adapt as you wish)
	const [category, setCategory] = useState<string | null>("all");
	const [status, setStatus] = useState<string | null>("all");
	const [tier, setTier] = useState<string | null>("all");

	// local search
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 250);

	const { data, isFetching } = useCampaignsCatalog({
		category: category === "all" ? null : category,
		status: status === "all" ? null : status,
		tier: tier === "all" ? null : tier,
		q: debounced || null,
	});

	const rows = useMemo(() => data ?? [], [data]);

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Title order={1}>Campaigns Catalog</Title>
				<Text c="gray.6">
					Manage catalog campaigns, metadata and tiers
				</Text>
			</Stack>

			{/* Filters */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={15}>
					<Grid align="end">
						<Grid.Col span={8}>
							<TextInput
								radius={10}
								size="sm"
								placeholder="Search name, description, objectives, topics…"
								leftSection={<IconSearch size={18} />}
								value={query}
								onChange={(e) =>
									setQuery(e.currentTarget.value)
								}
							/>
						</Grid.Col>
						<Grid.Col span={2}>
							<Select
								radius={10}
								size="sm"
								label="Activity"
								data={[
									{ label: "All", value: "all" },
									...filtersOptions?.categories.map(
										(c: string) => ({
											label: startCase(c),
											value: c,
										})
									),
								]}
								value={category}
								onChange={setCategory}
							/>
						</Grid.Col>
						<Grid.Col span={2}>
							<Select
								radius={10}
								size="sm"
								label="Tier"
								data={[
									{ label: "All", value: "all" },
									{ label: "Good", value: "good" },
									{ label: "Better", value: "better" },
									{ label: "Best", value: "best" },
								]}
								value={tier}
								onChange={setTier}
							/>
						</Grid.Col>
					</Grid>
				</Stack>
			</Card>

			{/* Table + toolbar */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Group justify="space-between" mb={15}>
					<Text size="sm" c="blue.4" fw={600}>
						Showing {rows.length} campaign
						{rows.length === 1 ? "" : "s"}
					</Text>
					<StyledButton
						leftSection={<IconPlus size={16} />}
						onClick={() => setOpened(true)}
					>
						Add Campaign
					</StyledButton>
				</Group>

				<CampaignsFilters tableRef={tableRef} />

				<CampaignsTable
					ref={tableRef}
					rows={rows}
					loading={isFetching}
					onEdit={(r) => {
						setRow(r);
						setOpened(true);
					}}
				/>
			</Card>

			{/* Add/Edit modal (shared) */}
			{opened && (
				<CampaignModal
					row={row}
					opened={opened}
					onClose={() => {
						setOpened(false);
						setRow(null);
					}}
				/>
			)}
		</Stack>
	);
}
