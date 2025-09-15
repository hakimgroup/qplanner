import { Title, Paper, Stack, Group, Flex, Text, Divider } from "@mantine/core";
import VideoBanner from "../../components/videoBanner/VideoBanner";
import StyledTabs from "@/components/styledTabs/StyledTabs";
import { IconCircleFilled } from "@tabler/icons-react";
import Bespoke from "@/components/campaignsSetup/bespoke/Bespoke";
import Quick from "@/components/campaignsSetup/quick/Quick";
import Guided from "@/components/campaignsSetup/guided/Guided";
import CampaignSelector from "@/components/campaignSelector/CampaignSelector";

export function DashboardContent() {
	return (
		<Paper pt={10} h="100%">
			<Stack gap={25}>
				<VideoBanner />
				<StyledTabs />

				<Group align="center" justify="space-between">
					<Stack gap={5}>
						<Title order={3}>
							Downtown Vision Center - Select Campaigns
						</Title>
						<Flex align={"center"} gap={20}>
							<Text size="sm" c={"gray.8"}>
								Browse and add campaigns to your plan
							</Text>
							<IconCircleFilled size={4} />
							<Text size="sm" c={"gray.8"}>
								Cards View
							</Text>
						</Flex>
					</Stack>

					<Flex gap={12}>
						<Bespoke />
						<Quick />
						<Guided />
					</Flex>
				</Group>

				<Divider size={"xs"} color="gray.1" />
			</Stack>

			<Stack gap={25} pt={25}>
				<CampaignSelector />
			</Stack>
		</Paper>
	);
}
