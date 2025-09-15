import { Grid, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import CampaignCard from "./CampaignCard";
import cl from "./campaignSelector.module.scss";

const CampaignSelector = () => {
	return (
		<Stack gap={20} className={cl["campaign-selector"]}>
			<Stack gap={5}>
				<Title order={3}>Select Marketing Campaigns</Title>
				<Text size="sm" c={"gray.8"}>
					Browse and add campaigns to this practice plan
				</Text>
			</Stack>

			<TextInput
				radius={10}
				size="md"
				fz={"sm"}
				placeholder="Search campaigns"
				leftSection={<IconSearch size={18} />}
			/>

			<Text size="sm" c="gray.8">
				Showing 6 campaigns
			</Text>

			<Grid gutter={22}>
				{[1, 2, 3, 4].map((c) => (
					<Grid.Col span={4} key={c}>
						<CampaignCard />
					</Grid.Col>
				))}
			</Grid>
		</Stack>
	);
};

export default CampaignSelector;
