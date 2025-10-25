// components/notifications/NotificationCard.tsx
import { NotificationRow } from "@/models/notification.models";
import {
  getNotificationCampaignName,
  getNotificationCategory,
  getNotificationCreatedLabel,
  getNotificationBadgeType,
  getNotificationPracticeName,
} from "@/shared/shared.utilities";
import {
  Card,
  Group,
  Text,
  Badge,
  Flex,
  ThemeIcon,
  useMantineTheme,
  Indicator,
} from "@mantine/core";
import { IconPalette } from "@tabler/icons-react";

export interface NotificationCardProps {
  notification: NotificationRow;
  onClick?: (n: NotificationRow) => void;
}

export default function NotificationCard({
  notification,
  onClick,
}: NotificationCardProps) {
  const C = useMantineTheme().colors;

  const campaignName = getNotificationCampaignName(notification);
  const category = getNotificationCategory(notification);
  const createdAtLabel = getNotificationCreatedLabel(notification);
  const typeLabel = getNotificationBadgeType(notification);
  const practiceName = getNotificationPracticeName(notification);

  const isUnread = !notification.read_at;

  return (
    <Indicator
      inline
      size={13}
      offset={15}
      color="blue.3"
      withBorder
      disabled={!isUnread}
    >
      <Card
        withBorder={false}
        radius={10}
        px="md"
        py="sm"
        bg="#f9f9fb"
        shadow="xs"
        style={{
          borderLeft: `4px solid ${C.blue[3]}`,
          border: `1px solid ${C.gray[0]}`,
          cursor: "pointer",
        }}
        onClick={() => onClick?.(notification)}
      >
        <Group gap="sm" align="flex-start" style={{ flex: 1 }}>
          <ThemeIcon
            radius="xl"
            color="blue.5"
            size={30}
            variant="light"
            style={{
              marginTop: 4,
              backgroundColor: "rgba(76,110,245,0.1)",
            }}
          >
            {/* we can later vary icon by notification.type */}
            <IconPalette size={16} stroke={1.5} />
          </ThemeIcon>

          <Flex direction="column" gap={4} style={{ flex: 1 }}>
            {/* Title */}
            <Text fw={600} fz="sm" c="gray.9">
              {notification.title || "New update"}
            </Text>

            {/* Message */}
            <Text fz="sm" c="gray.7">
              {notification.message ||
                "You have an update related to this campaign."}
            </Text>

            {/* Meta row */}
            <Group mt={6} justify="space-between">
              <Group gap="xs">
                {/* timestamp */}
                <Text size="xs" c="gray.6">
                  {createdAtLabel}
                </Text>

                {/* campaign name */}
                {campaignName && (
                  <Badge
                    color="gray"
                    variant="light"
                    radius="sm"
                    fz="xs"
                    tt="none"
                    px={8}
                  >
                    {campaignName}
                  </Badge>
                )}

                {/* category */}
                {category && (
                  <Badge
                    color="grape"
                    variant="light"
                    radius="sm"
                    fz="xs"
                    tt="none"
                    px={8}
                  >
                    {category}
                  </Badge>
                )}

                {/* type label ("Assets Requested", etc.) */}
                <Badge
                  color="pink"
                  variant="filled"
                  radius="sm"
                  fz="xs"
                  tt="none"
                  px={8}
                >
                  {typeLabel}
                </Badge>
              </Group>

              {/* practice name */}
              {practiceName && (
                <Badge
                  color="indigo"
                  variant="light"
                  radius="sm"
                  fz="xs"
                  tt="none"
                  px={8}
                >
                  {practiceName}
                </Badge>
              )}
            </Group>
          </Flex>
        </Group>
      </Card>
    </Indicator>
  );
}
