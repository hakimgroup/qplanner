import {
	Stack,
	Title,
	Text,
	Card,
	Grid,
	Select,
	TextInput,
	useMantineTheme,
	Group,
	Badge,
	Button,
} from "@mantine/core";
import {
	IconBolt,
	IconChevronLeft,
	IconChevronRight,
	IconFilterOff,
	IconSearch,
} from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "god_mode_filters_v1";

type StoredFilters = {
	query: string;
	status: string;
	page: number;
	pageSize: number;
	sort: SortModelEntry[];
};

const DEFAULT_FILTERS: StoredFilters = {
	query: "",
	status: "all",
	page: 1,
	pageSize: 50,
	sort: [],
};

const loadFilters = (): StoredFilters => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_FILTERS;
		const parsed = JSON.parse(raw);
		return {
			query: typeof parsed.query === "string" ? parsed.query : "",
			status: typeof parsed.status === "string" ? parsed.status : "all",
			page: typeof parsed.page === "number" && parsed.page > 0 ? parsed.page : 1,
			pageSize:
				typeof parsed.pageSize === "number" && parsed.pageSize > 0
					? parsed.pageSize
					: 50,
			sort: Array.isArray(parsed.sort)
				? parsed.sort.filter(
						(s: any) =>
							s &&
							typeof s.colId === "string" &&
							(s.sort === "asc" || s.sort === "desc")
					)
				: [],
		};
	} catch {
		return DEFAULT_FILTERS;
	}
};

const saveFilters = (f: StoredFilters) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
	} catch {
		/* ignore quota errors */
	}
};
import { status as statusOptions } from "@/filters.json";
import {
	useGodModeSearch,
	GodModeSearchRow,
} from "@/hooks/godMode.hooks";
import GodModeResultsTable from "./GodModeResultsTable";
import GodModeDetailDrawer from "./GodModeDetailDrawer";
import type { SortModelEntry } from "@/components/table/Table";

const PAGE_SIZES = [
	{ label: "25 / page", value: "25" },
	{ label: "50 / page", value: "50" },
	{ label: "100 / page", value: "100" },
];

