import {
  Modal,
  Stack,
  Group,
  Text,
  Card,
  SimpleGrid,
  Badge,
  Divider,
  Flex,
  Button,
  useMantineTheme,
  ThemeIcon,
  ActionIcon,
} from "@mantine/core";
import {
  IconClock,
  IconCircleCheck,
  IconCircle,
  IconBox,
  IconExternalLink,
} from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { activityColors } from "@/shared/shared.const";
import StyledButton from "@/components/styledButton/StyledButton";
import { useMarkNotificationRead } from "@/hooks/notification.hooks";
import { toLower } from "lodash";

/**
 * Types the shape of each asset line in payload.assets as submitted by the practice
 * via submit_assets.
 */
type SubmittedAsset = {
  name: string;
  type: string; // "default" | "card" | "free" | "external"
  price: number | null;
  suffix: string | null;
  quantity: number;
  userSelected: boolean;
  chosenOptionLabel: string | null;
  chosenOptionValue: number | null;
  options: { label: string; value: number }[];
  note: string | null;
};

type SubmittedAssetsGroup = {
  printedAssets: SubmittedAsset[];
  digitalAssets: SubmittedAsset[];
  externalPlacements: SubmittedAsset[];
};

type Props = {
  opened: boolean;
  onClose: () => void;
  notification: any; // row from list_notifications
  selection?: any | null; // live selection row from useNotificationOpen
};

