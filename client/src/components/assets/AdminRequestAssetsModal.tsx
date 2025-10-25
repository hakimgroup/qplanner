// components/admin/requestAssets/AdminRequestAssetsModal.tsx
import {
  useRequestAssets,
  useUpdateSourceAssets,
} from "@/hooks/notification.hooks";
import {
  Modal,
  Stack,
  Text,
  Group,
  SimpleGrid,
  Checkbox,
  TextInput,
  ActionIcon,
  Divider,
  Flex,
  Button,
  Card,
  Badge,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type AssetOption = { label: string; value: number };

type AssetItem = {
  name: string;
  // 👇 allow string while editing so decimals like "150.50" or "150." don't get killed mid-typing
  price: number | string | null;
  quantity: number | null;
  suffix: string | null;
  type: string;
  userSelected: boolean;
  options?: AssetOption[];
  note?: string;
};

type Assets = {
  printedAssets: AssetItem[];
  digitalAssets: AssetItem[];
  externalPlacements: AssetItem[];
};

type Props = {
  opened: boolean;
  onClose: () => void;
  selection: {
    id: string;
    name?: string | null;
    isBespoke?: boolean;
    bespoke_campaign_id?: string | null;
    assets?: Assets | null;
    from_date?: string | Date | null;
    to_date?: string | Date | null;
    category?: string | null;
  };
};

// Initialize assets state. We KEEP all assets, always visible.
// We normalize quantity to a number (but admins no longer edit quantity in this modal).
const cloneAssets = (a?: Assets | null): Assets => ({
  printedAssets: (a?.printedAssets ?? []).map((x) => ({
    ...x,
    userSelected: x.userSelected ?? false,
    quantity:
      typeof x.quantity === "number" && Number.isFinite(x.quantity)
        ? x.quantity
        : 0,
  })),
  digitalAssets: (a?.digitalAssets ?? []).map((x) => ({
    ...x,
    userSelected: x.userSelected ?? false,
    quantity:
      typeof x.quantity === "number" && Number.isFinite(x.quantity)
        ? x.quantity
        : 0,
  })),
  externalPlacements: (a?.externalPlacements ?? []).map((x) => ({
    ...x,
    userSelected: x.userSelected ?? false,
    // keep price as-is (string | number | null) when cloning, don't coerce
    price:
      x.price === null || typeof x.price === "string"
        ? x.price
        : Number.isFinite(x.price)
        ? x.price
        : null,
    quantity:
      typeof x.quantity === "number" && Number.isFinite(x.quantity)
        ? x.quantity
        : 0,
  })),
});

/* ----------------------- CHILD COMPONENTS ----------------------- */

function CreativeInputs({
  creativeUrls,
  addCreative,
  removeCreative,
  updateCreative,
}: {
  creativeUrls: string[];
  addCreative: () => void;
  removeCreative: (idx: number) => void;
  updateCreative: (idx: number, val: string) => void;
}) {
  return (
    <Stack gap={8}>
      <Group justify="space-between" align="center">
        <Text fw={700} size="sm">
          Campaign Creatives
        </Text>
        <Tooltip label="Add another creative URL (max 4)" withArrow>
          <ActionIcon
            variant="subtle"
            aria-label="add creative"
            onClick={addCreative}
            disabled={creativeUrls.length >= 4}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Stack gap={6}>
        {creativeUrls.map((url, idx) => (
          <Group key={idx} gap={6} wrap="nowrap" align="center">
            <TextInput
              placeholder="https://image-url-or-asset.jpg"
              value={url}
              onChange={(e) => updateCreative(idx, e.currentTarget.value)}
              style={{ flex: 1 }}
              radius="md"
            />
            {creativeUrls.length > 1 && (
              <ActionIcon
                color="red"
                variant="subtle"
                aria-label="remove creative"
                onClick={() => removeCreative(idx)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            )}
          </Group>
        ))}
      </Stack>

      <Text size="xs" c="gray.6">
        These will be shown to the practice. They'll choose one.
      </Text>
    </Stack>
  );
}

function AssetCard({
  item,
  section,
  toggleRequestAsset,
}: {
  item: AssetItem;
  section: keyof Assets;
  toggleRequestAsset: (
    section: keyof Assets,
    name: string,
    checked: boolean
  ) => void;
}) {
  const T = useMantineTheme().colors;
  const selected = item.userSelected;

  // helper to build the price/descriptor line under the name
  const getDescriptor = (it: AssetItem): string => {
    switch (it.type) {
      case "default": {
        // standard thing with a unit price
        if (
          it.price !== null &&
          it.price !== "" &&
          !Number.isNaN(Number(it.price))
        ) {
          const unit =
            it.suffix && it.suffix.trim().length > 0 ? it.suffix : "";
          return `£${it.price} ${unit}`;
        }
        return "Price on request";
      }

      case "card": {
        // has options[] with {label, value}, pick cheapest for display
        if (it.options && it.options.length > 0) {
          const sorted = [...it.options].sort(
            (a, b) => (a.value ?? 0) - (b.value ?? 0)
          );
          const cheapest = sorted[0];
          const valueDisplay =
            cheapest.value != null && !Number.isNaN(cheapest.value)
              ? `£${cheapest.value}`
              : "£—";

          return cheapest.label
            ? `From ${valueDisplay} (${cheapest.label})`
            : `From ${valueDisplay}`;
        }
        return "Price on request";
      }

      case "free": {
        return "Free";
      }

      case "external": {
        // generally handled in placement cards, but just in case
        if (
          it.price !== null &&
          it.price !== "" &&
          !Number.isNaN(Number(it.price))
        ) {
          if (it.suffix && it.suffix.trim().length > 0) {
            return `£${it.price} ${it.suffix}`;
          }
          return `£${it.price}`;
        }
        return "External / quoted";
      }

      default: {
        // fallback
        if (
          it.price !== null &&
          it.price !== "" &&
          !Number.isNaN(Number(it.price))
        ) {
          return `£${it.price}${it.suffix ? ` ${it.suffix}` : ""}`;
        }
        return "Price on request";
      }
    }
  };

  return (
    <Card
      withBorder
      radius={10}
      px="md"
      py="sm"
      style={{
        borderColor: selected ? T.blue[2] : T.gray[1],
        background: selected ? "rgba(107, 123, 255, 0.06)" : "white",
      }}
    >
      <Stack gap={8}>
        <Group justify="space-between" align="flex-start">
          <Stack gap={2} style={{ flex: 1 }}>
            <Text fw={600} size="sm">
              {item.name}
            </Text>

            <Text
              size="xs"
              fw={600}
              c={item.type === "free" ? "gray.7" : "indigo"}
            >
              {getDescriptor(item)}
            </Text>

            {item.suffix &&
              item.type !== "default" &&
              item.type !== "external" && (
                <Text size="xs" c="gray.6">
                  {item.suffix}
                </Text>
              )}
          </Stack>

          {selected && (
            <Badge variant="light" color="indigo">
              Requested
            </Badge>
          )}
        </Group>

        <Checkbox
          size="xs"
          radius="xl"
          color="blue.3"
          checked={item.userSelected}
          label={<Text size="xs">Request this asset</Text>}
          onChange={(e) =>
            toggleRequestAsset(section, item.name, e.currentTarget.checked)
          }
        />
      </Stack>
    </Card>
  );
}

function PlacementCard({
  p,
  updatePlacementPrice,
  toggleRequestPlacement,
}: {
  p: AssetItem;
  updatePlacementPrice: (name: string, raw: string) => void;
  toggleRequestPlacement: (name: string, checked: boolean) => void;
}) {
  const selected = p.userSelected;
  const T = useMantineTheme().colors;
  return (
    <Card
      withBorder
      radius={10}
      px="md"
      py="sm"
      style={{
        borderColor: selected ? T.blue[2] : T.gray[1],
        background: selected ? "rgba(107, 123, 255, 0.06)" : "white",
      }}
    >
      <Stack gap={8}>
        <Group justify="space-between" align="flex-start">
          <Stack gap={2} style={{ flex: 1 }}>
            <Text fw={600} size="sm">
              {p.name}
            </Text>
            <Text size="xs" c="gray.6">
              {p.suffix || "placement"}
            </Text>
          </Stack>

          {selected && (
            <Badge variant="light" color="indigo">
              Requested
            </Badge>
          )}
        </Group>

        {/* Price input (admin sets budget/quote) */}
        <Stack gap={4}>
          <Text size="xs" fw={500} c="gray.7">
            Price (£):
          </Text>
          <TextInput
            radius="md"
            size="xs"
            value={p.price ?? ""}
            placeholder="e.g. 150"
            onChange={(e) =>
              updatePlacementPrice(p.name, e.currentTarget.value)
            }
            styles={{
              input: { maxWidth: 90 },
            }}
          />
        </Stack>

        {/* Single checkbox: request this placement */}
        <Checkbox
          size="xs"
          radius="xl"
          color="blue.3"
          checked={p.userSelected}
          label={<Text size="xs">Request this placement</Text>}
          onChange={(e) =>
            toggleRequestPlacement(p.name, e.currentTarget.checked)
          }
        />
      </Stack>
    </Card>
  );
}

/* ----------------------- MAIN MODAL COMPONENT ----------------------- */

export default function AdminRequestAssetsModal({
  opened,
  onClose,
  selection,
}: Props) {
  // editable asset state
  const [assetsState, setAssetsState] = useState<Assets>(() =>
    cloneAssets(selection.assets)
  );

  // creatives (up to 4 image URLs)
  const [creativeUrls, setCreativeUrls] = useState<string[]>([""]);

  const { mutate: updateAssets, isPending: savingAssets } =
    useUpdateSourceAssets();
  const { mutate: requestAssets, isPending: requesting } = useRequestAssets();

  // Creatives handlers
  const addCreative = () => {
    if (creativeUrls.length >= 4) return;
    setCreativeUrls((l) => [...l, ""]);
  };

  const removeCreative = (idx: number) => {
    setCreativeUrls((l) => l.filter((_, i) => i !== idx));
  };

  const updateCreative = (idx: number, val: string) => {
    setCreativeUrls((l) => {
      const c = [...l];
      c[idx] = val;
      return c;
    });
  };

  // Toggle for Printed / Digital assets
  const toggleRequestAsset = (
    section: keyof Assets,
    name: string,
    checked: boolean
  ) => {
    setAssetsState((prev) => ({
      ...prev,
      [section]: prev[section].map((it) =>
        it.name === name ? { ...it, userSelected: checked } : it
      ),
    }));
  };

  // External placements logic
  // - Admin can enter any decimal string while typing.
  // - We store that raw string in `price` so typing "150.50" is preserved.
  // - If parsed value is > 0, we also ensure userSelected = true.
  // - Clearing/emptying keeps userSelected as-is unless manually unticked.
  const updatePlacementPrice = (name: string, raw: string) => {
    const trimmed = raw; // keep EXACT user input, including "150.", "0.", etc.
    const parsed = parseFloat(trimmed);

    setAssetsState((prev) => ({
      ...prev,
      externalPlacements: prev.externalPlacements.map((it) => {
        if (it.name !== name) return it;

        // should we force-select?
        const shouldSelect =
          !Number.isNaN(parsed) && parsed > 0 ? true : it.userSelected;

        return {
          ...it,
          price: trimmed === "" ? "" : trimmed, // allow "" while typing
          userSelected: shouldSelect,
        };
      }),
    }));
  };

  const toggleRequestPlacement = (name: string, checked: boolean) => {
    setAssetsState((prev) => ({
      ...prev,
      externalPlacements: prev.externalPlacements.map((it) =>
        it.name === name ? { ...it, userSelected: checked } : it
      ),
    }));
  };

  // Derived sets for rendering
  const printedAssets = assetsState.printedAssets;
  const digitalAssets = assetsState.digitalAssets;
  const placements = assetsState.externalPlacements;

  // Validation for submission
  const hasAnyCreative = useMemo(
    () => creativeUrls.map((u) => u.trim()).filter(Boolean).length > 0,
    [creativeUrls]
  );

  const hasAnyRequested = useMemo(() => {
    const anySelected = (arr: AssetItem[]) => arr.some((it) => it.userSelected);
    return (
      anySelected(printedAssets) ||
      anySelected(digitalAssets) ||
      anySelected(placements)
    );
  }, [printedAssets, digitalAssets, placements]);

  const canSubmit =
    (hasAnyCreative || hasAnyRequested) && !savingAssets && !requesting;

  // Submit flow:
  // 1. Persist the edited assets state (with updated userSelected + price for placements)
  // 2. Call request_assets RPC with creativeUrls
  const handleSubmit = () => {
    const cleanedCreatives = creativeUrls
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 4);

    updateAssets(
      {
        selectionId: selection.id,
        isBespoke: !!selection.isBespoke,
        bespokeCampaignId: selection.bespoke_campaign_id ?? null,
        assets: assetsState,
      },
      {
        onSuccess: () => {
          requestAssets(
            {
              selectionId: selection.id,
              creativeUrls: cleanedCreatives,
              note: null,
            },
            {
              onSuccess: () => {
                toast.success("Request sent to practice");
                onClose();
              },
              onError: (e: any) => {
                toast.error(
                  e?.message ?? "Failed to send notification to practice"
                );
              },
            }
          );
        },
        onError: (e: any) => {
          toast.error(e?.message ?? "Failed to save requested assets");
        },
      }
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="sm">
          Request Assets
          {selection.name ? ` — ${selection.name}` : ""}
        </Text>
      }
      size="56rem"
      radius="lg"
      centered
      overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
    >
      <Stack gap="lg">
        {/* Creatives section */}
        <CreativeInputs
          creativeUrls={creativeUrls}
          addCreative={addCreative}
          removeCreative={removeCreative}
          updateCreative={updateCreative}
        />

        {/* Printed Assets */}
        <Stack gap={8}>
          <Text fw={700} size="sm">
            Printed Assets
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {printedAssets.length === 0 && (
              <Text size="xs" c="gray.6">
                No printed assets available
              </Text>
            )}

            {printedAssets.map((it, idx) => (
              <AssetCard
                key={`printed-${idx}`}
                item={it}
                section="printedAssets"
                toggleRequestAsset={toggleRequestAsset}
              />
            ))}
          </SimpleGrid>
        </Stack>

        {/* Digital Assets */}
        <Stack gap={8}>
          <Text fw={700} size="sm">
            Digital Assets
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {digitalAssets.length === 0 && (
              <Text size="xs" c="gray.6">
                No digital assets available
              </Text>
            )}

            {digitalAssets.map((it, idx) => (
              <AssetCard
                key={`digital-${idx}`}
                item={it}
                section="digitalAssets"
                toggleRequestAsset={toggleRequestAsset}
              />
            ))}
          </SimpleGrid>
        </Stack>

        {/* Additional Placements */}
        <Stack gap={8}>
          <Text fw={700} size="sm">
            Additional Placements
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {placements.length === 0 && (
              <Text size="xs" c="gray.6">
                No external placements available
              </Text>
            )}

            {placements.map((p, idx) => (
              <PlacementCard
                key={`placement-${idx}`}
                p={p}
                updatePlacementPrice={updatePlacementPrice}
                toggleRequestPlacement={toggleRequestPlacement}
              />
            ))}
          </SimpleGrid>
        </Stack>

        {/* Footer actions */}
        <Group justify="flex-end" align="center">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={savingAssets || requesting}
            disabled={!canSubmit}
          >
            Send Request
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
