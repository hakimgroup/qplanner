import Table, { SortModelEntry } from "@/components/table/Table";
import { ActionIcon, Badge, Text, useMantineTheme } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { ColDef } from "ag-grid-community";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { GodModeSearchRow } from "@/hooks/godMode.hooks";
import { statusColors } from "@/shared/shared.const";
import { startCase } from "lodash";

interface Props {
	rows: GodModeSearchRow[];
	loading: boolean;
	onRowClick: (row: GodModeSearchRow) => void;
	initialSortModel?: SortModelEntry[];
	onSortChanged?: (model: SortModelEntry[]) => void;
	/** Bumping this key forces the underlying table to remount and re-apply initialSortModel */
	resetKey?: number;
}

const formatDate = (d?: string | null) => {
	if (!d) return "—";
	try {
		return format(parseISO(d), "d MMM yyyy");
	} catch {
		return d;
	}
};

export default function GodModeResultsTable({
	rows,
	loading,
	onRowClick,
	initialSortModel,
	onSortChanged,
	resetKey,
}: Props) {
	const T = useMantineTheme().colors;

	const cols: ColDef[] = useMemo(
		() => [
			{
				field: "campaign_name",
				headerName: "Campaign",
				flex: 2,
				minWidth: 220,
				cellRenderer: ({ data }: any) => (
					<Text size="sm" fw={600} lineClamp={1}>
						{data?.campaign_name ?? "—"}
					</Text>
				),
			},
			{
				field: "practice_name",
				headerName: "Practice",
				flex: 1.5,
				minWidth: 180,
				cellRenderer: ({ value }: any) => (
					<Text size="sm" lineClamp={1}>
						{value ?? "—"}
					</Text>
				),
			},
			{
				field: "category",
				headerName: "Type",
				width: 120,
				cellRenderer: ({ data }: any) => (
					<Badge
						variant="light"
						color={data?.bespoke ? "violet" : "blue"}
						size="sm"
					>
						{data?.bespoke ? "Bespoke" : "Catalog"}
					</Badge>
				),
			},
			{
				field: "status",
				headerName: "Status",
				width: 160,
				cellRenderer: ({ value }: any) => (
					<Badge
						variant="light"
						color={(statusColors as any)[value] ?? "gray"}
						size="sm"
					>
						{startCase(value)}
					</Badge>
				),
			},
			{
				field: "from_date",
				headerName: "From",
				width: 130,
				valueGetter: (p: any) => formatDate(p.data?.from_date),
				cellRenderer: ({ value }: any) => (
					<Text size="xs" c="gray.7">
						{value}
					</Text>
				),
			},
			{
				field: "to_date",
				headerName: "To",
				width: 130,
				valueGetter: (p: any) => formatDate(p.data?.to_date),
				cellRenderer: ({ value }: any) => (
					<Text size="xs" c="gray.7">
						{value}
					</Text>
				),
			},
			{
				field: "updated_at",
				headerName: "Last Updated",
				width: 160,
				valueGetter: (p: any) => {
					if (!p.data?.updated_at) return "—";
					try {
						return format(parseISO(p.data.updated_at), "d MMM yyyy HH:mm");
					} catch {
						return p.data.updated_at;
					}
				},
				cellRenderer: ({ value }: any) => (
					<Text size="xs" c="gray.7">
						{value}
					</Text>
				),
			},
			{
				headerName: "",
				width: 70,
				pinned: "right",
				sortable: false,
				filter: false,
				cellRenderer: () => (
					<ActionIcon
						variant="light"
						color="violet"
						radius="xl"
						size="md"
						aria-label="Open selection"
					>
						<IconChevronRight size={16} />
					</ActionIcon>
				),
			},
		],
		[T]
	);

	return (
		<Table
			key={resetKey ?? 0}
			rows={rows}
			cols={cols}
			loading={loading}
			height={550}
			onRowClick={(row: GodModeSearchRow) => onRowClick(row)}
			initialSortModel={initialSortModel}
			onSortChanged={onSortChanged}
		/>
	);
}
