import {
  Title,
  Paper,
  Stack,
  Group,
  Flex,
  Text,
  Divider,
  Center,
  Button,
} from "@mantine/core";
import { IconCircleFilled, IconMail } from "@tabler/icons-react";
import Quick from "@/components/campaignsSetup/quick/Quick";
import Guided from "@/components/campaignsSetup/guided/Guided";
import { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AppContext from "@/shared/AppContext";
import { upperFirst } from "lodash";
import { UserTabModes, ViewModes } from "@/models/general.models";
import CampaignSelectorCards from "@/components/campaignSelector/cards/CampaignSelector";
import CampaignSelectorTable from "@/components/campaignSelector/table/CampaignSelectorTable";
import CampaignSelectorCalendar from "@/components/campaignSelector/calendar/CampaignSelectorCalendar";
import Banners from "@/components/videoBanner/Banners";
import { usePractice } from "@/shared/PracticeProvider";
import CopyPracticeCampaigns from "@/components/practiceSelector/CopyPracticeCampaigns";
import { updateState } from "@/shared/shared.utilities";
import StyledTabs from "@/components/styledTabs/StyledTabs";
import { sendPlannerOverviewEmails } from "@/api/emails";
import { toast } from "sonner";

export function DashboardContent() {
  const {
    state: {
      filters,
      allCampaigns: { hasPlans },
    },
    setState,
  } = useContext(AppContext);
  const { activePracticeName, unitedView, setActivePracticeId, setUnitedView } =
    usePractice();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sendingEmails, setSendingEmails] = useState(false);

  // Handle tab URL parameter on mount
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl === UserTabModes.Selected || tabFromUrl === UserTabModes.Browse) {
      updateState(setState, "filters.userSelectedTab", tabFromUrl);
      // Clear the tab param from URL after applying it
      searchParams.delete("tab");
      setSearchParams(searchParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isSelections = filters.userSelectedTab === UserTabModes.Selected;

  // TEMPORARY: Test button for sending planner overview emails
  const handleSendPlannerOverviewEmails = async () => {
    setSendingEmails(true);
    try {
      const result = await sendPlannerOverviewEmails();
      if (result.errors.length > 0) {
        toast.warning(`Sent ${result.sent} emails with ${result.errors.length} errors`, {
          description: result.errors.slice(0, 3).join(", "),
        });
      } else {
        toast.success(`Sent ${result.sent} planner overview emails to ${result.practices.length} practices`);
      }
      console.log("[Test] Planner overview emails result:", result);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to send emails");
      console.error("[Test] Planner overview emails error:", error);
    } finally {
      setSendingEmails(false);
    }
  };

  const handleTabChange = (tab: string) => {
    updateState(setState, "filters.userSelectedTab", tab);

    if (tab === UserTabModes.Browse) {
      setActivePracticeId(localStorage.getItem("active_practice_id"));
      setUnitedView(false);
    }
  };

  // 🧱 Main content renderer
  const renderContent = () => {
    if (isSelections && filters.viewMode === ViewModes.Calendar) {
      return <CampaignSelectorCalendar />;
    }
    if (filters.viewMode === ViewModes.Table) {
      return <CampaignSelectorTable />;
    }
    return <CampaignSelectorCards />;
  };

  return (
    <Paper pt={10} h="100%">
      <Stack gap={25}>
        {/* TEMPORARY: Test button for sending planner overview emails - REMOVE AFTER TESTING */}
        <Group justify="flex-end" pr={20}>
          <Button
            leftSection={<IconMail size={16} />}
            loading={sendingEmails}
            onClick={handleSendPlannerOverviewEmails}
            color="violet"
            variant="filled"
          >
            [TEST] Send Overview Emails
          </Button>
        </Group>

        <Banners />
        <StyledTabs
          value={filters.userSelectedTab}
          onChange={handleTabChange}
          mt={hasPlans ? 15 : 0}
          data={[
            {
              value: UserTabModes.Browse,
              label: (
                <Center pt={10} pb={10}>
                  <Stack gap={4}>
                    <Text fw={700} size="sm" c="gray.9">
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
                    <Text fw={700} size="sm" c="gray.9">
                      ✓ Practice Selections
                    </Text>
                    <Text size="xs">View your chosen campaigns</Text>
                  </Stack>
                </Center>
              ),
            },
          ]}
        />

        <Group align="center" justify="space-between">
          <Stack gap={5}>
            <Title order={3}>
              {unitedView ? "All" : activePracticeName}
              {isSelections ? " Selections" : " - Select Campaigns"}
            </Title>
            <Flex align="center" gap={20}>
              <Text size="sm" c="gray.8">
                {isSelections
                  ? "Manage your chosen campaigns"
                  : "Browse and add campaigns to your plan"}
              </Text>
              <IconCircleFilled size={4} />
              <Text size="sm" c="gray.8">
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

        <Divider size="xs" color="gray.1" />
      </Stack>

      <Stack gap={25} pt={25}>
        {renderContent()}
      </Stack>
    </Paper>
  );
}
