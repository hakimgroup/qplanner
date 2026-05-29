import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { ColDef } from "ag-grid-community";
import Table, { TableHandle } from "@/components/table/Table";
import { Badge, Stack, Text, useMantineTheme } from "@mantine/core";
import { format } from "date-fns";

export type EmailAttemptRow = {
	id: string;
	notification_id: string | null;
	email_type: string | null;
	subject: string | null;
	recipient_email: string | null;
	status: string;
	attempt_source: string | null;
	attempted_at: string | null;
	sent_at: string | null;
	created_at: string;
	error_message: string | null;
	practice_id: string | null;
	practice_name: string | null;
	campaign_name: string | null;
	resend_message_id: string | null;
};

export type EmailHealthTableHandle = {
	exportCsv: TableHandle["exportCsv"];
};

const STATUS_COLOR: Record<string, string> = {
	attempted: "gray",
	dispatched: "blue",
	sent: "teal",
	failed: "red",
	bounced: "orange",
	complaint: "grape",
};

const SOURCE_COLOR: Record<string, string> = {
	client: "blue",
	server: "teal",
	pg_net: "violet",
	god_mode: "grape",
	cron: "yellow",
};

const EmailHealthTable = forwardRef<
	EmailHealthTableHandle,
	{
		rows: EmailAttemptRow[];
		loading?: boolean;
		height?: number;
		onRowClick?: (row: EmailAttemptRow) => void;
	}
>(function EmailHealthTable({ rows, loading, height = 600, onRowClick }, ref) {
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
					const d = p.data?.created_at
						? new Date(p.data.created_at)
						: null;
					return d ? format(d, "dd MMM, HH:mm:ss") : "—";
				},
				cellRenderer: ({ value }: { value: string }) => (
					<Text size="xs" c="gray.6" fw={500} title={value ?? ""}>
						{value ?? "—"}
					</Text>
				),
			},
			{
				field: "subject",
				headerName: "Subject",
				flex: 1.4,
				minWidth: 200,
				cellRenderer: ({ data }: { data: EmailAttemptRow }) => (
					<Text size="xs" lineClamp={1} title={data?.subject ?? ""}>
						{data?.subject ?? (
							<Text span size="xs" c="gray.5">
								—
							</Text>
						)}
					</Text>
				),
			},
			{
				field: "email_type",
				headerName: "Type",
				width: 170,
				minWidth: 150,
				cellRenderer: ({ value }: { value: string | null }) => (
					<Text size="xs" c="gray.7" lineClamp={1} title={value ?? ""}>
						{value ?? "—"}
					</Text>
				),
			},
			{
				field: "recipient_email",
				headerName: "Recipient",
				flex: 1,
				minWidth: 200,
				cellRenderer: ({ value }: { value: string | null }) => (
					<Text size="xs" lineClamp={1} title={value ?? ""}>
						{value ?? "—"}
					</Text>
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
				field: "attempt_source",
				headerName: "Source",
				width: 120,
				minWidth: 100,
				cellRenderer: ({ value }: { value: string | null }) => (
					<Badge
						variant="outline"
						color={SOURCE_COLOR[value ?? ""] ?? "gray"}
						size="sm"
					>
						{value ?? "—"}
					</Badge>
				),
			},
			{
				field: "practice_name",
				headerName: "Practice",
				flex: 1,
				minWidth: 180,
				cellRenderer: ({ value }: { value: string | null }) => (
					<Text size="xs" lineClamp={1} title={value ?? ""}>
						{value ?? "—"}
					</Text>
				),
			},
			{
				field: "campaign_name",
				headerName: "Campaign",
				flex: 1,
				minWidth: 180,
				cellRenderer: ({ value }: { value: string | null }) => (
					<Text size="xs" lineClamp={1} title={value ?? ""}>
						{value ?? "—"}
					</Text>
				),
			},
			{
				field: "resend_message_id",
				headerName: "Resend ID",
				width: 130,
				minWidth: 110,
				cellRenderer: ({ value }: { value: string | null }) => (
					<Text
						size="xs"
						c="gray.6"
						ff="monospace"
						lineClamp={1}
						title={value ?? ""}
					>
						{value ? value.slice(0, 10) : "—"}
					</Text>
				),
			},
			{
				field: "error_message",
				headerName: "Error",
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
				onRowClick={onRowClick}
				initialSortModel={[{ colId: "created_at", sort: "desc" }]}
			/>
		</Stack>
	);
});

export default EmailHealthTable;
