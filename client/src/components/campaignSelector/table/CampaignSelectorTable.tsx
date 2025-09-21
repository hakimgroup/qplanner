import { UserTabModes } from "@/models/general.models";
import AppContext from "@/shared/AppContext";
import {
	Stack,
	TextInput,
	Title,
	Text,
	Select,
	useMantineTheme,
	Flex,
	Button,
	Badge,
	Group,
} from "@mantine/core";
import { IconEdit, IconLink, IconPlus, IconSearch } from "@tabler/icons-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import filtersData from "@/filters.json";
import { ColDef } from "ag-grid-community";
import { find } from "lodash";
import { BadgeList } from "@/components/badgeList/BadgeList";
import { statusColors } from "@/shared/shared.const";
import Table from "@/components/table/Table";
import Bespoke from "@/components/campaignsSetup/bespoke/Bespoke";
import Edit from "../Edit";
import View from "../View";
import BulkAdd from "../BulkAdd";

type Availability = { from: string; to: string } | null;

const toDate = (iso?: string | null) => {
	if (!iso) return null;
	const d = new Date(iso);
	return isNaN(d.getTime()) ? null : d;
};

const CampaignSelectorTable = () => {
	const {
		state: { filters, allCampaigns },
	} = useContext(AppContext);
	const [opened, { open: open, close: close }] = useDisclosure(false);

	const isSelections = filters.userSelectedTab === UserTabModes.Selected;

	// status filter (local to this table)
	const [statusValue, setStatusValue] = useState<string | null>("all");

	const [mode, setMode] = useState<{
		type: "view" | "edit" | "add" | null;
		id: string | number | null;
	}>({
		type: null,
		id: null,
	});
	const [selectedRows, setSelectedRows] = useState<any[]>([]);
	const [rowData, setRowData] = useState<any[]>([]);

	// 🔎 local search (by campaign name)
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 200);

	// Column Definitions (defensive renderers)
	const colDefs: ColDef[] = [
		{
			field: "campaign",
			resizable: true,
			flex: 1,
			cellRenderer: (p: any) => {
				const name = p?.value ?? "—";
				const desc = p?.data?.description ?? "";
				return (
					<Stack gap={0}>
						<Text
							size="xs"
							fw={600}
							lineClamp={1}
							truncate={"end"}
							maw={isSelections ? 260 : 240}
							title={name}
						>
							{name}
						</Text>
						<Text
							size="xs"
							c="gray.5"
							lineClamp={1}
							truncate={"end"}
							maw={isSelections ? 260 : 240}
							title={desc}
						>
							{desc || "—"}
						</Text>
					</Stack>
				);
			},
		},

		{
			field: "section",
			headerName: "Activity",
			cellRenderer: ({ value }: any) => (
				<Badge variant="outline" color="gray.1">
					<Text size="xs" fw={500} c={"gray.9"}>
						{value ?? "—"}
					</Text>
				</Badge>
			),
		},
		{
			field: "objectives",
			cellRenderer: ({ value }: any) => (
				<BadgeList items={Array.isArray(value) ? value : []} />
			),
		},
		{
			field: "topics",
			headerName: "Categories",
			cellRenderer: ({ value }: any) => (
				<BadgeList
					items={Array.isArray(value) ? value : []}
					firstBadgeColor="gray.1"
					firstBadgeVariant="outline"
					firstBadgeTextColor="gray.9"
				/>
			),
		},
		{
			field: "availableDates",
			headerName: "Availability",
			sortable: false,
			filter: false,
			cellRenderer: ({ value }: any) => {
				const from: Date | null = value?.from ?? null;
				const to: Date | null = value?.to ?? null;
				if (!(from instanceof Date) || isNaN(from.getTime()))
					return <Text size="xs">—</Text>;
				if (!(to instanceof Date) || isNaN(to.getTime()))
					return <Text size="xs">—</Text>;
				const opts: Intl.DateTimeFormatOptions = {
					day: "2-digit",
					month: "short",
				};
				const year = from.getFullYear();
				const fromStr = from.toLocaleDateString("en-US", opts);
				const toStr = to.toLocaleDateString("en-US", opts);
				return (
					<Text size="xs" c="gray.9" fw={500}>
						{`${fromStr} - ${toStr}, ${year}`}
					</Text>
				);
			},
		},
		{
			field: "status",
			sortable: false,
			filter: false,
			cellRenderer: ({ value }: any) => {
				const v = value ?? "Available";
				const found = find(filtersData.status, { value: v });
				const name = found?.label ?? v ?? "—";
				const color = statusColors[v] ?? "gray";
				return (
					<Badge variant="light" color={color as any} fw={500}>
						{name}
					</Badge>
				);
			},
		},
		{
			field: "actions",
			headerClass: "ag-right-aligned-header",
			sortable: false,
			filter: false,
			cellRenderer: ({ data }: any) => {
				const id = data?.id ?? null;
				if (!id) return null;
				return (
					<>
						<Flex
							justify="flex-end"
							align="center"
							gap={0}
							w={"inherit"}
							pr={isSelections ? 0 : 60}
						>
							<Flex align="center" gap={8}>
								<Button
									variant="subtle"
									color="violet"
									radius={10}
									size="xs"
									c="gray.9"
									onClick={() =>
										setMode({ type: "view", id })
									}
								>
									View
								</Button>
								{isSelections || data.selected ? (
									<Button
										size="xs"
										radius={10}
										color="red.4"
										leftSection={<IconEdit size={14} />}
										onClick={() =>
											setMode({ type: "edit", id })
										}
									>
										Edit
									</Button>
								) : (
									<Button
										size="xs"
										radius={10}
										color="blue.3"
										leftSection={<IconPlus size={14} />}
										onClick={() =>
											setMode({ type: "add", id })
										}
									>
										Add
									</Button>
								)}
							</Flex>
						</Flex>

						<Edit
							selection={data}
							opened={mode.type === "edit" && mode.id === id}
							closeModal={() => setMode({ type: null, id: null })}
						/>
						<View
							c={data}
							mode={mode.type as any}
							opened={
								(mode.type === "view" || mode.type === "add") &&
								mode.id === id
							}
							closeDrawer={() =>
								setMode({ type: null, id: null })
							}
						/>
					</>
				);
			},
		},
	];

	// Map app-wide campaigns -> table rows (defensive)
	useEffect(() => {
		const source = Array.isArray(allCampaigns?.data)
			? allCampaigns.data
			: [];

		const mapped = source.map((c) => {
			const av: Availability =
				isSelections || c.selected
					? { from: c.selection_from_date, to: c.selection_to_date }
					: c.availability;
			const from = toDate(av?.from ?? null);
			const to = toDate(av?.to ?? null);

			return {
				// expose full original campaign row
				...c,

				// keep the fields your column defs expect
				id: c?.id ?? String(Math.random()),
				campaign: c?.name ?? "—",
				description: c?.description ?? "",
				section: c?.category ?? "—",
				objectives: Array.isArray(c?.objectives) ? c.objectives : [],
				topics: Array.isArray(c?.topics) ? c.topics : [],
				availableDates: from && to ? { from, to } : null,
				status: c?.status ?? "Available",

				// extra action label for your actions column
				actions: "View | Edit",
			};
		});

		setRowData(mapped);
	}, [allCampaigns?.data]);

	// Apply local search and status filtering
	const viewRows = useMemo(() => {
		const rows = Array.isArray(rowData) ? rowData : [];

		// search
		const q = debounced.trim().toLowerCase();
		const searched = q
			? rows.filter((r) =>
					String(r?.campaign ?? "")
						.toLowerCase()
						.includes(q)
			  )
			: rows;

		// status filter (only when on Selected tab and a status picked)
		const s = (statusValue || "all").toLowerCase();
		if (isSelections && s !== "all") {
			return searched.filter(
				(r) => String(r?.status ?? "").toLowerCase() === s
			);
		}
		return searched;
	}, [rowData, debounced, statusValue, isSelections]);

	const totalCount = Array.isArray(viewRows) ? viewRows.length : 0;

	return (
		<Stack gap={20} pb={50}>
			<BulkAdd
				opened={opened}
				selections={selectedRows}
				closeModal={() => {
					setSelectedRows([]);
					close();
				}}
			/>

			{isSelections && (
				<Stack gap={5}>
					<Title order={3}>Your Practice Campaigns</Title>
					<Text size="sm" c={"gray.8"}>
						Manage your selected campaigns and track their progress
					</Text>
				</Stack>
			)}

			<Group align="center" justify={"space-between"}>
				<TextInput
					miw={400}
					radius={10}
					size="sm"
					fz={"sm"}
					placeholder={
						isSelections
							? "Search your campaigns..."
							: "Search campaigns..."
					}
					leftSection={<IconSearch size={18} />}
					value={query}
					onChange={(e) => setQuery(e.currentTarget.value)}
				/>

				{!isSelections && <Bespoke />}

				{isSelections && (
					<Select
						size="sm"
						radius={10}
						data={[{ label: "All Status", value: "all" }].concat(
							filtersData.status
						)}
						value={statusValue}
						onChange={(v) => setStatusValue(v ?? "all")}
					/>
				)}
			</Group>

			<Group align="center" justify={"space-between"}>
				<Text size="sm" c="gray.6">
					Showing {totalCount} campaign
					{totalCount === 1 ? "" : "s"}
				</Text>
				{isSelections ? (
					<Bespoke buttonText="Add Campaign" />
				) : (
					<Text c="gray.6" size="sm">
						Sorted by name (A-Z)
					</Text>
				)}
			</Group>

			<Table
				loading={!!allCampaigns?.loading}
				rows={Array.isArray(viewRows) ? viewRows : []}
				cols={colDefs}
				enableSelection={false}
				height={550}
				onSelect={(r) => setSelectedRows(r.map((cp) => cp.id))}
			/>
		</Stack>
	);
};

export default CampaignSelectorTable;
