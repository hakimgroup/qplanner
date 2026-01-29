import StyledTabs from "@/components/styledTabs/StyledTabs";
import { Center, Container, Stack, Text } from "@mantine/core";
import { useState } from "react";
import NotificationsFilters from "./NotificationsFilters";
import NotificationsList from "./NotificationsList";
import CampaignStatusDashboard from "./CampaignStatusDashboard";

enum NotifTabs {
  Notifications = "notifications",
  Status = "status",
}

const NotificationsCenter = () => {
  const [active, setActive] = useState<NotifTabs>(NotifTabs.Notifications);

  const section = {
    [NotifTabs.Notifications]: <NotificationsList />,
    [NotifTabs.Status]: <CampaignStatusDashboard />,
  };

  return (
    <Container size={1280} mx="auto">
      <Stack gap={25}>
        <StyledTabs
          value={active}
          onChange={setActive as any}
          mt={25}
          data={[
            {
              value: NotifTabs.Notifications,
              label: (
                <Center pt={10} pb={10}>
                  <Stack gap={4}>
                    <Text fw={700} size="sm" c="gray.9">
                      📬 Notifications
                    </Text>
                    <Text size="xs">Messages and updates</Text>
                  </Stack>
                </Center>
              ),
            },
            {
              value: NotifTabs.Status,
              label: (
                <Center pt={10} pb={10}>
                  <Stack gap={4}>
                    <Text fw={700} size="sm" c="gray.9">
                      📊 Status Dashboard
                    </Text>
                    <Text size="xs">Campaign status tracking</Text>
                  </Stack>
                </Center>
              ),
            },
          ]}
        />

        <Stack>{section[active]}</Stack>
      </Stack>
    </Container>
  );
};

export default NotificationsCenter;
