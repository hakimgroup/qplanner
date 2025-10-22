import {
  Drawer,
  Flex,
  Badge,
  Stack,
  Divider,
  Card,
  Group,
  Grid,
  Button,
  Text,
  useMantineTheme,
  Collapse,
} from "@mantine/core";
import {
  IconShare3,
  IconCalendar,
  IconClockHour2,
  IconPlus,
  IconEdit,
  IconX,
  IconMinus,
  IconCalendarCheck,
} from "@tabler/icons-react";
import { useContext, useState } from "react";
import CampaignDates from "../campaignDates/CampaignDates";
import StyledButton from "../styledButton/StyledButton";
import { Campaign } from "@/models/campaign.models";
import {
  firstSentence,
  formatDateRange,
  getReferenceLinkLabel,
  updateState,
} from "@/shared/shared.utilities";
import { toast } from "sonner";
import {
  addDays,
  addWeeks,
  addMonths,
  differenceInCalendarDays,
  format,
  isValid as isValidDate,
  isAfter,
  isBefore,
} from "date-fns";
import { useAddSelection, useDeleteSelection } from "@/hooks/selection.hooks";
import {
  AppRoutes,
  SelectionsSource,
  SelectionStatus,
} from "@/shared/shared.models";
import Status from "../status/Status";
import Edit from "./Edit";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { startCase } from "lodash";
import { UserTabModes } from "@/models/general.models";
import AppContext from "@/shared/AppContext";

interface Props {
  mode: "add" | "view";
  c: Campaign;
  opened: boolean;
  closeDrawer: () => void;
}

type DateRange = { from: Date | null; to: Date | null };

