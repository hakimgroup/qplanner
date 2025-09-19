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
	ActionIcon,
	Group,
} from "@mantine/core";
import {
	IconCalendar,
	IconLink,
	IconPlus,
	IconSearch,
} from "@tabler/icons-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import filtersData from "@/filters.json";
import { ColDef } from "ag-grid-community";
import { find } from "lodash";
import { BadgeList } from "@/components/badgeList/BadgeList";
import { statusColors } from "@/shared/shared.const";
import Table from "@/components/table/Table";
import Bespoke from "@/components/campaignsSetup/bespoke/Bespoke";
import Edit from "../Edit";
import View from "../View";

type Availability = { from: string; to: string } | null;

const toDate = (iso?: string | null) => {
	if (!iso) return null;
	const d = new Date(iso);
	return isNaN(d.getTime()) ? null : d;
};

const CampaignSelectorTable = () => {
	const C = useMantineTheme().colors;
	const {
		state: { filters, allCampaigns },
	} = useContext(AppContext);

	const isSelections = filters.userSelectedTab === UserTabModes.Selected;

	const [value, setValue] = useState<string | null>("all");
	const [mode, setMode] = useState<{
		type: "view" | "edit" | null;
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

	// Column Definitions
	const colDefs: ColDef[] = [
		{
			field: "campaign",
			resizable: true,
			flex: 1,
			cellRenderer: (p: any) => (
				<Stack gap={0}>
					<Text
						size="xs"
						fw={600}
						lineClamp={1}
						truncate={"end"}
						maw={isSelections ? 260 : 240}
					>
						{p.value}
					</Text>
					<Text
						size="xs"
						c="gray.5"
						lineClamp={1}
						truncate={"end"}
						maw={isSelections ? 260 : 240}
						title={p.data?.description ?? ""}
					>
						{p.data?.description}
					</Text>
				</Stack>
			),
		},

		{
			field: "section",
			cellRenderer: ({ value }: any) => (
				<Badge variant="outline" color="gray.1">
					<Text size="xs" fw={500} c={"gray.9"}>
						{value}
					</Text>
				</Badge>
			),
		},
		{
			field: "objectives",
			cellRenderer: ({ value }: any) => <BadgeList items={value} />,
		},
		{
			field: "topics",
			cellRenderer: ({ value }: any) => (
				<BadgeList
					items={value}
					firstBadgeColor="gray.1"
					firstBadgeVariant="outline"
					firstBadgeTextColor="gray.9"
				/>
			),
		},
		{
			field: "availableDates",
			headerName: isSelections ? "Duration" : "Available Dates",
			sortable: false,
			filter: false,
			cellRenderer: ({ value }: any) => {
				if (!value || !value.from || !value.to) return null;
				const { from, to } = value as { from: Date; to: Date };
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
				const found = find(filtersData.status, { value });
				const name = found?.label ?? value ?? "—";
				const color = statusColors[value] ?? "black";
				return (
					<Badge variant="light" color={color} fw={500}>
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
			cellRenderer: (p: any) => (
				<>
					<Flex
						justify="flex-end"
						align="center"
						gap={0}
						w={"inherit"}
						pr={isSelections ? 0 : 60}
					>
						{!isSelections && (
							<ActionIcon
								variant="subtle"
								color="violet"
								radius={10}
								size="md"
							>
								<IconLink size={17} color={C.gray[9]} />
							</ActionIcon>
						)}
						<Flex align="center" gap={8}>
							<Button
								variant="subtle"
								color="violet"
								radius={10}
								size="xs"
								c="gray.9"
								onClick={() =>
									setMode({ type: "view", id: p.data.id })
								}
							>
								View
							</Button>
							<Button
								size="xs"
								radius={10}
								color="red.4"
								leftSection={<IconPlus size={14} />}
								onClick={() =>
									setMode({ type: "edit", id: p.data.id })
								}
							>
								Edit
							</Button>
						</Flex>
					</Flex>

					<Edit
						opened={mode.type === "edit" && mode.id === p.data.id}
						closeModal={() => setMode({ type: null, id: null })}
					/>
					<View
						opened={mode.type === "view" && mode.id === p.data.id}
						closeDrawer={() => setMode({ type: null, id: null })}
					/>
				</>
			),
		},
	];

	// Map app-wide campaigns -> table rows
	useEffect(() => {
		const mapped = (allCampaigns.data ?? []).map((c: any) => {
			const av = c?.availability as Availability;
			const from = toDate(av?.from);
			const to = toDate(av?.to);

			return {
				id: c.id,
				campaign: c.name,
				description: c.description,
				section: c.category,
				objectives: c.objectives ?? [],
				topics: c.topics ?? [],
				availableDates: from && to ? { from, to } : null,
				status: c.status ?? "Available",
				actions: "View | Edit",
			};
		});
		setRowData(mapped);
	}, [allCampaigns.data]);

	// Apply local search on top of app-level filtered rows
	const viewRows = useMemo(() => {
		const q = debounced.trim().toLowerCase();
		if (!q) return rowData;
		return rowData.filter((r) =>
			String(r.campaign ?? "")
				.toLowerCase()
				.includes(q)
		);
	}, [rowData, debounced]);

	const totalCount = viewRows.length;

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

				{!isSelections && selectedRows.length > 0 && (
					<Group align="center" gap={10}>
						<Badge size="sm" color="red.4">
							{selectedRows.length} selected
						</Badge>
						<Button leftSection={<IconCalendar size={15} />}>
							Bulk Add
						</Button>
					</Group>
				)}

				{isSelections && (
					<Select
						size="sm"
						radius={10}
						data={[{ label: "All Status", value: "all" }].concat(
							filtersData.status
						)}
						value={value}
						onChange={setValue}
					/>
				)}
			</Group>

			{isSelections && (
				<Group align="center" justify={"space-between"}>
					<Text size="sm" c="gray.6">
						Showing {totalCount} campaign
						{totalCount === 1 ? "" : "s"}
					</Text>
					<Bespoke buttonText="Add Campaign" />
				</Group>
			)}

			<Table
				loading={allCampaigns.loading}
				rows={viewRows}
				cols={colDefs}
				enableSelection={!isSelections}
				height={550}
				onSelect={(r) => setSelectedRows(r)}
			/>
		</Stack>
	);
};

export default CampaignSelectorTable;
