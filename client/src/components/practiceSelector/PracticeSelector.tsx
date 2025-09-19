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
import { Fragment, useMemo } from "react";
import cl from "./practiceSelector.module.scss";
import { usePractice } from "@/shared/PracticeProvider"; // ⬅️ context

type TargetProps = {
	isAll?: boolean;
	hide?: boolean;
	name?: string;
	selected?: boolean;
	practicesCount: number;
};

const TargetComponent = ({
	isAll = false,
	hide = false,
	name = "United View",
	selected = false,
	practicesCount,
}: TargetProps) => {
	const T = useMantineTheme();

	return (
		<Group gap={10} align="center">
			{!hide && (
				<Fragment>
					{selected && (
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
				{isAll ? "United View" : name}
			</Text>
			{isAll && (
				<Badge color="red.4">
					{hide
						? `${practicesCount} Practices`
						: `All ${practicesCount}`}
				</Badge>
			)}
		</Group>
	);
};

const PracticeSelector = () => {
	const T = useMantineTheme();
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});

	const {
		practices, // [{ id, name }, ...] limited by RLS to what the user can access
		activePracticeId,
		setActivePracticeId,
		unitedView,
		setUnitedView,
	} = usePractice();

	const practicesCount = practices.length;

	// Derive current selection token for the combobox ("all" or practice.id)
	const selectedValue = unitedView ? "all" : activePracticeId ?? null;

	// Resolve the display name for the selected practice (if not united)
	const selectedPracticeName = useMemo(() => {
		if (unitedView) return "United View";
		const found = practices.find((p) => p.id === activePracticeId);
		return found?.name ?? "Select a practice";
	}, [unitedView, practices, activePracticeId]);

	// Dropdown options from context
	const options = useMemo(
		() =>
			practices.map((p) => (
				<Combobox.Option
					value={p.id}
					key={p.id}
					active={selectedValue === p.id}
				>
					<TargetComponent
						name={p.name}
						practicesCount={practicesCount}
						selected={selectedValue === p.id}
					/>
				</Combobox.Option>
			)),
		[practices, practicesCount, selectedValue]
	);

	const handleSubmit = (val: string) => {
		if (val === "all") {
			setUnitedView(true);
			// keep activePracticeId as-is in case the user toggles back
		} else {
			setUnitedView(false);
			setActivePracticeId(val);
		}
		combobox.closeDropdown();
	};

	const hasPractices = practicesCount > 0;

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

			<Combobox store={combobox} onOptionSubmit={handleSubmit}>
				<Combobox.Target>
					<Card
						radius={10}
						w={280}
						p={10}
						withBorder
						className={cl.target}
						onClick={() =>
							hasPractices && combobox.toggleDropdown()
						}
					>
						<Flex justify={"space-between"} align={"center"}>
							<TargetComponent
								isAll={selectedValue === "all"}
								name={selectedPracticeName}
								hide
								selected
								practicesCount={practicesCount}
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
						{/* United View */}
						<Combobox.Option
							value="all"
							key="all"
							active={selectedValue === "all"}
						>
							<TargetComponent
								isAll
								name="United View"
								practicesCount={practicesCount}
								selected={selectedValue === "all"}
							/>
						</Combobox.Option>

						<Combobox.Group
							label={
								<Text size="xs" fw={600}>
									Individual Practices
								</Text>
							}
						>
							{hasPractices ? (
								options
							) : (
								<Combobox.Empty>
									<Text size="xs" c="gray.6">
										No practices assigned
									</Text>
								</Combobox.Empty>
							)}
						</Combobox.Group>
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
		</Flex>
	);
};

export default PracticeSelector;
