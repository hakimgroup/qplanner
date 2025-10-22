import {
  Title,
  Paper,
  Stack,
  Group,
  Flex,
  Text,
  Divider,
  Card,
} from "@mantine/core";
import StyledTabs from "@/components/styledTabs/StyledTabs";
import { IconCircleFilled, IconPlus } from "@tabler/icons-react";
import Quick from "@/components/campaignsSetup/quick/Quick";
import Guided from "@/components/campaignsSetup/guided/Guided";
import { useContext } from "react";
import AppContext from "@/shared/AppContext";
import { upperFirst } from "lodash";
import { UserTabModes, ViewModes } from "@/models/general.models";
import CampaignSelectorCards from "@/components/campaignSelector/cards/CampaignSelector";
import CampaignSelectorTable from "@/components/campaignSelector/table/CampaignSelectorTable";
import CampaignSelectorCalendar from "@/components/campaignSelector/calendar/CampaignSelectorCalendar";
import Banners from "@/components/videoBanner/Banners";
import { usePractice } from "@/shared/PracticeProvider";
import StyledButton from "@/components/styledButton/StyledButton";
import CopyPracticeCampaigns from "@/components/practiceSelector/CopyPracticeCampaigns";

export function DashboardContent() {
  const {
    state: { filters },
  } = useContext(AppContext);
  const { activePracticeName, unitedView } = usePractice();

  const isSelections = filters.userSelectedTab === UserTabModes.Selected;

  // Render logic for main content
  const renderContent = () => {
    if (isSelections && filters.viewMode === ViewModes.Calendar) {
      return <CampaignSelectorCalendar />;
    }

    if (filters.viewMode === ViewModes.Table) {
      return <CampaignSelectorTable />;
    }

    // Default fallback to Card view
    return <CampaignSelectorCards />;
  };

  return (
    <Paper pt={10} h="100%">
      <Stack gap={25}>
        <Banners />
        <StyledTabs />

        <Group align="center" justify="space-between">
          <Stack gap={5}>
            <Title order={3}>
              {unitedView ? "All" : activePracticeName}
              {isSelections ? " Selections" : " - Select Campaigns"}
            </Title>
            <Flex align={"center"} gap={20}>
              <Text size="sm" c={"gray.8"}>
                {isSelections
                  ? "Manage your chosen campaigns"
                  : "Browse and add campaigns to your plan"}
              </Text>
              <IconCircleFilled size={4} />
              <Text size="sm" c={"gray.8"}>
                {upperFirst(filters.viewMode)} View
              </Text>
            </Flex>
          </Stack>

          {!isSelections && (
            <Flex gap={12}>
              <Quick />
              <Guided />
            </Flex>
          )}

          {isSelections && filters.viewMode === ViewModes.Calendar && (
            <CopyPracticeCampaigns />
          )}
        </Group>

        <Divider size={"xs"} color="gray.1" />
      </Stack>

      <Stack gap={25} pt={25}>
        {renderContent()}
      </Stack>
    </Paper>
  );
}
