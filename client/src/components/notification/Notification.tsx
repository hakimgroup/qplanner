import {
  ActionIcon,
  Badge,
  Card,
  Divider,
  Flex,
  Indicator,
  Loader,
  Menu,
  Stack,
  Text,
  useMantineTheme,
  Box,
} from "@mantine/core";
import { IconBell, IconFileText } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";

import StyledButton from "../styledButton/StyledButton";

import { useNotifications } from "@/hooks/notification.hooks";
import { useNotificationOpen } from "@/pages/notificationsCenter/useNotificationOpen.hook";

const Notification = () => {
  const T = useMantineTheme();
  const navigate = useNavigate();

  // fetch notifications (same hook used in NotificationsList)
  const {
    data: notifications,
    isLoading: loadingNotifications,
    isError,
  } = useNotifications({
    onlyUnread: false,
    limit: 10,
    offset: 0,
  });

  // modal / open flow hook
  const {
    handleOpenNotification,
    NotificationModalRenderer,
    openingId,
    isOpening,
  } = useNotificationOpen();

  // derive unread count
  const unreadCount = (notifications || []).filter((n) => !n.read_at).length;

  return (
    <>
      <Menu shadow="md" width={320} position="bottom-end">
        <Menu.Target>
          <Indicator
            inline
            disabled={unreadCount === 0}
            label={unreadCount > 9 ? "9+" : String(unreadCount || "")}
            size={19}
            color="red"
            offset={5}
          >
            <ActionIcon variant="subtle" size="lg" radius={10} color="violet">
              <IconBell color={T.colors.gray[9]} size={18} />
            </ActionIcon>
          </Indicator>
        </Menu.Target>

        <Menu.Dropdown p={0}>
          <Box p={15} pb={10}>
            <Flex align="center" justify="space-between">
              <Text fw={700} size="md" c="gray.9">
                Notifications
              </Text>

              <Badge
                color={unreadCount > 0 ? "red.4" : "gray.4"}
                variant={unreadCount > 0 ? "filled" : "light"}
              >
                {unreadCount > 0 ? `${unreadCount} new` : "No new"}
              </Badge>
            </Flex>
          </Box>

          <Divider size="xs" color="gray.1" />

          {/* Body list */}
          <Box
            style={{
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            {loadingNotifications && (
              <Flex align="center" justify="center" p={20}>
                <Loader size="sm" />
              </Flex>
            )}

            {isError && !loadingNotifications && (
              <Flex align="center" justify="center" p={20}>
                <Text c="red.6" size="sm">
                  Failed to load notifications.
                </Text>
              </Flex>
            )}

            {!loadingNotifications &&
              !isError &&
              notifications &&
              notifications.length === 0 && (
                <Flex align="center" justify="center" p={20}>
                  <Text c="gray.6" size="sm">
                    You're all caught up.
                  </Text>
                </Flex>
              )}

            {!loadingNotifications &&
              !isError &&
              (notifications || []).map((n) => {
                // highlight unread
                const isUnread = !n.read_at;
                const isThisOpening = openingId === n.id && isOpening;

                // quick summary line for assets / message
                // we'll try to pull some human-readable info:
                // - if notification.type === "requested": "Assets requested"
                // - if notification.type === "inProgress": "Practice submitted assets"
                // - fallback to n.message
                let summaryText = n.message || "";
                if (!summaryText) {
                  if (n.type === "requested") {
                    summaryText = "Assets requested from your practice";
                  } else if (n.type === "inProgress") {
                    summaryText = "Practice submitted campaign assets";
                  }
                }

                return (
                  <Menu.Item
                    key={n.id}
                    onClick={() => handleOpenNotification(n, false)}
                    p={0}
                    style={{ cursor: "pointer" }}
                  >
                    <Card
                      bg={"transparent"}
                      px={15}
                      py={12}
                      w="100%"
                      style={{
                        opacity: isThisOpening ? 0.5 : 1,
                        backgroundColor: isUnread
                          ? T.colors.gray[0]
                          : "transparent",
                      }}
                    >
                      <Flex gap={10} align="flex-start">
                        <Box mt={3}>
                          <IconFileText
                            size={18}
                            color={
                              isUnread
                                ? T.colors.blue[5]
                                : T.colors.blue[3] ?? T.colors.blue[5]
                            }
                          />
                        </Box>

                        <Stack w="100%" gap={5}>
                          {/* Top row: campaign / practice / unread badge */}
                          <Flex justify="space-between" w="100%">
                            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                              <Text
                                size="sm"
                                fw={500}
                                c="gray.9"
                                lineClamp={1}
                                style={{ wordBreak: "break-word" }}
                              >
                                {n.payload?.name || "Campaign"}
                              </Text>

                              <Text
                                size="xs"
                                c="gray.7"
                                lineClamp={1}
                                style={{ wordBreak: "break-word" }}
                              >
                                {n.practice_name ? `${n.practice_name}` : "—"}
                              </Text>
                            </Stack>

                            <Flex gap={6} align="flex-start">
                              {isThisOpening && <Loader size="xs" />}

                              {isUnread && !isThisOpening && (
                                <Badge color="red.6">
                                  <Text size="xs" fw={600} mt={1}>
                                    New
                                  </Text>
                                </Badge>
                              )}
                            </Flex>
                          </Flex>

                          {/* Middle row: summary text */}
                          {summaryText && (
                            <Text
                              size="xs"
                              c="gray.7"
                              style={{ wordBreak: "break-word" }}
                              lineClamp={2}
                            >
                              {summaryText}
                            </Text>
                          )}

                          {/* Bottom row: timestamp */}
                          <Text size="xs" c="gray.5">
                            {n.created_at
                              ? new Date(n.created_at).toLocaleString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </Text>
                        </Stack>
                      </Flex>
                    </Card>

                    <Divider size="xs" color="gray.1" />
                  </Menu.Item>
                );
              })}
          </Box>

          {/* Footer */}
          <Stack gap={8} mb={10} pl={15} pr={15} pt={10}>
            <StyledButton
              fw={500}
              size="sm"
              fullWidth
              onClick={() => navigate(AppRoutes.NotificationsCenter)}
            >
              View all notifications
            </StyledButton>
          </Stack>
        </Menu.Dropdown>
      </Menu>

      {/* Mount the modal(s) here so they're available globally in the navbar */}
      <NotificationModalRenderer />
    </>
  );
};

export default Notification;
