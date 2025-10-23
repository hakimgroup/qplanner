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
  Textarea,
  TextInput,
  ActionIcon,
  Divider,
  Flex,
  Button,
  Card,
  Badge,
  Box,
  Tooltip,
  Switch,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type AssetOption = { label: string; value: number };
type AssetItem = {
  name: string;
  price: number | null;
  quantity: number | null;
  suffix: string | null;
  type: string; // 'default' | 'card' | 'free' | 'external'...
  adminRequested: boolean;
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

const GBP = (n: number | null | undefined) =>
  n == null ? "Free" : `£${(Math.round(n * 100) / 100).toFixed(0)}`;

const cloneAssets = (a?: Assets | null): Assets => ({
  printedAssets: (a?.printedAssets ?? []).map((x) => ({
    ...x,
    adminRequested: x.adminRequested ?? false,
    userSelected: x.userSelected ?? false,
    quantity: Number.isFinite(x.quantity as number)
      ? (x.quantity as number)
      : 0,
  })),
  digitalAssets: (a?.digitalAssets ?? []).map((x) => ({
    ...x,
    adminRequested: x.adminRequested ?? false,
    userSelected: x.userSelected ?? false,
    quantity: Number.isFinite(x.quantity as number)
      ? (x.quantity as number)
      : 0,
  })),
  externalPlacements: (a?.externalPlacements ?? []).map((x) => ({
    ...x,
    adminRequested: x.adminRequested ?? false,
    userSelected: x.userSelected ?? false,
    quantity: Number.isFinite(x.quantity as number)
      ? (x.quantity as number)
      : 0,
  })),
});

export default function AdminRequestAssetsModal({
  opened,
  onClose,
  selection,
}: Props) {
  const [assetsState, setAssetsState] = useState<Assets>(() =>
    cloneAssets(selection.assets)
  );
  const [note, setNote] = useState("");
  const [markRead, setMarkRead] = useState(false);

  const { mutate: updateAssets, isPending: savingAssets } =
    useUpdateSourceAssets();
  const { mutate: requestAssets, isPending: requesting } = useRequestAssets();

  // -----------------------
  // UI helpers / calculators
  // -----------------------
  const incQty = (section: keyof Assets, name: string) => {
    setAssetsState((prev) => ({
      ...prev,
      [section]: prev[section].map((it) =>
        it.name === name
          ? {
              ...it,
              adminRequested: true,
              quantity: Math.max(0, (it.quantity ?? 0) + 1),
            }
          : it
      ),
    }));
  };
  const decQty = (section: keyof Assets, name: string) => {
    setAssetsState((prev) => ({
      ...prev,
      [section]: prev[section].map((it) =>
        it.name === name
          ? {
              ...it,
              quantity: Math.max(0, (it.quantity ?? 0) - 1),
              // If quantity drops to 0 and wasn't userSelected, uncheck adminRequested
              adminRequested:
                Math.max(0, (it.quantity ?? 0) - 1) > 0
                  ? true
                  : it.userSelected
                  ? it.adminRequested
                  : false,
            }
          : it
      ),
    }));
  };

  const togglePlacement = (name: string) => {
    setAssetsState((prev) => ({
      ...prev,
      externalPlacements: prev.externalPlacements.map((it) =>
        it.name === name ? { ...it, adminRequested: !it.adminRequested } : it
      ),
    }));
  };

  const selectableAssets: AssetItem[] = useMemo(
    () => [...assetsState.printedAssets, ...assetsState.digitalAssets],
    [assetsState]
  );

  const placements: AssetItem[] = useMemo(
    () => assetsState.externalPlacements,
    [assetsState]
  );

  const lineTotal = (it: AssetItem): number => {
    const price = it.price ?? 0;
    const qty = it.quantity ?? 0;
    return price * qty;
  };

  const estimatedTotal = useMemo(() => {
    const a = selectableAssets.reduce((sum, it) => sum + lineTotal(it), 0);
    const b = placements
      .filter((p) => p.adminRequested || p.userSelected)
      .reduce((sum, it) => sum + (it.price ?? 0), 0);
    return a + b;
  }, [selectableAssets, placements]);

  const selectedCount = useMemo(() => {
    const gridSelected = selectableAssets.filter(
      (x) => (x.adminRequested || x.userSelected) && (x.quantity ?? 0) > 0
    ).length;
    const placementSelected = placements.filter(
      (x) => x.adminRequested || x.userSelected
    ).length;
    return gridSelected + placementSelected;
  }, [selectableAssets, placements]);

  const canSubmit = selectedCount > 0 && !savingAssets && !requesting;

  // -----------------------
  // Submit flow
  // -----------------------
  const handleSubmit = () => {
    // Persist requested quantities & flags back to the correct source
    updateAssets(
      {
        selectionId: selection.id,
        isBespoke: !!selection.isBespoke,
        bespokeCampaignId: selection.bespoke_campaign_id ?? null,
        assets: assetsState,
      },
      {
        onSuccess: () => {
          // Notify practice (no creatives here to match the UI)
          requestAssets(
            {
              selectionId: selection.id,
              creativeUrls: [], // not part of this UI; can be handled elsewhere if needed
              note: note || null,
            },
            {
              onSuccess: () => {
                toast.success("Campaign request sent");
                onClose();
              },
              onError: (e: any) => {
                toast.error(e?.message ?? "Failed to send campaign request");
              },
            }
          );
        },
        onError: (e: any) =>
          toast.error(e?.message ?? "Failed to save requested assets"),
      }
    );
  };

  // -----------------------
  // Render pieces
  // -----------------------
  const AssetCard = ({
    item,
    section,
  }: {
    item: AssetItem;
    section: keyof Assets;
  }) => {
    const selected =
      (item.adminRequested || item.userSelected) && (item.quantity ?? 0) > 0;
    return (
      <Card
        withBorder
        radius="md"
        px="md"
        py="sm"
        style={{
          borderColor: selected ? "#6b7bff" : "#e9ecef",
          background: selected ? "rgba(107, 123, 255, 0.06)" : "white",
        }}
      >
        <Stack gap={8}>
          <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
              <Text fw={600} size="sm">
                {item.name}
              </Text>
              <Text size="sm" c={item.price ? "blue.6" : "gray.7"} fw={600}>
                {item.price ? `${GBP(item.price)} each` : "Free"}
              </Text>
            </Stack>
            {/* Optional: badge to show selection state */}
            {(item.adminRequested || item.userSelected) && (
              <Badge variant="light" color="indigo">
                Selected
              </Badge>
            )}
          </Group>

          <Group justify="space-between" align="center" mt={6}>
            <Text size="sm" c="gray.7">
              Quantity:
            </Text>
            <Group gap={8} align="center">
              <ActionIcon
                variant="subtle"
                aria-label="decrease"
                onClick={() => decQty(section, item.name)}
              >
                <IconMinus size={16} />
              </ActionIcon>
              <TextInput
                value={String(item.quantity ?? 0)}
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
                onClick={() => incQty(section, item.name)}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          </Group>

          <Group justify="flex-end" mt={2}>
            <Text size="xs" c="gray.7">
              Total:{" "}
              <Text component="span" fw={600}>
                {item.price ? GBP(lineTotal(item)) : "Free"}
              </Text>
            </Text>
          </Group>
        </Stack>
      </Card>
    );
  };

  const PlacementPill = ({ p }: { p: AssetItem }) => {
    const selected = p.adminRequested || p.userSelected;
    return (
      <Card
        withBorder
        radius="md"
        px="md"
        py="sm"
        onClick={() => togglePlacement(p.name)}
        style={{
          borderColor: selected ? "#6b7bff" : "#e9ecef",
          background: selected ? "rgba(107, 123, 255, 0.06)" : "white",
          cursor: "pointer",
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap={10} align="center">
            <Checkbox
              checked={selected}
              onChange={() => togglePlacement(p.name)}
              radius="xl"
            />
            <Stack gap={2}>
              <Text fw={600} size="sm">
                {p.name}
              </Text>
              <Text size="xs" c="gray.6">
                {p.suffix ? p.suffix : "media budget"}
              </Text>
            </Stack>
          </Group>
          <Text fw={600} size="sm" c={p.price ? "gray.9" : "gray.7"}>
            {p.price ? GBP(p.price) : "Free"}
          </Text>
        </Group>
      </Card>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Submit Campaign Request</Text>}
      size="56rem"
      radius="lg"
      centered
      overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
    >
      <Stack gap="lg">
        {/* Select Assets */}
        <Stack gap={8}>
          <Group gap={8}>
            <Text fw={700} size="sm">
              Select Assets
            </Text>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {selectableAssets.map((it) => (
              <AssetCard
                key={`${it.name}`}
                item={it}
                section={
                  assetsState.printedAssets.some((a) => a.name === it.name)
                    ? "printedAssets"
                    : "digitalAssets"
                }
              />
            ))}
          </SimpleGrid>
        </Stack>

        {/* Additional Placements */}
        <Stack gap={8}>
          <Group gap={8}>
            <Text fw={700} size="sm">
              Additional Placements
            </Text>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {placements.map((p) => (
              <PlacementPill key={p.name} p={p} />
            ))}
          </SimpleGrid>
        </Stack>

        {/* Notes */}
        <Stack gap={6}>
          <Text fw={600} size="sm">
            Additional Notes (Optional)
          </Text>
          <Textarea
            placeholder="Add any specific instructions or requirements..."
            minRows={3}
            autosize
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
          />
        </Stack>

        {/* Footer summary */}
        <Card
          withBorder
          radius="md"
          px="md"
          py="md"
          style={{ borderColor: "#e9ecef", background: "#fafbfc" }}
        >
          <Group justify="space-between" align="center">
            <Text c="gray.7" fw={600}>
              Estimated Total Cost:
            </Text>
            <Text fw={800}>{GBP(estimatedTotal)}</Text>
          </Group>
        </Card>

        {/* Bottom actions */}
        <Group justify="space-between" align="center">
          <Group>
            <Switch
              size="sm"
              checked={markRead}
              onChange={(e) => setMarkRead(e.currentTarget.checked)}
              label="Mark as read"
            />
          </Group>

          <Group>
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={savingAssets || requesting}
              disabled={!canSubmit}
            >
              Submit Campaign Request
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
