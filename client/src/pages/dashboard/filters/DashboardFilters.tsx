import {
	Badge,
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
import { Fragment, useContext } from "react";
import cl from "./dashboardFilters.module.scss";
import clsx from "clsx";
import filtersData from "../../../filters.json";
import { isEqual } from "lodash";
import CampaignDates from "@/components/campaignDates/CampaignDates";
import AppContext from "@/shared/AppContext";
import { Filters, UserTabModes, ViewModes } from "@/models/general.models";
import { updateState } from "@/shared/shared.utilities";

const DashboardFilters = () => {
	const {
		state: { filters },
		setState,
	} = useContext(AppContext);
	const isSelections = filters.userSelectedTab === UserTabModes.Selected;

	const filterRemap = {
		categories: {
			name: "Activity",
			value: "categories",
		},
		objectives: {
			name: "Objectives",
			value: "objectives",
		},
		topics: {
			name: "Categories",
			value: "topics",
		},
	};

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
				show: filters.userSelectedTab === UserTabModes.Selected,
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
					title={upperFirst(filterRemap[type].name)}
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
				onChange={(v) => {
					updateState(setState, `filters.${type}`, v);
				}}
			>
				<Stack mt="xs" gap={9}>
					{filtersData[type].map((ct) => (
						<Checkbox
							key={ct}
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
					<Fragment key={vm.name}>
						{vm.show && (
							<Card
								radius={10}
								p={8}
								className={clsx(
									cl["vm-card"],
									filters.viewMode === vm.name && cl.active
								)}
								onClick={() =>
									updateState(
										setState,
										"filters.viewMode",
										vm.name
									)
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
					</Fragment>
				))}
			</Stack>

			<Divider size={"xs"} color="gray.1" />

			<CampaignDates
				title="Date Range"
				icon={<IconCalendar size={16} />}
				dateRange={filters.dateRange}
				onChange={(range) =>
					updateState(setState, "filters.dateRange", range)
				}
				startLabel="From"
				endLabel="To"
				inputSize="sm"
				labelSize="sm"
				gap={2}
			/>

			<Divider size={"xs"} color="gray.1" />

			<FilterCheckboxes />
			<Divider size={"xs"} color="gray.1" />

			<FilterCheckboxes type="objectives" />
			<Divider size={"xs"} color="gray.1" />

			<FilterCheckboxes type="topics" />

			{!isSelections && (
				<>
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
									updateState(
										setState,
										"filters.hideSelected",
										event.currentTarget.checked
									)
								}
							/>
						</Flex>
					</Stack>
				</>
			)}

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
						onClick={() =>
							updateState(setState, "filters", defaultFilters)
						}
					>
						Clear All Filters
					</Button>
				</Fragment>
			)}
		</Stack>
	);
};

export default DashboardFilters;
