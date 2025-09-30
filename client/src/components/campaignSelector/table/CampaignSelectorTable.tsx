import { UserTabModes } from "@/models/general.models";
import AppContext from "@/shared/AppContext";
import {
	Stack,
	TextInput,
	Title,
	Text,
	Select,
	Flex,
	Button,
	Badge,
	Group,
} from "@mantine/core";
import { IconEdit, IconPlus, IconSearch } from "@tabler/icons-react";
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
import {
	filterCampaignsByQuery,
	formatAvailabilityForUI,
} from "@/shared/shared.utilities";
import { usePractice } from "@/shared/PracticeProvider";
import Event from "@/components/campaignsSetup/event/Event";

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
	const { unitedView } = usePractice();

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
			field: "selection_practice_name",
			headerName: "Practice",
			hide: !unitedView,
			minWidth: 160,
			width: 230,
			tooltipField: "selection_practice_name",
			cellRenderer: ({ value }: any) => (
				<Text size="sm" fw={500} title={value ?? ""}>
					{value}
				</Text>
			),
			// optional: keep it visible when wide tables scroll
			pinned: unitedView ? "left" : undefined,
		},

		{
			field: "campaign",
			headerName: "Campaign",
			flex: 2, // grows, but never below minWidth
			minWidth: 280,
			cellRenderer: (p: any) => {
				const name = p?.value ?? "—";
				const desc = p?.data?.description ?? "";
				return (
					<Stack gap={5}>
						<Text size="xs" fw={600} lineClamp={1} title={name}>
							{name}
						</Text>
						<Text size="xs" c="gray.5" title={desc} lineClamp={1}>
							{desc || "—"}
						</Text>
					</Stack>
				);
			},
		},

		{
			field: "section",
			headerName: "Activity",
			width: 170,
			minWidth: 130,
			tooltipField: "section",
			cellRenderer: ({ value }: any) => {
				const isEvent = value === "Event";
				return (
					<Badge
						variant={isEvent ? "filled" : "outline"}
						color={isEvent ? "violet" : "gray.1"}
					>
						<Text
							size="xs"
							fw={500}
							c={isEvent ? "violet.0" : "gray.9"}
						>
							{value ?? "—"}
						</Text>
					</Badge>
				);
			},
		},

		{
			field: "objectives",
			headerName: "Objectives",
			flex: 1,
			minWidth: 200,
			sortable: false,
			filter: false,
			tooltipValueGetter: (p) =>
				Array.isArray(p.value) ? p.value.join(", ") : "",
			cellRenderer: ({ value }: any) => (
				<BadgeList items={Array.isArray(value) ? value : []} />
			),
		},

		{
			field: "topics",
			headerName: "Categories",
			flex: 1,
			minWidth: 200,
			sortable: false,
			filter: false,
			tooltipValueGetter: (p) =>
				Array.isArray(p.value) ? p.value.join(", ") : "",
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
			headerName: "Dates",
			width: 190,
			minWidth: 160,
			sortable: false,
			filter: false,
			valueGetter: (p) => {
				const from = p?.data?.availableDates?.from ?? null;
				const to = p?.data?.availableDates?.to ?? null;
				return formatAvailabilityForUI({
					from: from ? new Date(from) : null,
					to: to ? new Date(to) : null,
				});
			},
			tooltipValueGetter: (p) => p.value ?? "",
			cellRenderer: ({ value }: any) => (
				<Text size="xs" c="gray.9" fw={500} title={value ?? ""}>
					{value ?? "—"}
				</Text>
			),
		},

		{
			field: "status",
			headerName: "Status",
			width: 150,
			minWidth: 140,
			sortable: false,
			filter: false,
			tooltipValueGetter: (p) => p?.value ?? "",
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
			headerName: "Actions",
			pinned: "right",
			lockPinned: true,
			width: 210,
			minWidth: 190,
			sortable: false,
			filter: false,
			cellRenderer: ({ data }: any) => {
				const id = data?.id ?? null;
				if (!id) return null;
				return (
					<Flex justify="flex-end" align="center" gap={8} w="inherit">
						<Button
							variant="subtle"
							color="violet"
							radius={10}
							size="xs"
							c="gray.9"
							onClick={() => setMode({ type: "view", id })}
						>
							View
						</Button>
						{isSelections || data.selected ? (
							<Button
								size="xs"
								radius={10}
								color={
									data?.category === "Event"
										? "violet"
										: "red.4"
								}
								leftSection={<IconEdit size={14} />}
								onClick={() => setMode({ type: "edit", id })}
							>
								Edit
							</Button>
						) : (
							<Button
								size="xs"
								radius={10}
								color="blue.3"
								leftSection={<IconPlus size={14} />}
								onClick={() => setMode({ type: "add", id })}
							>
								Add
							</Button>
						)}
					</Flex>
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

		// text search across all standard fields + the "campaign" label from the table rows
		const searched = filterCampaignsByQuery(rows, debounced, {
			extraKeys: ["campaign"],
		});

		// status filter (only on Selected tab)
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

				{!isSelections && (
					<Group gap={10}>
						<Bespoke />
						<Event />
					</Group>
				)}

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
				{isSelections && !unitedView ? (
					<Group gap={10}>
						<Bespoke />
						<Event />
					</Group>
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