export default function AdminReviewSubmissionModal({
  opened,
  onClose,
  notification,
  selection,
}: Props) {
  const T = useMantineTheme();

  // pull what we need from the notification payload
  const payload = notification?.payload ?? {};
  const campaignName = payload?.name ?? "";
  const campaignCategory = payload?.category ?? "";

  // prefer live selection dates > payload dates
  const fromDate = selection?.from_date ?? payload?.from_date ?? null;
  const toDate = selection?.to_date ?? payload?.to_date ?? null;

  const chosenCreativeUrl = payload?.chosen_creative ?? null;
  const practiceNote = payload?.note ?? null;

  const assets: SubmittedAssetsGroup = payload?.assets ?? {
    printedAssets: [],
    digitalAssets: [],
    externalPlacements: [],
  };

  // hook for marking notification as read
  const { mutate: markRead, isPending: markingRead } =
    useMarkNotificationRead();

  function handleMarkRead() {
    if (!notification?.id) return;
    markRead(
      { notificationId: notification.id },
      {
        onSuccess: () => {},
        onError: (e: any) => {
          toast.error(e?.message ?? "Failed to mark as read");
        },
      }
    );
  }

  // cost helpers
  function lineDescriptor(a: SubmittedAsset): string {
    // Shown under asset name
    // For "card" assets we prefer chosen option, else cheapest
    if (a.type === "card") {
      if (a.chosenOptionLabel && a.chosenOptionValue != null) {
        return `£${a.chosenOptionValue} (${a.chosenOptionLabel})`;
      }
      if (a.options && a.options.length > 0) {
        const cheapest = [...a.options].sort(
          (x, y) => (x.value ?? 0) - (y.value ?? 0)
        )[0];
        if (cheapest) {
          return cheapest.label
            ? `From £${cheapest.value} (${cheapest.label})`
            : `From £${cheapest.value}`;
        }
      }
      return "£—";
    }

    if (a.type === "free" && (a.price === null || a.price === 0)) {
      return "Free";
    }

    if (a.price != null && !Number.isNaN(a.price)) {
      return a.suffix ? `£${a.price} ${a.suffix}` : `£${a.price}`;
    }

    return "£—";
  }

  function lineCost(a: SubmittedAsset): number {
    if (!a.userSelected) return 0;
    if (!a.quantity || a.quantity <= 0) return 0;

    if (a.type === "card") {
      if (a.chosenOptionValue != null && !Number.isNaN(a.chosenOptionValue)) {
        return a.chosenOptionValue * a.quantity;
      }
      // fallback: cheapest option
      if (a.options && a.options.length > 0) {
        const cheapest = [...a.options].sort(
          (x, y) => (x.value ?? 0) - (y.value ?? 0)
        )[0];
        if (cheapest && cheapest.value != null) {
          return cheapest.value * a.quantity;
        }
      }
      return 0;
    }

    if (a.price != null && !Number.isNaN(a.price)) {
      return a.price * a.quantity;
    }

    return 0;
  }

  function GBP(v: number): string {
    return `£${v.toFixed(2)}`;
  }

  const estimatedTotal = useMemo(() => {
    const all = [
      ...(assets.printedAssets ?? []),
      ...(assets.digitalAssets ?? []),
      ...(assets.externalPlacements ?? []),
    ];
    return all.reduce((sum, a) => sum + lineCost(a), 0);
  }, [assets]);

  // Render helpers
  const DateBlock = () => (
    <Card radius="md" px="md" py="md" bg={"gray.0"}>
      <Group justify="space-around" align="center">
        <Flex gap={10}>
          <Group gap={5} align="center">
            <IconClock size={15} />
            <Text c="gray.6" size="sm">
              Start Date:
            </Text>
          </Group>

          <Text c="blue.3" size="sm" fw={700}>
            {fromDate ? format(fromDate, "MMM dd, yyyy") : "—"}
          </Text>
        </Flex>

        <Flex gap={10}>
          <Group gap={5} align="center">
            <IconClock size={15} />
            <Text c="gray.6" size="sm">
              End Date:
            </Text>
          </Group>

          <Text c="blue.3" size="sm" fw={700}>
            {toDate ? format(toDate, "MMM dd, yyyy") : "—"}
          </Text>
        </Flex>
      </Group>
    </Card>
  );

  const CreativeBlock = () =>
    !chosenCreativeUrl ? null : (
      <Stack gap={8}>
        <Text fw={600} size="sm">
          Chosen Creative
        </Text>
        <Card
          withBorder
          radius="md"
          px="md"
          py="md"
          bg={"violet.0"}
          style={{
            borderColor: T.colors.blue[0],
          }}
        >
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text fw={700} size="xs" c="violet.9" lineClamp={1}>
                {chosenCreativeUrl}
              </Text>
              <Text size="xs" c="gray.6">
                The practice chose this artwork.
              </Text>
            </Stack>

            {/* optional "open externally" icon button */}
            <ActionIcon
              variant="subtle"
              component="a"
              color="violet.9"
              href={chosenCreativeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open creative"
            >
              <IconExternalLink size={16} />
            </ActionIcon>
          </Group>
        </Card>
      </Stack>
    );

  const PracticeNoteBlock = () =>
    !practiceNote ? null : (
      <Stack gap={6}>
        <Text fw={600} size="sm">
          Practice Notes
        </Text>
        <Card
          withBorder
          radius="md"
          px="md"
          py="sm"
          style={{
            borderColor: T.colors.indigo[0],
            backgroundColor: T.colors.indigo[0],
          }}
        >
          <Text size="sm" c="indigo.9">
            {practiceNote}
          </Text>
        </Card>
      </Stack>
    );

  const AssetCard = ({ asset }: { asset: SubmittedAsset }) => {
    const lineTotal = lineCost(asset);

    return (
      <Card
        withBorder
        radius="md"
        px="md"
        py="sm"
        style={{
          borderColor: T.colors.blue[0],
          background: "rgba(107,123,255,0.06)",
        }}
      >
        <Stack gap={8}>
          <Group justify="space-between" align="flex-start">
            <Stack gap={2} style={{ flex: 1 }}>
              <Text fw={600} size="sm">
                {asset.name}
              </Text>

              <Text size="sm" fw={600} c="blue.5" style={{ lineHeight: 1.3 }}>
                {lineDescriptor(asset)}
              </Text>

              <Text size="xs" c="gray.6">
                Qty:{" "}
                <Text
                  component="span"
                  fw={600}
                  c={asset.quantity > 0 ? "gray.9" : "gray.6"}
                >
                  {asset.quantity ?? 0}
                </Text>
                {asset.chosenOptionLabel ? ` • ${asset.chosenOptionLabel}` : ""}
              </Text>

              {asset.note && (
                <Text size="xs" fw={600} c="teal.9">
                  {asset.note}
                </Text>
              )}
            </Stack>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="xs" c="gray.6">
              Line total:
            </Text>
            <Text fw={700} size="sm" c="blue.5">
              {GBP(lineTotal)}
            </Text>
          </Group>
        </Stack>
      </Card>
    );
  };

  const AssetSection = ({
    title,
    list,
  }: {
    title: string;
    list: SubmittedAsset[];
  }) => (
    <Stack gap={8}>
      <Text fw={700} size="sm">
        {title}
      </Text>

      {(!list || list.length === 0) && (
        <Text size="xs" c="gray.6">
          None submitted
        </Text>
      )}

      {list && list.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {list.map((asset, idx) => (
            <AssetCard key={`${asset.name}-${idx}`} asset={asset} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );

  useEffect(() => {
    if (!notification?.read_at) {
      handleMarkRead();
    }
  }, [notification]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      radius="lg"
      centered
      size="56rem"
      overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
      title={
        <Stack gap={10}>
          <Group gap={5} align="center">
            <IconCircle color={T.colors.blue[3]} size={20} />
            <Text fw={600} size="lg">
              Submitted Assets
            </Text>
          </Group>

          <Group gap={6} wrap="wrap">
            <Text fw={600} size="lg">
              {campaignName || "Campaign"} Details
            </Text>

            {campaignCategory && (
              <Badge
                size="xs"
                radius="sm"
                color={activityColors[toLower(campaignCategory)]}
                variant={campaignCategory === "Event" ? "filled" : "light"}
                tt="none"
              >
                {campaignCategory}
              </Badge>
            )}
          </Group>
        </Stack>
      }
    >
      <Stack gap={30}>
        {/* Campaign period */}
        <DateBlock />

        {/* Chosen creative by practice */}
        <CreativeBlock />

        {/* Section header */}
        <Stack gap={8}>
          <Text fw={600} size="lg">
            Practice Selections
          </Text>
          <Group gap={8} align="center">
            <ThemeIcon variant="light" color="blue.5" radius="xl" size="sm">
              <IconBox size={14} />
            </ThemeIcon>
            <Text fw={500}>Chosen Assets</Text>
          </Group>
        </Stack>

        {/* Assets */}
        <AssetSection
          title="Printed Assets"
          list={assets.printedAssets ?? []}
        />

        <AssetSection
          title="Digital Assets"
          list={assets.digitalAssets ?? []}
        />

        <AssetSection
          title="Additional Placements"
          list={assets.externalPlacements ?? []}
        />

        {/* Practice note */}
        <PracticeNoteBlock />

        {/* Cost summary */}
        <Card
          radius="md"
          px="md"
          py="md"
          bg={"gray.0"}
          pos={"sticky"}
          bottom={20}
          withBorder
          style={{
            borderColor: T.colors.blue[0],
          }}
        >
          <Group justify="space-between" align="center">
            <Text c="gray.7" fw={600}>
              Estimated Total Cost:
            </Text>
            <Text fw={800} c={"blue.3"}>
              {GBP(estimatedTotal)}
            </Text>
          </Group>
        </Card>

        {/* Footer */}
        <Divider color="#e9ecef" />

        <Flex
          justify="flex-end"
          direction={{ base: "column", sm: "row" }}
          gap="md"
        >
          <Group justify="flex-end">
            <StyledButton variant="default" onClick={onClose}>
              Close
            </StyledButton>

            {/* Placeholder for next step in workflow:
               e.g. "Approve & Move to AwaitingApproval" or similar. */}
            <Button>Move Forward</Button>
          </Group>
        </Flex>
      </Stack>
    </Modal>
  );
}
