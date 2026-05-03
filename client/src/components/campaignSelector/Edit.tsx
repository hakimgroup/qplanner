import { Colors } from "@/shared/shared.const";
import {
  Stack,
  Flex,
  Title,
  Card,
  Group,
  Textarea,
  Button,
  useMantineTheme,
  Text,
  Badge,
  Drawer,
  Alert,
} from "@mantine/core";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import {
  IconEdit,
  IconCalendar,
  IconTrash,
  IconCalendarCheck,
  IconLock,
  IconInfoCircle,
} from "@tabler/icons-react";
import CampaignDates from "../campaignDates/CampaignDates";
import StyledButton from "../styledButton/StyledButton";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  differenceInCalendarDays,
  format,
  isValid as isValidDate,
} from "date-fns";
import {
  useUpdateSelection,
  useDeleteSelection,
} from "@/hooks/selection.hooks";
import { toast } from "sonner";
import { SelectionStatus } from "@/shared/shared.models";
import { Campaign } from "@/models/campaign.models";
import { startCase } from "lodash";
import AppContext from "@/shared/AppContext";
import { UserTabModes } from "@/models/general.models";
import { updateState } from "@/shared/shared.utilities";
import { useIsMobile } from "@/shared/shared.hooks";
import Status from "@/components/status/Status";

type DateRange = { from: Date | null; to: Date | null };

interface EditProps {
  opened?: boolean;
  closeModal: () => void;
  /**
   * Selection to edit. Minimal fields required for update/delete.
   * Optional campaign fields are used for the header block if present.
   */
  selection: Campaign;
}

// Practice can freely edit the selection only at these stages.
// Anything past this is locked — it would lie about the design team's state.
const EDITABLE_STATUSES = new Set<string>([
  SelectionStatus.Draft,
  SelectionStatus.OnPlan,
]);

