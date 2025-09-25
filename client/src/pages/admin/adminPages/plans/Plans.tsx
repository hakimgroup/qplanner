import {
	Card,
	Grid,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconDownload, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import filtersData from "@/filters.json";
import { usePractice } from "@/shared/PracticeProvider";
import StyledButton from "@/components/styledButton/StyledButton";
import PlansTable from "./PlansTable";
import { usePlans } from "@/hooks/selection.hooks";
import { PlansFilter } from "@/models/selection.models";
import { normalizeAllToNull } from "@/shared/shared.utilities";

const Plans = () => {
	const T = useMantineTheme().colors;
	const { practices } = usePractice();
	const [plansFilters, setPlansFilters] = useState<PlansFilter>({
		practiceId: "all",
		status: "all",
		category: "all",
		source: "all",
		tier: "all",
	});

	// Local search (applied on top of app-level filtering)
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 200);

	const { data, isFetching } = usePlans(normalizeAllToNull(plansFilters));

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Title order={1}>Plans</Title>
				<Text c="gray.6">
					Master table of all plan items across practices
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
								radius={10}
								data={[
									{ label: "All Practices", value: "all" },
								].concat(
									practices.map((p) => {
										return {
											label: p.name,
											value: p.id,
										};
									})
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
						<Grid.Col span={1.5}>
							<Select
								size="sm"
								radius={10}
								data={[
									{ label: "All Activities", value: "all" },
								].concat(
									filtersData.categories.map((a) => {
										return {
											label: a,
											value: a,
										};
									})
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
									{ label: "All Sources", value: "all" },
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
									{ label: "All Tiers", value: "all" },
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
							>
								Export CSV
							</StyledButton>
						</Grid.Col>
					</Grid>
				</Stack>
			</Card>

			{/* Table */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={30}>
					<Title order={3}>Plan Items ({data?.length})</Title>
					<PlansTable data={data} loading={isFetching} />
				</Stack>
			</Card>
		</Stack>
	);
};

export default Plans;
