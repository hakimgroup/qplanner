// components/notifications/NotificationCard.tsx
import { NotificationRow } from "@/models/notification.models";
import { activityColors, statusColors } from "@/shared/shared.const";
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
  LoadingOverlay,
} from "@mantine/core";
import { IconPalette } from "@tabler/icons-react";
import { toLower } from "lodash";

export interface NotificationCardProps {
  isOpening?: boolean;
  notification: NotificationRow;
  onClick?: (n: NotificationRow) => void;
}

export default function NotificationCard({
  isOpening = false,
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
      size={12}
      offset={20}
      color="blue.3"
      processing
      withBorder
      w="100%"
      disabled={!isUnread}
    >
      <Card
        radius={10}
        withBorder
        px="md"
        py="sm"
        bg="#f9f9fb"
        shadow="xs"
        style={{
          border: `1px solid ${C.gray[0]}`,
          borderLeft: `4px solid ${C.blue[3]}`,
          cursor: "pointer",
        }}
        onClick={() => onClick?.(notification)}
      >
        <LoadingOverlay
          visible={isOpening}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "blue.3" }}
        />

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
              {campaignName || "New update"}
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
                    color={activityColors[toLower(category)]}
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
                  color={statusColors[notification.type]}
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
