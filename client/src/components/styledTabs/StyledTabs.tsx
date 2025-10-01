import { UserTabModes } from "@/models/general.models";
import AppContext from "@/shared/AppContext";
import { usePractice } from "@/shared/PracticeProvider";
import { updateState } from "@/shared/shared.utilities";
import { SegmentedControl, Center, Stack, Text } from "@mantine/core";
import { useContext } from "react";

const StyledTabs = () => {
	const {
		state: {
			filters,
			allCampaigns: { hasPlans },
		},
		setState,
	} = useContext(AppContext);
	const { setActivePracticeId, setUnitedView } = usePractice();

	return (
		<SegmentedControl
			mt={hasPlans ? 15 : 0}
			className="styled-tab"
			radius={10}
			transitionDuration={500}
			value={filters.userSelectedTab}
			onChange={(t) => {
				updateState(setState, "filters.userSelectedTab", t);

				if (t === UserTabModes.Browse) {
					setActivePracticeId(
						localStorage.getItem("active_practice_id")
					);
					setUnitedView(false);
				}
			}}
			data={[
				{
					value: UserTabModes.Browse,
					label: (
						<Center pt={10} pb={10}>
							<Stack gap={4}>
								<Text fw={700} size="sm" c={"gray.9"}>
									🎯 Select Marketing Campaigns
								</Text>
								<Text size="xs">Browse and add campaigns</Text>
							</Stack>
						</Center>
					),
				},
				{
					value: UserTabModes.Selected,
					label: (
						<Center pt={10} pb={10}>
							<Stack gap={4}>
								<Text fw={700} size="sm" c={"gray.9"}>
									✓ Practice Selections
								</Text>
								<Text size="xs">
									View your chosen campaigns
								</Text>
							</Stack>
						</Center>
					),
				},
			]}
		/>
	);
};

export default StyledTabs;
