import {
  Stack,
  Text,
  ThemeIcon,
  Button,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  compact?: boolean; // if true, tighter paddings + smaller text (e.g. dropdowns)
};

export default function EmptyState({
  icon,
  title = "Nothing here yet",
  message = "Once there's activity, it will show up here.",
  ctaLabel,
  onCtaClick,
  compact = false,
}: EmptyStateProps) {
  const theme = useMantineTheme();

  const content = (
    <Stack
      gap={compact ? 6 : 8}
      align="center"
      justify="center"
      style={{
        textAlign: "center",
        maxWidth: rem(260),
      }}
    >
      {/* Icon */}
      <ThemeIcon
        variant="light"
        radius="xl"
        size={compact ? 34 : 40}
        color={theme.colors.blue[4]}
        style={{
          backgroundColor: theme.colors.blue[0],
        }}
      >
        {icon ?? <IconInbox size={18} stroke={1.5} />}
      </ThemeIcon>

      <Stack gap={2} mt={5}>
        {/* Title */}
        <Text
          fw={600}
          c="gray.8"
          size={compact ? "sm" : "sm"}
          style={{ lineHeight: 1.3 }}
        >
          {title}
        </Text>

        {/* Message */}
        <Text
          size={compact ? "xs" : "xs"}
          c="blue.3"
          style={{ lineHeight: 1.4 }}
        >
          {message}
        </Text>
      </Stack>

      {/* Optional CTA */}
      {ctaLabel && onCtaClick && (
        <Button
          size={compact ? "xs" : "sm"}
          radius="md"
          variant="light"
          color="blue.5"
          onClick={onCtaClick}
          styles={{
            root: {
              fontWeight: 500,
            },
          }}
        >
          {ctaLabel}
        </Button>
      )}
    </Stack>
  );

  // Wrapper flexbox to center it wherever you drop it
  return (
    <Stack
      align="center"
      justify="center"
      style={{
        width: "100%",
        minHeight: compact ? rem(80) : rem(140),
      }}
    >
      {content}
    </Stack>
  );
}
