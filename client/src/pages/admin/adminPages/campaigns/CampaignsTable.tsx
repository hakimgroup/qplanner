import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { ColDef } from "ag-grid-community";
import Table, { TableHandle } from "@/components/table/Table";
import {
	Badge,
	Button,
	Group,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import TierCell from "./TierCell";
import { activityColors } from "@/shared/shared.const";
import { BadgeList } from "@/components/badgeList/BadgeList";
import { formatAvailabilityForUI } from "@/shared/shared.utilities";
import { IconEdit } from "@tabler/icons-react";
import { startCase } from "lodash";

export type CampaignRow = {
	id: string;
	name: string;
	description?: string;
	category?: string;
	tiers?: string[] | null;
	status?: string | null;
	availability?: { from?: string | null; to?: string | null } | null;
	objectives?: string[];
	topics?: string[];
	updated_at?: string;
};

export type CampaignsTableHandle = {
	exportCsv: TableHandle["exportCsv"];
	getSelectedIds: () => string[];
};

const CampaignsTable = forwardRef<
	CampaignsTableHandle,
	{
		rows: CampaignRow[];
		loading?: boolean;
		onEdit: (row: CampaignRow) => void;
	}
>(function CampaignsTable({ rows, loading, onEdit }, ref) {
	const T = useMantineTheme().colors;
	const tableRef = useRef<TableHandle>(null);
	const selectedIdsRef = useRef<string[]>([]);

	useImperativeHandle(ref, () => ({
		exportCsv: (opts) => tableRef.current?.exportCsv?.(opts),
		getSelectedIds: () => selectedIdsRef.current,
	}));

	const cols: ColDef[] = [
		{
			field: "name",
			headerName: "Campaign",
			flex: 2, // grows on wide screens
			minWidth: 260, // don’t shrink below this
			tooltipField: "name",
			cellRenderer: ({ data }) => (
				<Stack gap={2}>
					<Text
						size="sm"
						fw={600}
						lineClamp={1}
						title={data?.name ?? ""}
					>
						{data?.name}
					</Text>
					<Text
						size="xs"
						c="gray.6"
						lineClamp={1}
						title={data?.description ?? ""}
					>
						{data?.description || "—"}
					</Text>
				</Stack>
			),
		},

		{
			field: "category",
			headerName: "Activity",
			width: 160,
			minWidth: 140,
			sortable: false,
			tooltipField: "category",
			cellRenderer: ({ value }) => (
				<Badge
					variant="light"
					color={activityColors[value]}
					size="sm"
					fw={700}
					style={{ border: `1px solid ${T.blue[0]}` }}
				>
					{startCase(value)}
				</Badge>
			),
		},

		{
			field: "tiers",
			headerName: "Tier",
			width: 200,
			minWidth: 170,
			sortable: false,
			filter: false,
			cellRenderer: (p) => <TierCell row={p.data} />,
		},

		{
			field: "objectives",
			headerName: "Objectives",
			flex: 1,
			minWidth: 200,
			sortable: false,
			filter: false,
			cellRenderer: ({ value }) => (
				<BadgeList items={Array.isArray(value) ? value : []} />
			),
		},

		{
			field: "topics",
			headerName: "Topics",
			flex: 1,
			minWidth: 220,
			sortable: false,
			filter: false,
			cellRenderer: ({ value }) => (
				<BadgeList
					items={Array.isArray(value) ? value : []}
					firstBadgeColor="gray.1"
					firstBadgeVariant="outline"
					firstBadgeTextColor="gray.9"
				/>
			),
		},

		{
			field: "availability",
			headerName: "Dates",
			width: 220,
			minWidth: 200,
			sortable: false,
			filter: false,
			valueGetter: (p) => {
				const v = p.data?.availability ?? null;
				return (
					formatAvailabilityForUI({
						from: v?.from ?? null,
						to: v?.to ?? null,
					}) || "—"
				);
			},
			cellRenderer: ({ value }) => (
				<Text size="xs" c="gray.9" fw={500} title={value ?? ""}>
					{value ?? "—"}
				</Text>
			),
		},

		{
			field: "actions",
			headerName: "Actions",
			pinned: "right",
			lockPinned: true,
			width: 130,
			minWidth: 120,
			sortable: false,
			filter: false,
			cellRenderer: ({ data }) => (
				<Group justify="flex-end">
					<Button
						size="xs"
						variant="light"
						leftSection={<IconEdit size={14} />}
						onClick={() => onEdit(data)}
					>
						Edit
					</Button>
				</Group>
			),
		},
	];

	return (
		<Table
			ref={tableRef}
			rows={rows}
			cols={cols}
			loading={loading}
			enableSelection
			height={550}
			onSelect={(selectedRows) => {
				selectedIdsRef.current = (selectedRows ?? [])
					.map((r: CampaignRow) => r?.id)
					.filter(Boolean);
			}}
		/>
	);
});

export default CampaignsTable;
