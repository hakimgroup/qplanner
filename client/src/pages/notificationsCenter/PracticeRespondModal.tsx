// components/notifications/PracticeRespondModal.tsx
import {
  Modal,
  Stack,
  Group,
  Text,
  Card,
  SimpleGrid,
  Checkbox,
  Radio,
  Textarea,
  TextInput,
  Badge,
  Divider,
  Flex,
  Button,
  useMantineTheme,
  ActionIcon,
  Box,
} from "@mantine/core";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  IconCalendar,
  IconMinus,
  IconPlus,
  IconPhoto,
  IconCircleCheck,
} from "@tabler/icons-react";
import {
  useMarkNotificationRead,
  useSubmitAssets,
} from "@/hooks/notification.hooks";
import StyledButton from "@/components/styledButton/StyledButton";

type AssetOption = { label: string; value: number };
type AssetItem = {
  name: string;
  price: number | string | null;
  quantity: number | null;
  suffix: string | null;
  type: string; // "default" | "card" | "free" | "external"
  userSelected: boolean;
  options?: AssetOption[];
  note?: string;
};

type AssetsGroup = {
  printedAssets: AssetItem[];
  digitalAssets: AssetItem[];
  externalPlacements: AssetItem[];
};

type EditableAsset = AssetItem & {
  chosenOptionLabel?: string | null;
  priceNum?: number | null;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  notification: any; // list_notifications row shape
};

