// components/notifications/NotificationsList.tsx
import { useNotifications } from "@/hooks/notification.hooks";
import { Stack, Text, Loader, Center, Box, Group } from "@mantine/core";

import NotificationCard from "./NotificationCard";
import { useNotificationOpen } from "./useNotificationOpen.hook";
import NotificationsFilters from "./NotificationsFilters";
import EmptyState from "@/components/emptyState/EmptyState";

export default function NotificationsList() {
  // You could pass filters here later (practiceId, onlyUnread, etc.)
  const { data, isLoading, isError } = useNotifications({
    onlyUnread: false,
    limit: 50,
    offset: 0,
  });

  const {
    handleOpenNotification,
    NotificationModalRenderer,
    openingId,
    isOpening,
  } = useNotificationOpen();

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center py="xl">
        <Text c="red.6" size="sm">
          Failed to load notifications.
        </Text>
      </Center>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState title="No notifications" message="You're all caught up." />
    );
  }

  return (
    <Stack gap="sm">
      <NotificationsFilters />

      <Group align="center" justify="space-between">
        <Text size="sm" c="blue.3">
          7 of 7 notifications
        </Text>
        <Text size="sm" fw={700}>
          Newest first
        </Text>
      </Group>

      {data.map((n) => {
        const loadingThisCard = isOpening && openingId === n.id;

        return (
          <Box
            w="100%"
            key={n.id}
            onClick={() => handleOpenNotification(n, false)}
          >
            <NotificationCard notification={n} isOpening={loadingThisCard} />
          </Box>
        );
      })}

      <NotificationModalRenderer />
    </Stack>
  );
}
