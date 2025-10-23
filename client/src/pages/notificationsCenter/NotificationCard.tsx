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

export default function NotificationCard() {
  const C = useMantineTheme().colors;

  return (
    <Indicator
      inline
      size={13}
      offset={15}
      color="blue.3"
      withBorder
      disabled={false}
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
            <IconPalette size={16} stroke={1.5} />
          </ThemeIcon>

          <Flex direction="column" gap={4} style={{ flex: 1 }}>
            <Text fw={600} fz="sm" c="gray.9">
              Final artwork ready for approval
            </Text>
            <Text fz="sm" c="gray.7">
              Updated Summer Promotion artwork incorporating your feedback is
              ready for final approval.
            </Text>

            <Group gap="xs" mt={6}>
              <Text size="xs" c="gray.6">
                Oct 23, 2025 9:25 AM
              </Text>
              <Badge
                color="gray"
                variant="light"
                radius="sm"
                fz="xs"
                tt="none"
                px={8}
              >
                Summer Promotion
              </Badge>
              <Badge
                color="pink"
                variant="filled"
                radius="sm"
                fz="xs"
                tt="none"
                px={8}
              >
                Artwork Confirmation
              </Badge>
            </Group>
          </Flex>
        </Group>
      </Card>
    </Indicator>
  );
}
