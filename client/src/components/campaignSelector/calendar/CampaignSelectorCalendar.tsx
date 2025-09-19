import { Stack, Title, Text } from "@mantine/core";
import CampaignTimeline from "./CampaignTimelineSkeleton";

const CampaignSelectorCalendar = () => {
	return (
		<Stack gap={20} pb={50}>
			<Stack gap={5}>
				<Title order={3}>Your Practice Campaigns</Title>
				<Text size="sm" c={"gray.8"}>
					View your campaign timeline and schedule
				</Text>
			</Stack>

			<CampaignTimeline />
		</Stack>
	);
};

export default CampaignSelectorCalendar;
