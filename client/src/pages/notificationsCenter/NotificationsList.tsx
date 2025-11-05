// components/notifications/NotificationsList.tsx
import { useState, useMemo } from "react";
import { useNotifications } from "@/hooks/notification.hooks";
import { Stack, Text, Center, Box, Group, LoadingOverlay } from "@mantine/core";

import NotificationCard from "./NotificationCard";
import { useNotificationOpen } from "./useNotificationOpen.hook";
import NotificationsFilters, {
  NotificationFilterValues,
} from "./NotificationsFilters";
import EmptyState from "@/components/emptyState/EmptyState";

export default function NotificationsList() {
  // 1) local filters from UI
  const [filters, setFilters] = useState<NotificationFilterValues>({
    practice: "all",
    type: "all",
    status: "all",
    campaign: "all",
    startDate: null,
    endDate: null,
  });

  // Map UI -> server params
  const practiceId =
    !filters.practice || filters.practice === "all" ? null : filters.practice;

  const notifType =
    !filters.type || filters.type === "all" ? null : filters.type;

  // campaign filter is re-used as category for RPC:
  // guided -> 'Campaign'; bespoke -> null (no category filter)
  const category = filters.campaign !== "all" ? filters.campaign : null;

  // read status for server ('read' | 'unread' | null)
  const readStatus =
    filters.status === "read"
      ? "read"
      : filters.status === "unread"
      ? "unread"
      : null;

  // dates to server (as Date | null; your hook will cast to YYYY-MM-DD)
  const startDate = filters.startDate;
  const endDate = filters.endDate;

  // 2) server call
  const { data, isLoading, isError } = useNotifications({
    practiceId,
    type: notifType,
    category, // NEW
    startDate, // NEW
    endDate, // NEW
    readStatus, // NEW (replaces onlyUnread)
    limit: 50,
    offset: 0,
  });

  const {
    handleOpenNotification,
    NotificationModalRenderer,
    openingId,
    isOpening,
  } = useNotificationOpen();

  // no more client-side date/status filtering; keep only defensive checks if you want
  const list = useMemo(() => data ?? [], [data]);

  const total = data?.length ?? 0;
  const shown = list.length;

  if (isError) {
    return (
      <Center py="xl">
        <Text c="red.6" size="sm">
          Failed to load notifications.
        </Text>
      </Center>
    );
  }

  if ((!list || list.length === 0) && !isLoading) {
    return (
      <Stack gap="sm">
        <NotificationsFilters onChange={setFilters} />
        <EmptyState title="No notifications" message="You're all caught up." />
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <NotificationsFilters onChange={setFilters} />

      <Stack pos="relative">
        <LoadingOverlay
          mih={100}
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "blue.3" }}
        />

        <Group align="center" justify="space-between">
          <Text size="sm" c="blue.3">
            {shown} of {total} notifications
          </Text>
          <Text size="sm" fw={700}>
            Newest first
          </Text>
        </Group>

        {list.map((n: any) => {
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
      </Stack>

      <NotificationModalRenderer />
    </Stack>
  );
}