const Edit = ({ opened = false, closeModal, selection: s }: EditProps) => {
  const T = useMantineTheme();
  const isMobile = useIsMobile();
  const { setState } = useContext(AppContext);

  const isEditable = EDITABLE_STATUSES.has(s?.status ?? "");

  // Combined callback for modal close + tab switch
  const handleSuccess = () => {
    closeModal();
    updateState(setState, "filters.userSelectedTab", UserTabModes.Selected);
  };

  const [campaign, setCampaign] = useState<{ dateRange: DateRange }>({
    dateRange: { from: null, to: null },
  });
  const [notes, setNotes] = useState<string>(s?.notes ?? "");

  // Seed state from incoming selection when opened/selection changes
  useEffect(() => {
    if (!s) return;
    const from = s.selection_from_date ? new Date(s.selection_from_date) : null;
    const to = s.selection_to_date ? new Date(s.selection_to_date) : null;
    setCampaign({ dateRange: { from, to } });
    setNotes(s.notes ?? "");
  }, [s, opened]);

  const { mutate: updateSelection, isPending: saving } =
    useUpdateSelection(handleSuccess);
  const { mutate: deleteSelection, isPending: removing } =
    useDeleteSelection(handleSuccess);

  const Objectives = () => {
    const items = s.objectives?.length ? s.objectives : [];
    if (!items.length) return null;
    return (
      <Flex align={"center"} gap={4} wrap="wrap">
        {items.map((c) => (
          <Badge key={c} color="red.4">
            {startCase(c)}
          </Badge>
        ))}
      </Flex>
    );
  };

  const Topics = () => {
    const items = s.topics?.length ? s.topics : [];
    if (!items.length) return null;
    return (
      <Flex align={"center"} gap={4} wrap="wrap">
        {items.map((c) => (
          <Badge key={c} variant="outline" color="gray.1">
            <Text size="xs" fw={600} c={"gray.9"}>
              {startCase(c)}
            </Text>
          </Badge>
        ))}
      </Flex>
    );
  };

  const { from, to } = campaign.dateRange;
  const durationDays = useMemo(() => {
    if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
    return differenceInCalendarDays(to, from) + 1;
  }, [from, to]);

  const prettyRange = useMemo(() => {
    if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
    return `${format(from, "EEEE, MMM do")} → ${format(to, "EEEE, MMM do")}`;
  }, [from, to]);

  const canSave =
    !!from && !!to && isValidDate(from) && isValidDate(to) && isEditable;

  const handleSave = () => {
    if (!canSave) {
      toast.error("Please choose a valid date range.");
      return;
    }
    updateSelection(
      {
        id: s.selection_id,
        patch: {
          from_date: format(from as Date, "yyyy-MM-dd"),
          to_date: format(to as Date, "yyyy-MM-dd"),
          notes: notes ?? undefined,
        },
        campaignName: s.name,
        campaignCategory: s.category,
      },
      {
        onError: (e: any) =>
          toast.error(e?.message ?? "Could not save changes"),
      }
    );
  };

  const handleRemove = () => {
    deleteSelection(
      {
        selectionId: s.selection_id,
        bespokeId: s.bespoke_campaign_id,
        campaignName: s.name,
        campaignCategory: s.category,
      },
      {
        onError: (e: any) => toast.error(e?.message ?? "Could not remove"),
      }
    );
  };

  const titleText = isEditable
    ? `Edit ${s?.is_event ? "Event" : "Campaign"}`
    : `${s?.is_event ? "Event" : "Campaign"} Details`;

  const subtitleText = isEditable ? "Modify the details for" : "Details for";

  return (
    <Drawer
      opened={opened}
      onClose={closeModal}
      title={
        <Stack gap={0}>
          <Flex align={"center"} gap={7}>
            {isEditable ? (
              <IconEdit color={T.colors.blue[3]} size={22} />
            ) : (
              <IconLock color={T.colors.gray[6]} size={20} />
            )}
            <Title order={4} fw={600}>
              {titleText}
            </Title>
          </Flex>

          <Text size="sm" c="gray.8">
            {subtitleText}{" "}
            <Text span c="blue.4" fw={700}>
              &quot;
              {s?.name}
              &quot;
            </Text>
          </Text>
        </Stack>
      }
      size={"32rem"}
      position="right"
      offset={8}
      radius={10}
      overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
    >
      <Stack gap={20}>
        {s?.is_event && (
          <Card
            p={10}
            radius={10}
            bg={"violet.0"}
            style={{
              border: `1px solid ${T.colors.violet[1]}`,
            }}
            shadow="xs"
          >
            <Group align="center" justify="space-between">
              <Badge
                color="violet"
                size="lg"
                leftSection={<IconCalendarCheck size={15} />}
              >
                Event
              </Badge>
              <Text c="violet" size="sm" fw={700}>
                {s?.event_type}
              </Text>
            </Group>
          </Card>
        )}

        <Card radius={10} bg={Colors.cream}>
          <Stack gap={7}>
            <Group justify="space-between" align="flex-start">
              <Text fw={500} style={{ flex: 1 }}>
                {s?.name}
              </Text>
              {s?.status && <Status status={s.status} />}
            </Group>
            <Text size="sm" c="gray.7">
              {s.description}
            </Text>
            <Group align="center" gap={5} mt={5}>
              <Objectives />
              <Topics />
            </Group>
          </Stack>
        </Card>

        {!isEditable && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue.3"
            radius={10}
            variant="light"
            title="This selection is locked"
          >
            <Text size="xs" c="gray.7">
              Once submitted to the design team, dates and notes can't be
              changed here. Need to update something or pull this campaign?
              Contact your admin and they'll coordinate with the design team.
            </Text>
          </Alert>
        )}

        <GradientDivider />

        <Text size="sm" c={"gray.9"} fw={600}>
          {s?.is_event ? "Event Dates" : "Campaign Dates"}
        </Text>

        {isEditable ? (
          <CampaignDates
            icon={<IconCalendar size={16} />}
            dateRange={campaign.dateRange}
            onChange={(range) =>
              setCampaign({ ...campaign, dateRange: range })
            }
            startLabel={s?.is_event ? "Event Start Date" : "Start Date"}
            endLabel={s?.is_event ? "Event End Date" : "End Date"}
            inputSize="sm"
            labelSize="sm"
            titleLabelSize="sm"
            hideTitleIcon
          />
        ) : (
          <Card radius={10} bg={"gray.0"} p={12}>
            <Group gap={8} align="center">
              <IconCalendar size={16} color={T.colors.gray[7]} />
              <Text size="sm" fw={500}>
                {prettyRange ?? "—"}
              </Text>
            </Group>
          </Card>
        )}

        <Card radius={10} bg={"violet.0"} p={10} mt={5}>
          <Text size="sm" c={"gray.7"}>
            Duration:{" "}
            <Text span fw={700}>
              {durationDays
                ? `${durationDays} day${durationDays === 1 ? "" : "s"}`
                : "—"}
            </Text>
          </Text>

          {isEditable && (
            <Text size="sm" c={"gray.7"}>
              {prettyRange ?? "—"}
            </Text>
          )}
        </Card>

        <GradientDivider />

        {isEditable ? (
          <Textarea
            resize="vertical"
            size="sm"
            radius={10}
            label="Notes (Optional)"
            placeholder="Add any additional notes or details about this campaign"
            minRows={3}
            maxRows={10}
            autosize
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />
        ) : (
          <Stack gap={6}>
            <Text size="sm" fw={600} c="gray.9">
              Notes
            </Text>
            <Card radius={10} bg={"gray.0"} p={12}>
              <Text
                size="sm"
                c={notes ? "gray.8" : "gray.5"}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {notes || "—"}
              </Text>
            </Card>
          </Stack>
        )}

        <GradientDivider />

        {isEditable ? (
          <Group align={"center"} justify="space-between">
            <Button
              radius={10}
              color="red.4"
              leftSection={<IconTrash size={14} />}
              onClick={handleRemove}
              loading={removing}
            >
              Remove from Plan
            </Button>
            <Flex align={"center"} gap={8}>
              <StyledButton onClick={closeModal}>Cancel</StyledButton>
              <Button
                radius={10}
                color={s?.is_event ? "violet" : "blue.3"}
                onClick={handleSave}
                loading={saving}
                disabled={!canSave}
              >
                Save Changes
              </Button>
            </Flex>
          </Group>
        ) : (
          <Flex justify="flex-end">
            <StyledButton onClick={closeModal}>Close</StyledButton>
          </Flex>
        )}
      </Stack>
    </Drawer>
  );
};

export default Edit;
