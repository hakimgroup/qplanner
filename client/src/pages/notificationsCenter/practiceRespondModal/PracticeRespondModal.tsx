import {
  Modal,
  Stack,
  Group,
  Text,
  Card,
  SimpleGrid,
  Checkbox,
  Textarea,
  TextInput,
  Badge,
  Divider,
  Flex,
  Button,
  useMantineTheme,
  ActionIcon,
  ThemeIcon,
  Select,
} from "@mantine/core";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  IconCalendar,
  IconMinus,
  IconPlus,
  IconCircleCheck,
  IconClock,
  IconCircle,
  IconBox,
} from "@tabler/icons-react";
import {
  useMarkNotificationRead,
  useSubmitAssets,
} from "@/hooks/notification.hooks";
import StyledButton from "@/components/styledButton/StyledButton";
import CreativePicker, { CreativeItem } from "./CreativePicker";
import { format } from "date-fns";
import { activityColors } from "@/shared/shared.const";
import { toLower } from "lodash";

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
  const creatives: CreativeItem[] = payload.creatives ?? [];

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
          quantity: checked ? nextQty : 0,
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

        // external placements can go down to 0 now
        const minVal = it.type === "external" ? 0 : 0;
        const cur = it.quantity ?? minVal;
        let next = cur - 1;
        if (next < minVal) next = minVal;

        // special rule for "card":
        // if quantity becomes 0, reset chosenOptionLabel and deselect
        if (it.type === "card" && next === 0) {
          return {
            ...it,
            quantity: 0,
            userSelected: false,
            chosenOptionLabel: null,
          };
        }

        // NEW: if quantity becomes 0 for any asset, userSelected must be false
        if (next === 0) {
          return {
            ...it,
            quantity: next,
            userSelected: false,
          };
        }

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
    // we branch specially for "card"
    if (a.type === "card") {
      // if user has picked an option, show that exact price instead of "From ..."
      if (a.chosenOptionLabel && a.options && a.options.length > 0) {
        const picked = a.options.find((o) => o.label === a.chosenOptionLabel);
        if (picked && picked.value != null && !isNaN(picked.value)) {
          return `£${picked.value} (${picked.label})`;
        }
      }

      // otherwise fall back to "From £X (label)"
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

    // other types: original logic
    switch (true) {
      case a.type === "free" && a.price === null:
        return "Free";

      case a.type === "default": {
        if (a.priceNum != null) {
          return a.suffix
            ? `£${a.priceNum} ${a.suffix}`
            : `£${a.priceNum} each`;
        }
        return "£—";
      }

      case a.type === "external": {
        if (a.priceNum != null) {
          return a.suffix
            ? `£${a.priceNum} ${a.suffix}`
            : `£${a.priceNum} each`;
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

      // external minQty is now allowed to be 0, so cost can be 0 if qty 0
      const minQty = a.type === "external" ? 0 : 0;
      const qty = a.quantity && a.quantity > minQty ? a.quantity : minQty;

      switch (true) {
        case a.type === "free" && a.price === null:
          return 0;

        case a.type === "card": {
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

        default:
          if (a.priceNum != null) {
            return a.priceNum * qty;
          }
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
      return (
        list
          // keep ONLY assets with a positive quantity
          .filter((a) => (a.quantity ?? 0) > 0)
          .map((a) => {
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
          })
      );
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
        onSuccess: () => {},
        onError: (e: any) => {},
      }
    );
  }

  // quantity row
  const QuantityRow = ({
    bucket,
    asset,
  }: {
    bucket: keyof typeof assetsState;
    asset: EditableAsset;
  }) => {
    // Disable quantity picker for "card" assets until an option is chosen
    const disableQtyForCard = asset.type === "card" && !asset.chosenOptionLabel;

    return (
      <Group justify="space-between" align="center" mt={6}>
        <Text size="sm" c="gray.7" fw={500}>
          {asset.name === "Paid Social Media" ? "No. Of Days:" : "Quantity:"}
        </Text>
        <Group gap={8} align="center">
          <ActionIcon
            variant="subtle"
            aria-label="decrease"
            disabled={disableQtyForCard}
            onClick={() => {
              if (disableQtyForCard) return;
              decQty(bucket, asset.name);
            }}
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
            disabled={disableQtyForCard}
            onClick={() => {
              if (disableQtyForCard) return;
              incQty(bucket, asset.name);
            }}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Group>
      </Group>
    );
  };

  const AssetCard = ({
    bucket,
    asset,
  }: {
    bucket: keyof typeof assetsState;
    asset: EditableAsset;
  }) => {
    const selected = asset.userSelected && asset.quantity > 0;

    // When rendering Select for card assets, we respect existing logic,
    // and QuantityRow will be disabled until user picks.
    return (
      <Card
        withBorder
        radius="md"
        px="md"
        py="sm"
        style={{
          borderColor: selected ? T.colors.blue[2] : T.colors.blue[0],
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
          {selected && (
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
          )}

          {/* Option picker for "card" assets */}
          {asset.type === "card" &&
            asset.options &&
            asset.options.length > 0 && (
              <Select
                label={
                  <Text size="xs" fw={500} c="gray.8">
                    Choose an option
                  </Text>
                }
                size="xs"
                radius="md"
                value={asset.chosenOptionLabel ?? ""}
                placeholder="Select an option"
                data={asset.options.map((opt) => ({
                  value: opt.label,
                  label: `${opt.label} — £${opt.value}`,
                }))}
                onChange={(val) => {
                  if (val) {
                    chooseOption(bucket, asset.name, val);
                  }
                }}
              />
            )}

          {/* Quantity row */}
          <QuantityRow bucket={bucket} asset={asset} />

          {/* Any Available Note */}
          {asset?.note && (
            <Text size="xs" fw={600} c="teal.9">
              {asset.note}
            </Text>
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
              Respond to Asset Request
            </Text>
          </Group>
          <Group gap={6} wrap="wrap">
            <Text fw={600} size="lg">
              {campaignName ? campaignName : "Campaign"} Details
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
        {/* Campaign Period */}
        <Card radius="md" px="md" py="md" bg={"gray.0"}>
          <Stack gap={15}>
            <Stack gap={5}>
              <Text fw={700} size="sm">
                About this campaign
              </Text>
              <Text size="sm" fw={500} c="gray.6">
                {payload?.description}
              </Text>
            </Stack>

            <Group>
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
                  {fromDate ? format(toDate, "MMM dd, yyyy") : "—"}
                </Text>
              </Flex>
            </Group>
          </Stack>
        </Card>

        {/* Creative picker */}
        <CreativePicker
          creatives={creatives}
          value={selectedCreative}
          onChange={(url) => setSelectedCreative(url)}
        />

        {/* Assets */}
        <Stack gap={8}>
          <Text fw={600} size="lg">
            Complete Your Campaign Setup
          </Text>
          <Group gap={8} align="center">
            <ThemeIcon variant="light" color="blue.5" radius="xl" size="sm">
              <IconBox size={14} />
            </ThemeIcon>
            <Text fw={500}>Select Assets</Text>
          </Group>
        </Stack>

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

        {/* <AssetSection
          title="Additional Placements"
          bucket="externalPlacements"
          list={assetsState.externalPlacements}
        /> */}

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
              Cancel
            </StyledButton>
            <Button
              loading={submitting}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Submit My Choices
            </Button>
          </Group>
        </Flex>
      </Stack>
    </Modal>
  );
}
