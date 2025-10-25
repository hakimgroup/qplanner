// components/notifications/NotificationsList.tsx
import { useNotifications } from "@/hooks/notification.hooks";
import { NotificationRow } from "@/models/notification.models";
import { Stack, Text, Loader, Center } from "@mantine/core";

import { useState } from "react";
import NotificationCard from "./NotificationCard";
import PracticeRespondModal from "./PracticeRespondModal";

export default function NotificationsList() {
  // You could pass filters here later (practiceId, onlyUnread, etc.)
  const { data, isLoading, isError } = useNotifications({
    onlyUnread: false,
    limit: 50,
    offset: 0,
  });

  // We'll need this soon (Step 2) to open the detail / "respond" modal
  const [activeNotification, setActiveNotification] =
    useState<NotificationRow | null>(null);

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
      <Center py="xl">
        <Text c="gray.6" size="sm">
          No notifications yet.
        </Text>
      </Center>
    );
  }

  return (
    <Stack gap="sm">
      {data.map((n) => (
        <NotificationCard
          key={n.id}
          notification={n}
          onClick={(row) => {
            setActiveNotification(n);
          }}
        />
      ))}

      <PracticeRespondModal
        opened={!!activeNotification}
        notification={activeNotification}
        onClose={() => setActiveNotification(null)}
      />
    </Stack>
  );
}
