import {
	Button,
	Card,
	Grid,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconDownload, IconMessage, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import filtersData from "@/filters.json";
import { usePractice } from "@/shared/PracticeProvider";
import StyledButton from "@/components/styledButton/StyledButton";
import PlansTable, { PlansTableHandle } from "./PlansTable";
import { usePlans } from "@/hooks/selection.hooks";
import { PlansFilter } from "@/models/selection.models";
import { normalizeAllToNull } from "@/shared/shared.utilities";
import { useLocation } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";

const Plans = () => {
	const T = useMantineTheme().colors;
	const { pathname } = useLocation();
	const { practices } = usePractice();
	const plansRef = useRef<PlansTableHandle>(null);
	const [plansFilters, setPlansFilters] = useState<PlansFilter>({
		practiceId: "all",
		status: "all",
		category: "all",
		source: "all",
		tier: "all",
		isBespoke: false,
	});
	const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
	const isBespokeRoute =
		pathname === `${AppRoutes.Admin}/${AppRoutes.Bespoke}`;

	// Local search (debounced)
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 200);

	// Server data (filtered by the dropdown filters)
	const { data, isFetching } = usePlans(normalizeAllToNull(plansFilters));

	// Client-side search across campaign & practice
	const filteredData = useMemo(() => {
		const q = debounced.trim().toLowerCase();
		if (!q) return data ?? [];
		return (data ?? []).filter((row) => {
			const campaign = String(row?.campaign ?? "").toLowerCase();
			const practice = String(row?.practice ?? "").toLowerCase();
			return campaign.includes(q) || practice.includes(q);
		});
	}, [data, debounced]);

	useEffect(() => {
		setPlansFilters((prev) => {
			// only update if needed (prevents useless renders/refetches)
			if (prev.isBespoke === isBespokeRoute) return prev;
			return { ...prev, isBespoke: isBespokeRoute };
		});
		// (optional) clear selections when switching tabs
		setSelectedRowIds([]);
	}, [isBespokeRoute]);

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Title order={1}>{isBespokeRoute ? "Bespoke" : "Plans"}</Title>
				<Text c="gray.6">
					{isBespokeRoute
						? "Filtered list of bespoke plan items for easy triage"
						: "Master table of all plan items across practices"}
				</Text>
			</Stack>

			{/* Table Filters */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={10}>
					<Title order={4}>Filters & Search</Title>
					<Grid>
						<Grid.Col span={8}>
							<TextInput
								radius={10}
								size="sm"
								fz={"sm"}
								placeholder="Search campaigns, practices..."
								leftSection={<IconSearch size={18} />}
								value={query}
								onChange={(e) =>
									setQuery(e.currentTarget.value)
								}
							/>
						</Grid.Col>
						<Grid.Col span={2}>
							<Select
								size="sm"
								searchable
								radius={10}
								data={[
									{ label: "All Practices", value: "all" },
								].concat(
									practices.map((p) => ({
										label: p.name,
										value: p.id,
									}))
								)}
								value={plansFilters.practiceId}
								onChange={(v) =>
									setPlansFilters({
										...plansFilters,
										practiceId: v ?? "all",
									})
								}
							/>
						</Grid.Col>
						<Grid.Col span={2}>
							<Select
								size="sm"
								radius={10}
								data={[
									{ label: "All Status", value: "all" },
								].concat(filtersData.status)}
								value={plansFilters.status}
								onChange={(v) =>
									setPlansFilters({
										...plansFilters,
										status: v ?? "all",
									})
								}
							/>
						</Grid.Col>
						{!isBespokeRoute && (
							<>
								<Grid.Col span={1.5}>
									<Select
										size="sm"
										radius={10}
										data={[
											{
												label: "All Activities",
												value: "all",
											},
										].concat(
											filtersData.categories.map((a) => ({
												label: a,
												value: a,
											}))
										)}
										value={plansFilters.category}
										onChange={(v) =>
											setPlansFilters({
												...plansFilters,
												category: v ?? "all",
											})
										}
									/>
								</Grid.Col>
								<Grid.Col span={1.5}>
									<Select
										size="sm"
										radius={10}
										data={[
											{
												label: "All Sources",
												value: "all",
											},
										].concat(filtersData.sources)}
										value={plansFilters.source}
										onChange={(v) =>
											setPlansFilters({
												...plansFilters,
												source: v ?? "all",
											})
										}
									/>
								</Grid.Col>
								<Grid.Col span={1.5}>
									<Select
										size="sm"
										radius={10}
										data={[
											{
												label: "All Tiers",
												value: "all",
											},
										].concat(filtersData.tiers)}
										value={plansFilters.tier}
										onChange={(v) =>
											setPlansFilters({
												...plansFilters,
												tier: v ?? "all",
											})
										}
									/>
								</Grid.Col>
								<Grid.Col span={1.5}>
									<StyledButton
										leftSection={<IconDownload size={16} />}
										onClick={() =>
											plansRef.current?.exportCsv({
												fileName: "plans.csv",
												columnKeys: [
													"practice",
													"campaign",
													"category",
													"source",
													"status",
													"from",
													"end",
													"updated_at",
												],
											})
										}
									>
										Export CSV
									</StyledButton>
								</Grid.Col>
							</>
						)}
					</Grid>
				</Stack>
			</Card>

			{/* Table Bulk Action */}
			{selectedRowIds.length > 0 && (
				<Card
					p={25}
					radius={10}
					bg={"violet.0"}
					style={{ border: `1px solid ${T.violet[1]}` }}
					shadow="xs"
				>
					<Group align="center" justify="space-between">
						<Text size="sm" fw={500}>
							{selectedRowIds.length} plans selected
						</Text>

						<Group align="center" gap={8}>
							<Select
								size="sm"
								radius={10}
								data={[
									{ label: "Change Status", value: "all" },
								].concat(filtersData.status)}
								value="all"
								onChange={(v) => {}}
							/>

							<StyledButton
								leftSection={<IconMessage size={16} />}
							>
								Trigger follow-up
							</StyledButton>

							<Button
								variant="subtle"
								color="violet"
								c="gray.9"
								onClick={() => {
									setSelectedRowIds([]);
									plansRef.current?.clearSelection();
								}}
							>
								Clear selection
							</Button>
						</Group>
					</Group>
				</Card>
			)}

			{/* Table */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={30}>
					<Title order={3}>
						Plan Items{" "}
						<Text span fz={"h3"} fw={700} c={"blue.3"}>
							({filteredData?.length ?? 0})
						</Text>
					</Title>
					<PlansTable
						ref={plansRef}
						data={filteredData}
						loading={isFetching}
						setSelectedRowIds={(ids) => setSelectedRowIds(ids)}
					/>
				</Stack>
			</Card>
		</Stack>
	);
};

export default Plans;