const View = ({ c, opened = false, closeDrawer, mode = "add" }: Props) => {
  const navigate = useNavigate();
  const isAdd = mode === "add";
  const T = useMantineTheme();
  const { setState } = useContext(AppContext);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [addOpened, { toggle: toggleAdd }] = useDisclosure(false);

  const availFrom = c.availability?.from ? new Date(c.availability.from) : null;
  const availTo = c.availability?.to ? new Date(c.availability.to) : null;

  const defaultFrom = c.availability?.from
    ? new Date(c.availability.from)
    : new Date();

  const defaultTo = addDays(addMonths(defaultFrom, 1), -1);

  const [campaign, setCampaign] = useState<{ dateRange: DateRange }>(() => ({
    dateRange: {
      from: defaultFrom,
      to: defaultTo,
    },
  }));

  const { mutate: addSelection, isPending: adding } =
    useAddSelection(closeDrawer);
  const { mutate: deleteSelection, isPending: deleting } = useDeleteSelection();

  const Objectives = ({ noTitle = false }) => (
    <Stack gap={5}>
      {!noTitle && (
        <Text size="sm" fw={500} c={"blue.3"}>
          Objectives
        </Text>
      )}
      <Flex align={"center"} gap={4}>
        {c.objectives?.map((c) => (
          <Badge key={c} color="red.4">
            {startCase(c)}
          </Badge>
        ))}
      </Flex>
    </Stack>
  );

  const Topics = ({ noTitle = false }) => (
    <Stack gap={5}>
      {!noTitle && (
        <Text size="sm" fw={500} c={"blue.3"}>
          Categories
        </Text>
      )}
      <Flex align={"center"} gap={4}>
        {c.topics.map((c) => (
          <Badge key={c} variant="outline" color="gray.1">
            <Text size="xs" fw={600} c={"gray.9"}>
              {startCase(c)}
            </Text>
          </Badge>
        ))}
      </Flex>
    </Stack>
  );

  const quickDateOptions = [
    { name: "1 Week", type: "weeks", amount: 1 },
    { name: "2 Weeks", type: "weeks", amount: 2 },
    { name: "1 Month", type: "months", amount: 1 },
    { name: "2 Months", type: "months", amount: 2 },
    { name: "3 Months", type: "months", amount: 3 },
  ] as const;

  const safeStart = () => {
    const selected = campaign.dateRange.from;
    return selected && isValidDate(selected)
      ? selected
      : availFrom ?? new Date();
  };

  const computeEnd = (start: Date, opt: (typeof quickDateOptions)[number]) => {
    if (opt.type === "weeks") {
      return addDays(addWeeks(start, opt.amount), -1); // inclusive
    }
    return addDays(addMonths(start, opt.amount), -1); // inclusive
  };

  const optionDisabled = (opt: (typeof quickDateOptions)[number]) => {
    if (!availFrom || !availTo) return false; // no availability window → don't disable
    let start = safeStart();

    // normalize start within availability
    if (isBefore(start, availFrom)) start = availFrom;
    if (isAfter(start, availTo)) start = availFrom;

    const end = computeEnd(start, opt);

    const startsBefore = isBefore(start, availFrom);
    const endsAfter = isAfter(end, availTo);
    return startsBefore || endsAfter;
  };

  const applyQuickOption = (opt: (typeof quickDateOptions)[number]) => {
    const start = safeStart();
    const end = computeEnd(start, opt);

    setCampaign((prev) => ({
      ...prev,
      dateRange: { from: start, to: end },
    }));
  };

  const daysDuration = (() => {
    const { from, to } = campaign.dateRange;
    if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
    return differenceInCalendarDays(to, from) + 1; // inclusive
  })();

  const scheduleText = (() => {
    const { from, to } = campaign.dateRange;
    if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
    return `${format(from, "EEEE, MMMM do, yyyy")} → ${format(
      to,
      "EEEE, MMMM do, yyyy"
    )}`;
  })();

  const canSubmit =
    !!campaign.dateRange.from &&
    !!campaign.dateRange.to &&
    isValidDate(campaign.dateRange.from as Date) &&
    isValidDate(campaign.dateRange.to as Date);

  const handleAddToPlan = () => {
    if (!canSubmit) {
      toast.error("Please choose a valid start and end date");
      return;
    }

    addSelection(
      {
        campaign_id: c.id,
        from_date: format(campaign.dateRange.from as Date, "yyyy-MM-dd"),
        to_date: format(campaign.dateRange.to as Date, "yyyy-MM-dd"),
        status: SelectionStatus.OnPlan,
        source: SelectionsSource.Manual,
      },
      {
        onSuccess: () => {
          toast.success(`Added "${c.name}" to plan`);
          closeDrawer();
          updateState(
            setState,
            "filters.userSelectedTab",
            UserTabModes.Selected
          );
        },
        onError: (e: any) => {
          toast.error(e?.message ?? "Could not add to plan");
        },
      }
    );
  };

  const onRemove = () => {
    deleteSelection(
      { selectionId: c.selection_id, bespokeId: c.bespoke_campaign_id },
      {
        onSuccess: () => {
          toast.success("Removed from plan");
          closeDrawer();
        },
        onError: (e: any) => toast.error(e.message ?? "Could not remove"),
      }
    );
  };

  return (
    <>
      <Drawer
        size={"32rem"}
        opened={opened}
        onClose={closeDrawer}
        title={
          <Flex align={"center"} gap={5}>
            <Text fz={"h4"} fw={600}>
              {c.name}
            </Text>
            <Status status={c.status} />
          </Flex>
        }
        position="right"
        offset={8}
        radius={10}
        overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
      >
        <Stack gap={20} pb={20}>
          {c?.is_event && (
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
                  {c?.event_type}
                </Text>
              </Group>
            </Card>
          )}

          <Text c={"gray.7"} maw={400}>
            {firstSentence(c.description)}
          </Text>

          <Stack gap={5}>
            <Text c={c.is_event ? "violet" : "gray.9"} size="sm" fw={700}>
              {c?.is_event ? "Event Dates" : "Availability"}
            </Text>

            <Text size="sm" fw={500}>
              {c.selected
                ? formatDateRange(c.selection_from_date, c.selection_to_date)
                : formatDateRange(c.availability?.from, c.availability?.to)}
            </Text>
          </Stack>

          <Divider size={"xs"} color="gray.1" />
          <Objectives />
          <Topics />
          <Divider size={"xs"} color="gray.1" />

          <Text fw={500} size="sm">
            Description
          </Text>
          <Text c="gray.7" size="sm">
            {c.description}
          </Text>

          <Divider size={"xs"} color="gray.1" />

          <Stack gap={10}>
            <Text fw={500} size="sm">
              More Information
            </Text>

            <Text c="gray.6" size="sm">
              We don't have the current artwork for this yet, but please see
              similar campaigns that have rolled out in the past.
            </Text>

            <Stack mt={10}>
              {c.reference_links?.map((rl: string, i: number) => (
                <StyledButton
                  alignLeft
                  bg={"violet.0"}
                  key={rl}
                  link={rl}
                  leftSection={
                    <IconShare3 size={18} color={T.colors.gray[9]} />
                  }
                >
                  {getReferenceLinkLabel(rl, i)}
                </StyledButton>
              ))}

              {!c.reference_links?.length && <IconMinus size={20} />}
            </Stack>

            {/* {!isAdd && (
							<StyledButton
								alignLeft
								bg={"lime.0"}
								fullWidth
								leftSection={
									<IconShare3
										size={18}
										color={T.colors.gray[9]}
									/>
								}
								style={{ justifyContent: "flex-start" }}
								onClick={() => navigate(AppRoutes.FAQs)}
							>
								Full FAQs
							</StyledButton>
						)} */}
          </Stack>

          {c.selected && (
            <>
              <Divider size={"xs"} color="gray.1" />

              <Grid gutter={10}>
                <Grid.Col span={8}>
                  <StyledButton
                    fw={500}
                    fullWidth
                    leftSection={
                      <IconEdit size={18} color={T.colors.gray[9]} />
                    }
                    onClick={openEdit}
                  >
                    Edit Dates
                  </StyledButton>
                </Grid.Col>

                <Grid.Col span={4}>
                  <Button
                    fullWidth
                    radius={10}
                    color="red.4"
                    leftSection={<IconX size={15} />}
                    loading={deleting}
                    onClick={onRemove}
                  >
                    Remove
                  </Button>
                </Grid.Col>
              </Grid>
            </>
          )}

          {!addOpened && !c.selected && (
            <>
              <Divider size={"xs"} color="gray.1" />
              <Button
                fullWidth
                radius={10}
                color="blue.3"
                leftSection={<IconPlus size={15} />}
                onClick={toggleAdd}
                loading={adding}
              >
                Add to Plan
              </Button>
            </>
          )}

          <Collapse in={addOpened}>
            <Card bg={"#fbfbfc"} radius={10}>
              <Stack gap={25}>
                <Stack gap={3}>
                  <Text fw={600} size="sm">
                    Select Campaign Dates
                  </Text>
                  <Text c="gray.7" size="sm">
                    Set the date range for "{c.name}"
                  </Text>
                </Stack>

                <CampaignDates
                  icon={<IconCalendar size={16} />}
                  dateRange={campaign.dateRange}
                  minDate={availFrom ? new Date(availFrom) : undefined}
                  maxDate={availTo ? new Date(availTo) : undefined}
                  onChange={(range) =>
                    setCampaign((prev) => ({
                      ...prev,
                      dateRange: range,
                    }))
                  }
                  startLabel="Start Date"
                  endLabel="End Date"
                  inputSize="md"
                  labelSize="sm"
                  titleLabelSize="sm"
                  hideTitleIcon
                />

                <Card bg={"#f6f6f8"} radius={10}>
                  <Flex align={"center"} justify={"space-between"}>
                    <Group align={"center"} gap={10}>
                      <IconClockHour2 size={18} color={T.colors.gray[7]} />
                      <Text fw={500} size="sm">
                        Duration:
                      </Text>
                    </Group>
                    <Badge color="red.4">
                      {daysDuration
                        ? `${daysDuration} day${daysDuration === 1 ? "" : "s"}`
                        : "-"}
                    </Badge>
                  </Flex>
                </Card>

                <Stack>
                  <Text fw={500} size="sm">
                    Quick Options
                  </Text>

                  <Grid gutter={8}>
                    {quickDateOptions.map((d) => {
                      const disabled = optionDisabled(d);
                      return (
                        <Grid.Col span={4} key={d.name}>
                          <StyledButton
                            fullWidth
                            fw={500}
                            fz={"xs"}
                            disabled={disabled}
                            onClick={() => {
                              if (!disabled) applyQuickOption(d);
                            }}
                          >
                            {d.name}
                          </StyledButton>
                        </Grid.Col>
                      );
                    })}
                  </Grid>
                </Stack>

                <Card bg={"#ecedfd"} radius={10}>
                  <Stack gap={2}>
                    <Text fw={600} size="xs" c={"gray.6"}>
                      Campaign Schedule:
                    </Text>
                    <Text size="xs" c={"gray.6"}>
                      {scheduleText ?? "—"}
                    </Text>
                  </Stack>
                </Card>

                <Flex align="center" gap={10}>
                  <StyledButton fullWidth onClick={toggleAdd}>
                    Cancel
                  </StyledButton>
                  <Button
                    fullWidth
                    onClick={handleAddToPlan}
                    leftSection={<IconCalendar size={18} />}
                  >
                    Add to Calendar
                  </Button>
                </Flex>
              </Stack>
            </Card>
          </Collapse>

          {isAdd && (
            <Text fw={700} size="xs" ta={"center"}>
              Adding to{" "}
              <Text span fw={700} c="blue.4">
                {c.name}
              </Text>
            </Text>
          )}
        </Stack>
      </Drawer>

      <Edit opened={editOpened} closeModal={closeEdit} selection={c} />
    </>
  );
};

export default View;
