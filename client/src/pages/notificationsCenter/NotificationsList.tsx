// components/notifications/NotificationsList.tsx
import { useState, useMemo } from "react";
import { useNotifications } from "@/hooks/notification.hooks";
import {
  Stack,
  Text,
  Center,
  Box,
  Group,
  LoadingOverlay,
  Pagination,
} from "@mantine/core";

import NotificationCard from "./NotificationCard";
import { useNotificationOpen } from "./useNotificationOpen.hook";
import NotificationsFilters, {
  NotificationFilterValues,
} from "./NotificationsFilters";
import EmptyState from "@/components/emptyState/EmptyState";
import { useAuth } from "@/shared/AuthProvider";

const PAGE_SIZE = 25;

export default function NotificationsList() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);

  // 1) local filters from UI
  const [filters, setFilters] = useState<NotificationFilterValues>({
    practice: "all",
    type: "all",
    status: "all",
    campaign: "all",
    startDate: null,
    endDate: null,
  });

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: NotificationFilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Map UI -> server params
  const practiceId =
    !filters.practice || filters.practice === "all" ? null : filters.practice;

  const notifType =
    !filters.type || filters.type === "all" ? null : filters.type;

  const category = filters.campaign !== "all" ? filters.campaign : null;

  const readStatus =
    filters.status === "read"
      ? "read"
      : filters.status === "unread"
      ? "unread"
      : null;

  const startDate = filters.startDate;
  const endDate = filters.endDate;

  // 2) server call with pagination
  const { data, isLoading, isError } = useNotifications({
    practiceId,
    type: notifType,
    category,
    startDate,
    endDate,
    readStatus,
    limit: PAGE_SIZE + 1, // fetch one extra to know if there's a next page
    offset: (page - 1) * PAGE_SIZE,
    asPractice: isAdmin,
  });

  const {
    handleOpenNotification,
    NotificationModalRenderer,
    openingId,
    isOpening,
  } = useNotificationOpen();

  const hasMore = (data?.length ?? 0) > PAGE_SIZE;
  const list = useMemo(
    () => (data ?? []).slice(0, PAGE_SIZE),
    [data]
  );

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
        <NotificationsFilters onChange={handleFilterChange} />
        <EmptyState title="No notifications" message="You're all caught up." />
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <NotificationsFilters onChange={handleFilterChange} />

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
            Page {page} — {list.length} notification{list.length !== 1 ? "s" : ""}
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

        {(page > 1 || hasMore) && (
          <Group justify="center" mt="md">
            <Pagination
              total={hasMore ? page + 1 : page}
              value={page}
              onChange={setPage}
              size="sm"
              radius="md"
            />
          </Group>
        )}
      </Stack>

      <NotificationModalRenderer />
    </Stack>
  );
}
