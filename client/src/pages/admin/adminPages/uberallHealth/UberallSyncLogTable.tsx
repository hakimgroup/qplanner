import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { ColDef } from "ag-grid-community";
import Table, { TableHandle } from "@/components/table/Table";
import { Badge, Stack, Text, useMantineTheme } from "@mantine/core";
import { format } from "date-fns";

export type UberallLogRow = {
	id: string;
	user_email: string | null;
	uberall_user_id: string | null;
	action: string;
	status: string;
	source: string | null;
	requested_scope: number[] | null;
	error_message: string | null;
	created_at: string;
};

export type UberallSyncLogTableHandle = {
	exportCsv: TableHandle["exportCsv"];
};

const STATUS_COLOR: Record<string, string> = {
	synced: "teal",
	failed: "red",
	skipped: "gray",
	attempted: "yellow",
};

const ACTION_COLOR: Record<string, string> = {
	provision: "blue",
	sync: "violet",
	deprovision: "orange",
	sso: "grape",
	resolve: "cyan",
};

const UberallSyncLogTable = forwardRef<
	UberallSyncLogTableHandle,
	{ rows: UberallLogRow[]; loading?: boolean; height?: number }
>(function UberallSyncLogTable({ rows, loading, height = 600 }, ref) {
	const T = useMantineTheme().colors;
	const tableRef = useRef<TableHandle>(null);

	useImperativeHandle(ref, () => ({
		exportCsv: (opts) => tableRef.current?.exportCsv?.(opts),
	}));

	const cols: ColDef[] = useMemo(
		() => [
			{
				field: "created_at",
				headerName: "When",
				width: 170,
				minWidth: 150,
				valueGetter: (p) => {
					const d = p.data?.created_at ? new Date(p.data.created_at) : null;
					return d ? format(d, "dd MMM, HH:mm:ss") : "—";
				},
				cellRenderer: ({ value }: { value: string }) => (
					<Text size="xs" c="gray.6" fw={500} title={value ?? ""}>
						{value ?? "—"}
					</Text>
				),
			},
			{
				field: "action",
				headerName: "Action",
				width: 130,
				minWidth: 110,
				cellRenderer: ({ value }: { value: string }) => (
					<Badge variant="outline" color={ACTION_COLOR[value] ?? "gray"} size="sm">
						{value}
					</Badge>
				),
			},
			{
				field: "status",
				headerName: "Status",
				width: 130,
				minWidth: 110,
				cellRenderer: ({ value }: { value: string }) => (
					<Badge
						variant="light"
						color={STATUS_COLOR[value] ?? "gray"}
						size="sm"
						fw={700}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						{value}
					</Badge>
				),
			},
			{
				field: "user_email",
				headerName: "User",
				flex: 1,
				minWidth: 200,
				cellRenderer: ({ value }: { value: string | null }) => (
					<Text size="xs" lineClamp={1} title={value ?? ""}>
						{value ?? "—"}
					</Text>
				),
			},
			{
				field: "source",
				headerName: "Source",
				width: 130,
				minWidth: 110,
				cellRenderer: ({ value }: { value: string | null }) => (
					<Badge variant="outline" color="gray" size="sm">
						{value ?? "—"}
					</Badge>
				),
			},
			{
				field: "requested_scope",
				headerName: "Scope",
				width: 150,
				minWidth: 120,
				cellRenderer: ({ value }: { value: number[] | null }) => (
					<Text size="xs" c="gray.6" lineClamp={1}>
						{Array.isArray(value) ? `[${value.join(", ")}]` : "—"}
					</Text>
				),
			},
			{
				field: "error_message",
				headerName: "Detail",
				flex: 1,
				minWidth: 200,
				cellRenderer: ({ value }: { value: string | null }) =>
					value ? (
						<Text size="xs" c="red.6" lineClamp={1} title={value}>
							{value}
						</Text>
					) : (
						<Text size="xs" c="gray.5">
							—
						</Text>
					),
			},
		],
		[T.blue]
	);

	return (
		<Stack gap={0}>
			<Table
				ref={tableRef}
				rows={rows}
				cols={cols}
				loading={loading}
				height={height}
				pagination
				initialSortModel={[{ colId: "created_at", sort: "desc" }]}
			/>
		</Stack>
	);
});

export default UberallSyncLogTable;
