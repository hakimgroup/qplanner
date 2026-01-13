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
  ThemeIcon,
  ScrollArea,
} from "@mantine/core";
import {
  IconBell,
  IconPlus,
  IconPencil,
  IconTrash,
  IconSparkles,
  IconCalendarEvent,
  IconStack2,
  IconCopy,
  IconFileText,
  IconSend,
  IconClipboardCheck,
  IconClock,
  IconBuilding,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { ActorNotificationType, AppRoutes, SelectionStatus } from "@/shared/shared.models";

import StyledButton from "../styledButton/StyledButton";

import { useNotifications } from "@/hooks/notification.hooks";
import { useNotificationOpen } from "@/pages/notificationsCenter/useNotificationOpen.hook";
import { useAuth } from "@/shared/AuthProvider";

/**
 * Get relative time string from a date
 */
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get notification icon and color based on type
 */
function getNotificationStyle(type: string): {
  icon: typeof IconBell;
  color: string;
} {
  switch (type) {
    case ActorNotificationType.CampaignAdded:
      return { icon: IconPlus, color: "green" };
    case ActorNotificationType.CampaignUpdated:
      return { icon: IconPencil, color: "blue" };
    case ActorNotificationType.CampaignDeleted:
      return { icon: IconTrash, color: "red" };
    case ActorNotificationType.BespokeAdded:
      return { icon: IconSparkles, color: "violet" };
    case ActorNotificationType.BespokeEventAdded:
      return { icon: IconCalendarEvent, color: "orange" };
    case ActorNotificationType.BulkAdded:
      return { icon: IconStack2, color: "teal" };
    case ActorNotificationType.CampaignsCopied:
      return { icon: IconCopy, color: "indigo" };
    case SelectionStatus.Requested:
      return { icon: IconSend, color: "orange" };
    case SelectionStatus.InProgress:
      return { icon: IconClipboardCheck, color: "blue" };
    case SelectionStatus.AwaitingApproval:
      return { icon: IconFileText, color: "violet" };
    default:
      return { icon: IconFileText, color: "blue" };
  }
}

const Notification = () => {
  const T = useMantineTheme();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // fetch notifications (same hook used in NotificationsList)
  const {
    data: notifications,
    isLoading: loadingNotifications,
    isError,
  } = useNotifications({
    readStatus: null,
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

          {/* Body list with ScrollArea */}
          <ScrollArea.Autosize mah={380} type="auto" offsetScrollbars scrollbarSize={6}>
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
                <Flex align="center" justify="center" py="xl" direction="column" gap="xs">
                  <ThemeIcon size="xl" radius="xl" color="gray" variant="light">
                    <IconBell size={20} />
                  </ThemeIcon>
                  <Text c="gray.6" size="sm" fw={500}>
                    No notifications
                  </Text>
                  <Text c="gray.5" size="xs">
                    You're all caught up!
                  </Text>
                </Flex>
              )}

            {!loadingNotifications &&
              !isError &&
              (notifications || []).map((n) => {
                // highlight unread
                const isUnread = !n.read_at;
                const isThisOpening = openingId === n.id && isOpening;

                // Get type-based icon and color
                const style = getNotificationStyle(n.type);
                const NotifIcon = style.icon;

                // quick summary line for assets / message
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
                          <ThemeIcon
                            size="sm"
                            radius="sm"
                            color={style.color}
                            variant="light"
                          >
                            <NotifIcon size={14} />
                          </ThemeIcon>
                        </Box>

                        <Stack w="100%" gap={4}>
                          {/* Top row: campaign name + unread badge */}
                          <Flex justify="space-between" w="100%" align="center">
                            <Text
                              size="sm"
                              fw={600}
                              c="dark.7"
                              lineClamp={1}
                              style={{ wordBreak: "break-word", flex: 1, minWidth: 0 }}
                            >
                              {n.payload?.name || "Campaign"}
                            </Text>

                            <Flex gap={6} align="center" style={{ flexShrink: 0 }}>
                              {isThisOpening && <Loader size="xs" />}

                              {isUnread && !isThisOpening && (
                                <Badge color="red.6" size="xs">
                                  New
                                </Badge>
                              )}
                            </Flex>
                          </Flex>

                          {/* Description text */}
                          {summaryText && (
                            <Text
                              size="xs"
                              c="dark.4"
                              style={{ wordBreak: "break-word" }}
                              lineClamp={2}
                            >
                              {summaryText}
                            </Text>
                          )}

                          {/* Bottom row: practice + timestamp */}
                          <Flex justify="space-between" align="center" mt={2}>
                            {n.practice_name && (
                              <Flex align="center" gap={4} style={{ flex: 1, minWidth: 0 }}>
                                <IconBuilding size={12} color={T.colors[style.color]?.[5] || T.colors.blue[5]} />
                                <Text
                                  size="xs"
                                  fw={500}
                                  c={`${style.color}.6`}
                                  lineClamp={1}
                                  style={{ wordBreak: "break-word" }}
                                >
                                  {n.practice_name}
                                </Text>
                              </Flex>
                            )}

                            <Flex align="center" gap={3} style={{ flexShrink: 0 }}>
                              <IconClock size={11} color={T.colors.gray[5]} />
                              <Text size="xs" c="gray.5">
                                {n.created_at ? getRelativeTime(n.created_at) : ""}
                              </Text>
                            </Flex>
                          </Flex>
                        </Stack>
                      </Flex>
                    </Card>

                    <Divider size="xs" color="gray.1" />
                  </Menu.Item>
                );
              })}
          </ScrollArea.Autosize>

          {/* Footer */}
          <Stack gap={8} mb={10} pl={15} pr={15} pt={10}>
            <StyledButton
              fw={500}
              size="sm"
              fullWidth
              onClick={() => {
                if (isAdmin) {
                  navigate(`${AppRoutes.Admin}/${AppRoutes.Notifications}`);
                } else {
                  navigate(AppRoutes.NotificationsCenter);
                }
              }}
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