const GodMode = () => {
	const T = useMantineTheme().colors;

	// Hydrate filters from localStorage on mount (lazy initial state)
	const [initial] = useState(loadFilters);
	const [query, setQuery] = useState(initial.query);
	const [debounced] = useDebouncedValue(query, 250);
	const [status, setStatus] = useState(initial.status);

	const [selectedId, setSelectedId] = useState<string | null>(null);

	// Pagination state (also persisted)
	const [page, setPage] = useState(initial.page);
	const [pageSize, setPageSize] = useState(initial.pageSize);
	const offset = (page - 1) * pageSize;

	// Sort state (also persisted)
	const [sortModel, setSortModel] = useState<SortModelEntry[]>(initial.sort);

	// Bumped to force the table to remount when filters are cleared,
	// so AG Grid re-applies the (now empty) initialSortModel
	const [tableResetKey, setTableResetKey] = useState(0);

	// Persist filters whenever any of them changes
	useEffect(() => {
		saveFilters({ query, status, page, pageSize, sort: sortModel });
	}, [query, status, page, pageSize, sortModel]);

	// Are any filters/sort active (not at default)?
	const hasActiveFilters =
		query.trim() !== "" ||
		status !== "all" ||
		sortModel.length > 0 ||
		pageSize !== 50;

	const clearAllFilters = () => {
		setQuery("");
		setStatus("all");
		setPage(1);
		setPageSize(50);
		setSortModel([]);
		setTableResetKey((k) => k + 1);
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			/* ignore */
		}
	};

	const { data, isFetching } = useGodModeSearch({
		search: debounced || null,
		status,
		limit: pageSize,
		offset,
	});

	const rows: GodModeSearchRow[] = useMemo(() => data?.data ?? [], [data]);
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	// Reset page when filters or search change (skip the initial mount so persisted page survives)
	const skipFirstResetRef = useRef(true);
	useEffect(() => {
		if (skipFirstResetRef.current) {
			skipFirstResetRef.current = false;
			return;
		}
		setPage(1);
	}, [debounced, status, pageSize]);

	const showingFrom = total === 0 ? 0 : offset + 1;
	const showingTo = Math.min(offset + pageSize, total);

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Group gap={10} align="center">
					<IconBolt size={28} color={T.violet[6]} />
					<Title order={1}>God Mode</Title>
					<Badge color="violet" variant="light" size="lg">
						Super Admin
					</Badge>
				</Group>
				<Text c="gray.6">
					Search any selection across all practices and override anything
					at any stage. Every action is logged.
				</Text>
			</Stack>

			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.violet[1]}` }}
				shadow="xs"
			>
				<Stack gap={15}>
					<Group justify="space-between" align="center">
						<Title order={4}>Search & Filters</Title>
						<Button
							variant="subtle"
							color="violet"
							size="xs"
							radius="md"
							leftSection={<IconFilterOff size={14} />}
							onClick={clearAllFilters}
							disabled={!hasActiveFilters}
						>
							Clear filters
						</Button>
					</Group>
					<Grid>
						<Grid.Col span={{ base: 12, md: 8 }}>
							<TextInput
								radius={10}
								size="sm"
								placeholder="Search by campaign name, practice name, or paste a selection ID..."
								leftSection={<IconSearch size={18} />}
								value={query}
								onChange={(e) => setQuery(e.currentTarget.value)}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<Select
								size="sm"
								radius={10}
								data={[{ label: "All statuses", value: "all" }].concat(
									statusOptions
								)}
								value={status}
								onChange={(v) => setStatus(v ?? "all")}
							/>
						</Grid.Col>
					</Grid>
				</Stack>
			</Card>

			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.violet[1]}` }}
				shadow="xs"
			>
				<Stack gap={15}>
					<Group justify="space-between" align="center">
						<Title order={3}>
							Selections{" "}
							<Text span fz="h3" fw={700} c="violet.6">
								({total})
							</Text>
						</Title>
					</Group>
					<Stack gap={12}>
						<GodModeResultsTable
							rows={rows}
							loading={isFetching}
							onRowClick={(row) => setSelectedId(row.id)}
							initialSortModel={tableResetKey === 0 ? initial.sort : []}
							onSortChanged={setSortModel}
							resetKey={tableResetKey}
						/>

						{/* Pagination Controls */}
						<Group
							justify="space-between"
							align="center"
							wrap="wrap"
							gap="sm"
						>
							<Text size="sm" c="violet.7" fw={500}>
								{total > 0
									? `Showing ${showingFrom}–${showingTo} of ${total}`
									: "No results"}
							</Text>

							<Group gap={8} align="center" wrap="wrap">
								<Select
									size="xs"
									radius={10}
									w={120}
									data={PAGE_SIZES}
									value={String(pageSize)}
									onChange={(v) => setPageSize(Number(v) || 50)}
									allowDeselect={false}
								/>

								<Button
									variant="default"
									size="xs"
									radius={10}
									leftSection={<IconChevronLeft size={14} />}
									disabled={page <= 1}
									onClick={() => setPage((p) => Math.max(1, p - 1))}
								>
									Previous
								</Button>

								<Text size="sm" fw={600} c="gray.7">
									{page} / {totalPages}
								</Text>

								<Button
									variant="default"
									size="xs"
									radius={10}
									rightSection={<IconChevronRight size={14} />}
									disabled={page >= totalPages}
									onClick={() =>
										setPage((p) => Math.min(totalPages, p + 1))
									}
								>
									Next
								</Button>
							</Group>
						</Group>
					</Stack>
				</Stack>
			</Card>

			<GodModeDetailDrawer
				opened={!!selectedId}
				selectionId={selectedId}
				onClose={() => setSelectedId(null)}
			/>
		</Stack>
	);
};

export default GodMode;
