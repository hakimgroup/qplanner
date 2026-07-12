import Table from "@/components/table/Table";
import { Badge, Button, Flex, Group, Text, useMantineTheme } from "@mantine/core";
import { IconPaperclip } from "@tabler/icons-react";
import { ColDef } from "ag-grid-community";
import { format } from "date-fns";
import { useMemo } from "react";
import { BugReport, SEVERITY_META } from "@/models/bug.models";

interface Props {
	loading: boolean;
	rows: BugReport[];
	onRowClick: (bug: BugReport) => void;
}

export default function BugReportsTable({ loading, rows, onRowClick }: Props) {
	const T = useMantineTheme().colors;

	const cols: ColDef[] = useMemo(
		() => [
			{
				field: "severity",
				headerName: "Severity",
				width: 120,
				minWidth: 110,
				cellRenderer: ({ value }: any) => {
					const m = SEVERITY_META[value as keyof typeof SEVERITY_META] ??
						SEVERITY_META.medium;
					return (
						<Badge color={m.color} variant="light" size="sm" fw={700}>
							{m.label}
						</Badge>
					);
				},
			},
			{
				field: "title",
				headerName: "Title",
				flex: 2,
				minWidth: 240,
				cellRenderer: ({ value, data }: any) => (
					<Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
						<Text size="sm" c="gray.9" fw={600} truncate title={value || ""}>
							{value || "—"}
						</Text>
						{Array.isArray(data?.attachments) &&
							data.attachments.length > 0 && (
								<Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }}>
									<IconPaperclip size={12} color={T.gray[5]} />
									<Text size="xs" c="gray.5">
										{data.attachments.length}
									</Text>
								</Group>
							)}
					</Group>
				),
			},
			{
				field: "status",
				headerName: "Status",
				width: 110,
				minWidth: 100,
				cellRenderer: ({ value }: any) =>
					value === "open" ? (
						<Badge color="green" variant="filled" size="sm" fw={700}>
							Open
						</Badge>
					) : (
						<Badge color="gray" variant="light" size="sm" fw={700}>
							Closed
						</Badge>
					),
			},
			{
				field: "created_by_name",
				headerName: "Reported by",
				flex: 1,
				minWidth: 150,
				sortable: false,
				cellRenderer: ({ value }: any) => (
					<Text size="sm" c="gray.7">
						{value || "—"}
					</Text>
				),
			},
			{
				field: "created_at",
				headerName: "Created",
				width: 150,
				minWidth: 130,
				cellRenderer: ({ value }: any) => (
					<Text size="sm" c="gray.6">
						{value ? format(new Date(value), "d MMM yyyy") : "—"}
					</Text>
				),
			},
			{
				field: "actions",
				headerName: "",
				width: 100,
				minWidth: 90,
				pinned: "right",
				sortable: false,
				filter: false,
				cellRenderer: ({ data }: any) => (
					<Flex align="center" h="100%">
						<Button
							size="compact-xs"
							variant="light"
							color="violet"
							onClick={(e) => {
								e.stopPropagation();
								onRowClick(data);
							}}
						>
							View
						</Button>
					</Flex>
				),
			},
		],
		[T, onRowClick],
	);

	return (
		<Table
			loading={loading}
			rows={rows ?? []}
			cols={cols}
			enableSelection={false}
			height={560}
			onRowClick={onRowClick}
		/>
	);
}
