import {
	Flex,
	useMantineTheme,
	Text,
	Combobox,
	useCombobox,
	Card,
	Group,
	Badge,
} from "@mantine/core";
import {
	IconBuildings,
	IconCheck,
	IconChevronDown,
	IconCircleFilled,
	IconUsers,
} from "@tabler/icons-react";
import { Fragment, useState } from "react";
import cl from "./practiceSelector.module.scss";

const PracticeSelector = () => {
	const T = useMantineTheme();

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});

	const [value, setValue] = useState<string | null>("all");

	const practices = [
		{
			name: "Downtown Vision Center",
		},
		{
			name: "Suburban Family Eye Care",
		},
	];

	const TargetComponent = ({
		isAll = false,
		hide = false,
		name = "United View",
	}) => {
		return (
			<Group gap={10} align="center">
				{!hide && (
					<Fragment>
						{name === value && (
							<IconCheck size={15} color={T.colors.gray[8]} />
						)}
					</Fragment>
				)}
				{isAll ? (
					<IconUsers stroke={2.5} size={15} color={T.colors.red[4]} />
				) : (
					<IconCircleFilled
						stroke={2.5}
						size={15}
						color={T.colors.blue[4]}
					/>
				)}
				<Text size="sm" fw={500}>
					{name === "all" ? "United View" : name}
				</Text>
				{isAll && (
					<Badge color="red.4" style={{ textTransform: "unset" }}>
						{hide ? `${2} Practices` : `All ${2}`}
					</Badge>
				)}
			</Group>
		);
	};

	const options = practices.map((item) => (
		<Combobox.Option
			value={item.name}
			key={item.name}
			active={item.name === value}
		>
			<TargetComponent name={item.name} />
		</Combobox.Option>
	));

	return (
		<Flex align="center" gap={15} className={cl["practice-selector"]}>
			<Flex align={"center"} gap={5}>
				<IconBuildings
					size={20}
					color={T.colors.gray[7]}
					stroke={1.8}
				/>
				<Text fw={500} c={"gray.7"} size="sm">
					Practice:
				</Text>
			</Flex>

			<Combobox
				store={combobox}
				onOptionSubmit={(val) => {
					setValue(val);
					combobox.closeDropdown();
				}}
			>
				<Combobox.Target>
					<Card
						radius={10}
						w={280}
						p={10}
						withBorder
						className={cl.target}
						onClick={() => combobox.toggleDropdown()}
					>
						<Flex justify={"space-between"} align={"center"}>
							<TargetComponent
								isAll={value === "all"}
								name={value}
								hide
							/>
							<IconChevronDown
								size={15}
								color={T.colors.gray[8]}
							/>
						</Flex>
					</Card>
				</Combobox.Target>

				<Combobox.Dropdown>
					<Combobox.Options>
						<Combobox.Option
							value="all"
							key="all"
							active={value === "all"}
						>
							<TargetComponent isAll name="all" />
						</Combobox.Option>

						<Combobox.Group
							label={
								<Text size="xs" fw={600}>
									Individual Practices
								</Text>
							}
						>
							{options}
						</Combobox.Group>
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
		</Flex>
	);
};

export default PracticeSelector;
