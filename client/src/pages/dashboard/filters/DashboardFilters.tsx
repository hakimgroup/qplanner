import {
	Badge,
	Box,
	Button,
	Card,
	Checkbox,
	Divider,
	Flex,
	Group,
	Stack,
	Switch,
	Text,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import {
	IconCalendar,
	IconCategory,
	IconEye,
	IconEyeOff,
	IconLayoutGrid,
	IconStack2,
	IconTableRow,
	IconTag,
	IconTarget,
} from "@tabler/icons-react";
import { Fragment, useState } from "react";
import cl from "./dashboardFilters.module.scss";
import clsx from "clsx";
import { DateInput } from "@mantine/dates";
import filtersData from "../../../filters.json";
import { isEqual } from "lodash";

enum ViewModes {
	Cards = "cards",
	Table = "table",
	Calendar = "calendar",
}

interface Filters {
	viewMode: ViewModes;
	dateRange: {
		from: any;
		to: any;
	};
	categories: string[];
	objectives: string[];
	topics: string[];
	hideSelected: boolean;
}

const DashboardFilters = ({ showCalendarOption = false }) => {
	const [filters, setFilters] = useState<Filters>({
		viewMode: ViewModes.Cards,
		dateRange: {
			from: null,
			to: null,
		},
		categories: [],
		objectives: [],
		topics: [],
		hideSelected: false,
	});

	const defaultFilters: Filters = {
		viewMode: ViewModes.Cards,
		dateRange: {
			from: null,
			to: null,
		},
		categories: [],
		objectives: [],
		topics: [],
		hideSelected: false,
	};

	const filterOptions = {
		viewModes: [
			{
				name: ViewModes.Cards,
				icon: <IconLayoutGrid size={16} />,
				show: true,
			},
			{
				name: ViewModes.Table,
				icon: <IconTableRow size={16} />,
				show: true,
			},
			{
				name: ViewModes.Calendar,
				icon: <IconCalendar size={16} />,
				show: showCalendarOption,
			},
		],
	};

	const filterGroupsIcon = {
		categories: <IconStack2 size={18} />,
		topics: <IconTag size={18} />,
		objectives: <IconTarget size={18} />,
	};

	const GroupTitle = ({ title = "", icon = <></> }) => (
		<Group gap={8} align="center" mb={5}>
			{icon}
			<Text size="sm" fw={500}>
				{title}
			</Text>
		</Group>
	);

	const FilterCheckboxes = ({ type = "categories" }) => (
		<Stack gap={6} className={cl["filter-group"]}>
			<Flex align={"center"} justify={"space-between"}>
				<GroupTitle
					title={upperFirst(type)}
					icon={filterGroupsIcon[type]}
				/>

				{filters[type].length > 0 && (
					<Badge size="sm" color="red.4">
						{filters[type].length}
					</Badge>
				)}
			</Flex>

			<Checkbox.Group
				value={filters[type]}
				onChange={(v) => setFilters({ ...filters, [type]: v })}
			>
				<Stack mt="xs" gap={9}>
					{filtersData[type].map((ct) => (
						<Checkbox
							radius={50}
							size="xs"
							color="blue.3"
							value={ct}
							label={
								<Text size="sm" fw={500} ml={-5} mt={-2}>
									{ct}
								</Text>
							}
						/>
					))}
				</Stack>
			</Checkbox.Group>
		</Stack>
	);

	return (
		<Stack className={cl["dashboard-filters"]} gap={25} pb={50}>
			<Stack gap={6} className={cl["filter-group"]}>
				<GroupTitle
					title="View Mode"
					icon={<IconCategory size={16} />}
				/>
				{filterOptions.viewModes.map((vm) => (
					<>
						{vm.show && (
							<Card
								radius={10}
								p={8}
								className={clsx(
									cl["vm-card"],
									filters.viewMode === vm.name && cl.active
								)}
								onClick={() =>
									setFilters({
										...filters,
										viewMode: vm.name,
									})
								}
							>
								<Group align="center">
									{vm.icon}
									<Text size="sm" fw={500}>
										{upperFirst(vm.name)}
									</Text>
								</Group>
							</Card>
						)}
					</>
				))}
			</Stack>

			<Divider size={"xs"} color="gray.1" />

			<Stack gap={6} className={cl["filter-group"]}>
				<GroupTitle
					title="Date Range"
					icon={<IconCalendar size={16} />}
				/>

				<Flex align={"center"} justify={"space-between"}>
					<DateInput
						pointer
						radius={10}
						valueFormat="DD MMM YYYY"
						leftSection={<IconCalendar size={16} />}
						value={filters.dateRange.from}
						onChange={(d) =>
							setFilters({
								...filters,
								dateRange: { ...filters.dateRange, from: d },
							})
						}
						label={
							<Text size="xs" c={"gray.8"} fw={500}>
								From
							</Text>
						}
						placeholder="Start Date"
					/>
					<Box w={10}></Box>
					<DateInput
						pointer
						radius={10}
						valueFormat="DD MMM YYYY"
						leftSection={<IconCalendar size={16} />}
						value={filters.dateRange.to}
						onChange={(d) =>
							setFilters({
								...filters,
								dateRange: { ...filters.dateRange, to: d },
							})
						}
						label={
							<Text size="xs" c={"gray.8"} fw={500}>
								To
							</Text>
						}
						placeholder="End Date"
					/>
				</Flex>
			</Stack>

			<Divider size={"xs"} color="gray.1" />

			<FilterCheckboxes />
			<Divider size={"xs"} color="gray.1" />

			<FilterCheckboxes type="objectives" />
			<Divider size={"xs"} color="gray.1" />

			<FilterCheckboxes type="topics" />
			<Divider size={"xs"} color="gray.1" />

			<Stack gap={6} className={cl["filter-group"]}>
				<GroupTitle title="Plan Display" />

				<Flex align={"center"} justify={"space-between"}>
					<Group gap={5}>
						{filters.hideSelected ? (
							<IconEyeOff size={19} />
						) : (
							<IconEye size={19} />
						)}
						<Text size="sm" fw={500}>
							Hide placed items
						</Text>
					</Group>

					<Switch
						color="blue.3"
						size="md"
						checked={filters.hideSelected}
						onChange={(event) =>
							setFilters({
								...filters,
								hideSelected: event.currentTarget.checked,
							})
						}
					/>
				</Flex>
			</Stack>

			{!isEqual(defaultFilters, filters) && (
				<Fragment>
					<Divider size={"xs"} color="gray.1" />
					<Button
						fullWidth
						variant="subtle"
						radius={10}
						c={"gray.8"}
						color="violet"
						style={{ border: "1px solid #e5e7eb" }}
						onClick={() => setFilters(defaultFilters)}
					>
						Clear All Filters
					</Button>
				</Fragment>
			)}
		</Stack>
	);
};

export default DashboardFilters;