export default function PracticeRespondModal({
  opened,
  onClose,
  notification,
}: Props) {
  const T = useMantineTheme();

  // ─────────────────────────────────
  // Pull structured payload from the notification
  // ─────────────────────────────────
  const payload = notification?.payload ?? {};
  const selectionId = notification?.selection_id ?? null;
  const campaignName = payload?.name ?? "";
  const campaignCategory = payload?.category ?? "";
  const fromDate = payload?.from_date ?? null;
  const toDate = payload?.to_date ?? null;
  const requestNote = payload?.note ?? null;
  const creatives: string[] = Array.isArray(payload?.creatives)
    ? payload.creatives
    : [];

  const baseAssets: AssetsGroup = payload?.assets ?? {
    printedAssets: [],
    digitalAssets: [],
    externalPlacements: [],
  };

  // ─────────────────────────────────
  // Local state (reset whenever the modal opens for a new notification)
  // ─────────────────────────────────
  const [assetsState, setAssetsState] = useState<{
    printedAssets: EditableAsset[];
    digitalAssets: EditableAsset[];
    externalPlacements: EditableAsset[];
  }>({
    printedAssets: [],
    digitalAssets: [],
    externalPlacements: [],
  });

  const [selectedCreative, setSelectedCreative] = useState<string | null>(null);
  const [practiceNote, setPracticeNote] = useState<string>("");

  useEffect(() => {
    if (!opened || !notification) return;

    const normalisePrice = (p: number | string | null): number | null => {
      if (p === null || p === undefined) return null;
      if (typeof p === "number") return isNaN(p) ? null : p;
      const num = Number(p);
      return isNaN(num) ? null : num;
    };

    const initBucket = (
      list: AssetItem[],
      isExternal = false
    ): EditableAsset[] =>
      (list ?? []).map((a) => ({
        ...a,
        // default quantity:
        // external ones start at 1, others at 0 if missing
        quantity: isExternal
          ? a.quantity && a.quantity > 0
            ? a.quantity
            : 1
          : a.quantity && a.quantity > 0
          ? a.quantity
          : 0,
        chosenOptionLabel: null,
        priceNum: normalisePrice(a.price),
      }));

    setAssetsState({
      printedAssets: initBucket(baseAssets.printedAssets, false),
      digitalAssets: initBucket(baseAssets.digitalAssets, false),
      externalPlacements: initBucket(baseAssets.externalPlacements, true),
    });

    setSelectedCreative(null);
    setPracticeNote("");
  }, [opened, notification, baseAssets]);

  // ─────────────────────────────────
  // Hooks for submit + mark read
  // ─────────────────────────────────
  const { mutate: submitAssets, isPending: submitting } = useSubmitAssets();
  const { mutate: markRead, isPending: markingRead } =
    useMarkNotificationRead();

  // ─────────────────────────────────
  // State mutators
  // ─────────────────────────────────
  function updateAsset(
    bucket: keyof typeof assetsState,
    name: string,
    patch: Partial<EditableAsset>
  ) {
    setAssetsState((prev) => ({
      ...prev,
      [bucket]: prev[bucket].map((it) =>
        it.name === name ? { ...it, ...patch } : it
      ),
    }));
  }

  // toggle asset selected / deselected
  function toggleAssetSelected(
    bucket: keyof typeof assetsState,
    name: string,
    checked: boolean
  ) {
    setAssetsState((prev) => ({
      ...prev,
      [bucket]: prev[bucket].map((it) => {
        if (it.name !== name) return it;
        // when turning on, make sure quantity is sensible
        const baseMin = it.type === "external" ? 1 : 0;
        const nextQty =
          checked && (!it.quantity || it.quantity < baseMin)
            ? baseMin === 1
              ? 1
              : 1 // for non-external, default to 1 when selecting
            : it.quantity ?? 0;

        return {
          ...it,
          userSelected: checked,
          quantity: nextQty,
        };
      }),
    }));
  }

  // decrement quantity
  function decQty(bucket: keyof typeof assetsState, name: string) {
    setAssetsState((prev) => ({
      ...prev,
      [bucket]: prev[bucket].map((it) => {
        if (it.name !== name) return it;

        const minVal = it.type === "external" ? 1 : 0;
        const cur = it.quantity ?? minVal;
        let next = cur - 1;
        if (next < minVal) next = minVal;

        return {
          ...it,
          quantity: next,
          userSelected: next > 0,
        };
      }),
    }));
  }

  // increment quantity
  function incQty(bucket: keyof typeof assetsState, name: string) {
    setAssetsState((prev) => ({
      ...prev,
      [bucket]: prev[bucket].map((it) => {
        if (it.name !== name) return it;
        const cur = it.quantity ?? 0;
        const next = cur + 1;
        return {
          ...it,
          quantity: next,
          userSelected: next > 0,
        };
      }),
    }));
  }

  // choose pricing option for "card" assets
  function chooseOption(
    bucket: keyof typeof assetsState,
    name: string,
    label: string
  ) {
    setAssetsState((prev) => ({
      ...prev,
      [bucket]: prev[bucket].map((it) => {
        if (it.name !== name) return it;
        const nextQty = it.quantity && it.quantity > 0 ? it.quantity : 1;
        return {
          ...it,
          chosenOptionLabel: label,
          quantity: nextQty,
          userSelected: true,
        };
      }),
    }));
  }

  // ─────────────────────────────────
  // Helpers: display text + total cost
  // ─────────────────────────────────
  function describeAssetPrice(a: EditableAsset): string {
    switch (a.type) {
      case "free":
        return "Free";

      case "default": {
        if (a.priceNum != null) {
          return a.suffix ? `£${a.priceNum} ${a.suffix}` : `£${a.priceNum}`;
        }
        return "£—";
      }

      case "card": {
        if (a.options && a.options.length > 0) {
          const sorted = [...a.options].sort(
            (x, y) => (x.value ?? 0) - (y.value ?? 0)
          );
          const cheapest = sorted[0];
          if (cheapest) {
            return cheapest.label
              ? `From £${cheapest.value} (${cheapest.label})`
              : `From £${cheapest.value}`;
          }
        }
        return "£—";
      }

      case "external": {
        if (a.priceNum != null) {
          return a.suffix ? `£${a.priceNum} ${a.suffix}` : `£${a.priceNum}`;
        }
        return "£—";
      }

      default: {
        if (a.priceNum != null) {
          return a.suffix ? `£${a.priceNum} ${a.suffix}` : `£${a.priceNum}`;
        }
        return "£—";
      }
    }
  }

  // currency formatter for footer card
  function GBP(v: number): string {
    return `£${v.toFixed(2)}`;
  }

  // calculate estimated total
  const estimatedTotal = useMemo(() => {
    function lineCost(a: EditableAsset): number {
      if (!a.userSelected) return 0;

      const minQty = a.type === "external" ? 1 : 0;
      const qty = a.quantity && a.quantity > minQty ? a.quantity : minQty;

      switch (a.type) {
        case "free":
          return 0;

        case "default":
          if (a.priceNum != null) {
            return a.priceNum * qty;
          }
          return 0;

        case "card": {
          if (a.options && a.options.length > 0) {
            const picked =
              (a.chosenOptionLabel &&
                a.options.find((o) => o.label === a.chosenOptionLabel)) ||
              null;
            if (picked && picked.value != null && !isNaN(picked.value)) {
              return picked.value * qty;
            }
            // fallback cheapest
            const sorted = [...a.options].sort(
              (x, y) => (x.value ?? 0) - (y.value ?? 0)
            );
            const cheapest = sorted[0];
            if (cheapest && cheapest.value != null && !isNaN(cheapest.value)) {
              return cheapest.value * qty;
            }
          }
          return 0;
        }

        case "external":
          if (a.priceNum != null) {
            return a.priceNum * qty;
          }
          return 0;

        default:
          return 0;
      }
    }

    const allAssets = [
      ...assetsState.printedAssets,
      ...assetsState.digitalAssets,
      ...assetsState.externalPlacements,
    ];

    return allAssets.reduce((sum, a) => sum + lineCost(a), 0);
  }, [assetsState]);

  // is form submittable
  const hasAnySelectedAsset = useMemo(() => {
    const all = [
      ...assetsState.printedAssets,
      ...assetsState.digitalAssets,
      ...assetsState.externalPlacements,
    ];
    return all.some((a) => a.userSelected && (a.quantity ?? 0) > 0);
  }, [assetsState]);

  const creativeRequired = creatives.length > 0;
  const creativeIsChosen = !creativeRequired || !!selectedCreative;

  const canSubmit =
    creativeIsChosen &&
    hasAnySelectedAsset &&
    !!selectionId &&
    !submitting &&
    !markingRead;

  // build final assets payload for submit_assets RPC
  function buildFinalAssets() {
    function mapBucket(list: EditableAsset[]) {
      return list.map((a) => {
        const chosenOpt =
          a.chosenOptionLabel &&
          a.options?.find((o) => o.label === a.chosenOptionLabel);

        return {
          name: a.name,
          type: a.type,
          price: a.priceNum ?? null,
          suffix: a.suffix,
          quantity: a.quantity ?? 0,
          userSelected: a.userSelected,
          chosenOptionLabel: a.chosenOptionLabel ?? null,
          chosenOptionValue:
            chosenOpt && chosenOpt.value != null && !isNaN(chosenOpt.value)
              ? chosenOpt.value
              : null,
          options: a.options ?? [],
          note: a.note ?? null,
        };
      });
    }

    return {
      printedAssets: mapBucket(assetsState.printedAssets),
      digitalAssets: mapBucket(assetsState.digitalAssets),
      externalPlacements: mapBucket(assetsState.externalPlacements),
    };
  }

  // submit handler
  function handleSubmit() {
    if (!selectionId) {
      toast.error("Missing selection id");
      return;
    }

    const finalAssets = buildFinalAssets();

    submitAssets(
      {
        selectionId,
        chosenCreative: selectedCreative ?? null,
        assets: finalAssets,
        note: practiceNote?.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Your asset choices have been sent");
          onClose();
        },
        onError: (e: any) => {
          toast.error(e?.message ?? "Failed to submit assets");
        },
      }
    );
  }

  // mark-as-read handler
  function handleMarkRead() {
    if (!notification?.id) return;
    markRead(
      { notificationId: notification.id },
      {
        onSuccess: () => {
          toast.success("Marked as read");
        },
        onError: (e: any) => {
          toast.error(e?.message ?? "Failed to mark as read");
        },
      }
    );
  }

  // ─────────────────────────────────
  // Render helpers
  // ─────────────────────────────────
  const SectionHeader = ({
    label,
    icon,
  }: {
    label: string;
    icon?: React.ReactNode;
  }) => (
    <Group gap={6} align="center">
      {icon}
      <Text fw={700} size="sm">
        {label}
      </Text>
    </Group>
  );

  const DateRangeRow = () => (
    <Group gap={10} wrap="wrap">
      <Group gap={4}>
        <IconCalendar size={14} />
        <Text size="xs" c="gray.7">
          {fromDate ? new Date(fromDate).toLocaleDateString() : "—"} →{" "}
          {toDate ? new Date(toDate).toLocaleDateString() : "—"}
        </Text>
      </Group>

      {campaignCategory && (
        <Badge
          size="xs"
          radius="sm"
          color={campaignCategory === "Event" ? "pink" : "gray"}
          variant={campaignCategory === "Event" ? "filled" : "light"}
          tt="none"
        >
          {campaignCategory}
        </Badge>
      )}
    </Group>
  );

  const CreativePicker = () =>
    creatives.length === 0 ? null : (
      <Stack gap={8}>
        <SectionHeader
          label="Choose a creative"
          icon={<IconPhoto size={16} />}
        />
        <Text size="xs" c="gray.6">
          Select the artwork you'd like us to use
        </Text>

        <Radio.Group
          value={selectedCreative ?? ""}
          onChange={(val) => setSelectedCreative(val)}
        >
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {creatives.map((url, idx) => (
              <Card
                key={idx}
                withBorder
                radius={10}
                px="sm"
                py="sm"
                style={{
                  borderColor:
                    selectedCreative === url
                      ? T.colors.blue[3]
                      : T.colors.gray[2],
                }}
              >
                <Stack gap={6}>
                  <Radio
                    value={url}
                    label={
                      <Text size="sm" fw={500} c="gray.9">
                        Creative {idx + 1}
                      </Text>
                    }
                    styles={{
                      body: { alignItems: "flex-start" },
                    }}
                  />
                  <TextInput
                    value={url}
                    readOnly
                    radius="md"
                    size="xs"
                    styles={{
                      input: {
                        fontSize: 11,
                        color: T.colors.gray[7],
                      },
                    }}
                  />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Radio.Group>

        {creatives.length > 0 && !selectedCreative && (
          <Text size="xs" c="red.6">
            Please select one creative.
          </Text>
        )}
      </Stack>
    );

  const QuantityRow = ({
    bucket,
    asset,
  }: {
    bucket: keyof typeof assetsState;
    asset: EditableAsset;
  }) => (
    <Group justify="space-between" align="center" mt={6}>
      <Text size="sm" c="gray.7">
        Quantity:
      </Text>
      <Group gap={8} align="center">
        <ActionIcon
          variant="subtle"
          aria-label="decrease"
          onClick={() => decQty(bucket, asset.name)}
        >
          <IconMinus size={16} />
        </ActionIcon>

        <TextInput
          value={String(asset.quantity ?? 0)}
          onChange={() => {}}
          readOnly
          w={46}
          ta="center"
          styles={{
            input: { textAlign: "center" },
          }}
        />

        <ActionIcon
          variant="subtle"
          aria-label="increase"
          onClick={() => incQty(bucket, asset.name)}
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
    </Group>
  );

  const AssetCard = ({
    bucket,
    asset,
  }: {
    bucket: keyof typeof assetsState;
    asset: EditableAsset;
  }) => {
    const selected = asset.userSelected;
    return (
      <Card
        withBorder
        radius="md"
        px="md"
        py="sm"
        style={{
          borderColor: selected ? T.colors.blue[2] : "#e9ecef",
          background: selected ? "rgba(107,123,255,0.06)" : "white",
        }}
      >
        <Stack gap={8}>
          <Group justify="space-between" align="flex-start">
            <Stack gap={2} style={{ flex: 1 }}>
              <Text fw={600} size="sm">
                {asset.name}
              </Text>
              <Text
                size="sm"
                fw={600}
                c={asset.type === "free" ? "blue.5" : "blue.5"}
                style={{ lineHeight: 1.3 }}
              >
                {describeAssetPrice(asset)}
              </Text>
            </Stack>

            {selected && (
              <Badge variant="light" color="indigo">
                Selected
              </Badge>
            )}
          </Group>

          {/* Include this asset */}
          <Checkbox
            size="xs"
            radius="xl"
            color="blue.3"
            checked={asset.userSelected}
            label={
              asset.userSelected ? (
                <Text size="xs">
                  {asset.type === "external"
                    ? "Remove this placement"
                    : "Remove this asset"}
                </Text>
              ) : (
                <Text size="xs">
                  {asset.type === "external"
                    ? "Book this placement"
                    : "Include this asset"}
                </Text>
              )
            }
            onChange={(e) =>
              toggleAssetSelected(bucket, asset.name, e.currentTarget.checked)
            }
          />

          {/* Quantity row */}
          <QuantityRow bucket={bucket} asset={asset} />

          {/* Option picker for "card" assets */}
          {asset.type === "card" &&
            asset.options &&
            asset.options.length > 0 && (
              <Radio.Group
                value={asset.chosenOptionLabel ?? ""}
                label={
                  <Text size="xs" fw={500} c="gray.8">
                    Choose an option
                  </Text>
                }
                onChange={(label) =>
                  chooseOption(bucket, asset.name, label as string)
                }
              >
                <Stack gap={4}>
                  {asset.options.map((opt) => (
                    <Radio
                      key={opt.label}
                      value={opt.label}
                      size="xs"
                      color="blue.3"
                      label={
                        <Text size="xs">
                          {opt.label} — £{opt.value}
                        </Text>
                      }
                    />
                  ))}
                </Stack>
              </Radio.Group>
            )}
        </Stack>
      </Card>
    );
  };

  const AssetSection = ({
    title,
    bucket,
    list,
  }: {
    title: string;
    bucket: keyof typeof assetsState;
    list: EditableAsset[];
  }) => (
    <Stack gap={8}>
      <Text fw={700} size="sm">
        {title}
      </Text>

      {list.length === 0 ? (
        <Text size="xs" c="gray.6">
          None requested
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {list.map((asset) => (
            <AssetCard
              key={`${bucket}-${asset.name}`}
              bucket={bucket}
              asset={asset}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      radius="lg"
      centered
      size="56rem"
      overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
      title={
        <Stack gap={4}>
          <Text fw={600} size="sm" c="gray.9">
            Respond to Asset Request
            {campaignName ? ` — ${campaignName}` : ""}
          </Text>
          <Group gap={6} wrap="wrap">
            <DateRangeRow />
          </Group>
        </Stack>
      }
    >
      <Stack gap="lg">
        {/* Marketing note */}
        {requestNote && (
          <Card
            withBorder
            radius="md"
            px="md"
            py="sm"
            style={{ borderColor: "#e9ecef", background: "#f9f9fb" }}
          >
            <Text size="xs" c="gray.7" fw={500}>
              Message from Marketing
            </Text>
            <Text size="sm" c="gray.9">
              {requestNote}
            </Text>
          </Card>
        )}

        {/* Creative picker */}
        <CreativePicker />

        {/* Assets */}
        <AssetSection
          title="Printed Assets"
          bucket="printedAssets"
          list={assetsState.printedAssets}
        />

        <AssetSection
          title="Digital Assets"
          bucket="digitalAssets"
          list={assetsState.digitalAssets}
        />

        <AssetSection
          title="Additional Placements"
          bucket="externalPlacements"
          list={assetsState.externalPlacements}
        />

        {/* Practice note */}
        <Stack gap={6}>
          <Text fw={700} size="sm">
            Additional Notes (Optional)
          </Text>
          <Textarea
            radius="md"
            minRows={3}
            autosize
            value={practiceNote}
            onChange={(e) => setPracticeNote(e.currentTarget.value)}
            placeholder="Add any specific instructions or requirements…"
          />
        </Stack>

        {/* Estimated Total Cost */}
        <Card radius="md" px="md" py="md" bg={"gray.0"}>
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
          justify="space-between"
          align="center"
          direction={{ base: "column", sm: "row" }}
          gap="md"
        >
          {/* Mark as read button */}
          <StyledButton
            variant="default"
            radius="md"
            onClick={handleMarkRead}
            loading={markingRead}
            disabled={markingRead || !notification?.id}
            leftSection={<IconCircleCheck size={17} />}
          >
            Mark as read
          </StyledButton>

          <Group justify="flex-end">
            <StyledButton variant="default" radius="md" onClick={onClose}>
              Cancel
            </StyledButton>
            <Button
              radius="md"
              color="blue.5"
              loading={submitting}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Submit Campaign Request
            </Button>
          </Group>
        </Flex>
      </Stack>
    </Modal>
  );
}
