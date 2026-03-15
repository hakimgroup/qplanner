import StyledButton from "@/components/styledButton/StyledButton";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  useMantineTheme,
  ThemeIcon,
  Collapse,
  Progress,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  IconAsterisk,
  IconCalendar,
  IconPlus,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconCircle,
  IconBulb,
  IconTarget,
  IconUsers,
  IconMessage,
  IconHeart,
  IconStar,
  IconBox,
  IconChartBar,
  IconAlertTriangle,
  IconRocket,
} from "@tabler/icons-react";
import { useCallback, useContext, useMemo, useState } from "react";
import CampaignDates from "@/components/campaignDates/CampaignDates";
import { isValid as isValidDate } from "date-fns";
import { toast } from "sonner";
import { useCreateBespokeSelection } from "@/hooks/campaign.hooks";
import { SelectionStatus } from "@/shared/shared.models";
import { GetAssetsResponse, UserTabModes } from "@/models/general.models";
import AppContext from "@/shared/AppContext";
import { updateState } from "@/shared/shared.utilities";
import { useAssets } from "@/hooks/general.hooks";
import { startCase } from "lodash";
import { useIsMobile } from "@/shared/shared.hooks";

type DateRange = { from: Date | null; to: Date | null };

const BRIEF_QUESTIONS = [
  { key: "background", label: "Background", sub: "What triggered the brief?", icon: IconBulb, color: "blue" },
  { key: "opportunity", label: "The Opportunity", sub: "Insight or reason for acting now? What's not currently working?", icon: IconTarget, color: "orange" },
  { key: "audience", label: "Audience", sub: "Who are we talking to?", icon: IconUsers, color: "teal" },
  { key: "keyMessage", label: "Key Message", sub: "What is the most important thing we need to communicate?", icon: IconMessage, color: "violet" },
  { key: "emotionalResponse", label: "Emotional Response", sub: "How should this make people feel?", icon: IconHeart, color: "pink" },
  { key: "usp", label: "Unique Selling Point", sub: "What is the offer or benefit?", icon: IconStar, color: "yellow" },
  { key: "deliverables", label: "Deliverables", sub: "Assets needed", icon: IconBox, color: "indigo" },
  { key: "measurement", label: "Measurement", sub: "How will we measure if this is successful? (if possible)", icon: IconChartBar, color: "cyan" },
  { key: "avoid", label: "What Should Be Avoided?", sub: "Things to steer clear of", icon: IconAlertTriangle, color: "red" },
  { key: "leanInto", label: "What Should We Lean Into?", sub: "Strengths or themes to embrace", icon: IconRocket, color: "green" },
] as const;

type BriefAnswers = Record<string, string>;

function formatBriefToDescription(answers: BriefAnswers): string {
  return BRIEF_QUESTIONS
    .filter((q) => answers[q.key]?.trim())
    .map((q) => `${q.label}\n${answers[q.key].trim()}`)
    .join("\n\n");
}

function BriefGuide({
  answers,
  onChange,
}: {
  answers: BriefAnswers;
  onChange: (answers: BriefAnswers) => void;
}) {
  const T = useMantineTheme();
	const isMobile = useIsMobile();
  const [expandedKey, setExpandedKey] = useState<string | null>(BRIEF_QUESTIONS[0].key);

  const answeredCount = BRIEF_QUESTIONS.filter((q) => answers[q.key]?.trim()).length;
  const progress = (answeredCount / BRIEF_QUESTIONS.length) * 100;

  const toggle = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <Stack gap={12}>
      <Group justify="space-between" align="center">
        <Group gap={6}>
          <Text size="md" fw={500} c="gray.9">Campaign Brief</Text>
          <IconAsterisk size={9} color="red" />
        </Group>
        <Text size="xs" fw={600} c="blue.5">
          {answeredCount}/{BRIEF_QUESTIONS.length} answered
        </Text>
      </Group>

      <Progress value={progress} size="xs" radius="xl" color="blue.3" />

      <Stack gap={6}>
        {BRIEF_QUESTIONS.map((q, idx) => {
          const isOpen = expandedKey === q.key;
          const hasAnswer = !!answers[q.key]?.trim();
          const Icon = q.icon;

          return (
            <Paper
              key={q.key}
              radius="md"
              bg={hasAnswer ? `${q.color}.0` : "#fafafa"}
              style={{
                borderLeft: `3px solid ${T.colors[q.color][hasAnswer ? 5 : 1]}`,
                transition: "all 0.2s",
              }}
            >
              <Group
                gap="sm"
                px="md"
                py="sm"
                style={{ cursor: "pointer" }}
                onClick={() => toggle(q.key)}
                wrap="nowrap"
              >
                <ThemeIcon
                  size="sm"
                  radius="xl"
                  variant="light"
                  color={hasAnswer ? q.color : "gray"}
                >
                  <Icon size={14} />
                </ThemeIcon>

                <Stack gap={0} style={{ flex: 1 }}>
                  <Text size="sm" fw={600} c={hasAnswer ? "gray.9" : "gray.7"}>
                    {q.label}
                  </Text>
                  {!isOpen && hasAnswer && (
                    <Text size="xs" c="gray.5" lineClamp={1}>
                      {answers[q.key]}
                    </Text>
                  )}
                </Stack>

                <Group gap={6}>
                  {hasAnswer ? (
                    <IconCircleCheck size={16} color={T.colors[q.color][5]} />
                  ) : (
                    <IconCircle size={16} color={T.colors.gray[3]} />
                  )}
                  {isOpen ? (
                    <IconChevronDown size={14} color={T.colors.gray[5]} />
                  ) : (
                    <IconChevronRight size={14} color={T.colors.gray[4]} />
                  )}
                </Group>
              </Group>

              <Collapse in={isOpen}>
                <Box px="md" pb="sm">
                  <Text size="xs" c="gray.5" mb={6}>
                    {q.sub}
                  </Text>
                  <Textarea
                    placeholder={`${q.sub}...`}
                    value={answers[q.key] || ""}
                    onChange={(e) =>
                      onChange({ ...answers, [q.key]: e.currentTarget.value })
                    }
                    minRows={2}
                    autosize
                    radius="md"
                    size="sm"
                    styles={{
                      input: {
                        backgroundColor: T.colors.gray[0],
                        borderColor: T.colors[q.color][1],
                        "&:focus": {
                          borderColor: T.colors[q.color][4],
                        },
                      },
                    }}
                  />
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}

const Bespoke = ({
  buttonText = "Bespoke Campaign",
}: {
  buttonText?: string;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const T = useMantineTheme();
  const isMobile = useIsMobile();
  const {
    state: { filtersOptions },
    setState,
  } = useContext(AppContext);

  const [links, setLinks] = useState<string[]>([""]);
  const [briefAnswers, setBriefAnswers] = useState<BriefAnswers>({});
  const {
    data: assetsData,
    isLoading: loadingAssets,
    error: assetsError,
  } = useAssets();
  const { mutate: createBespoke, isPending: creating } =
    useCreateBespokeSelection();

  const form = useForm<{
    title: string;
    notes: string;
    dateRange: DateRange;
    objectives: string[];
    topics: string[];
    selectedAssets: string[];
  }>({
    initialValues: {
      title: "",
      notes: "",
      dateRange: { from: null, to: null },
      objectives: [],
      topics: [],
      selectedAssets: [],
    },
    validate: {
      title: (v) => (!v.trim() ? "Title is required" : null),
      dateRange: ({ from, to }) => {
        if (!from || !to) return "Start and end dates are required";
        if (!isValidDate(from) || !isValidDate(to)) return "Invalid dates";
        if (from > to) return "Start date cannot be after end date";
        return null;
      },
      objectives: (arr) =>
        arr.length === 0 ? "Select at least one objective" : null,
      topics: (arr) => (arr.length === 0 ? "Select at least one topic" : null),
      selectedAssets: (arr) =>
        arr.length === 0 ? "Select at least one asset" : null,
    },
  });

  const handleChangeLink = (index: number, value: string) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
  };
  const handleAddLink = () => setLinks((l) => [...l, ""]);
  const handleRemoveLink = (index: number) =>
    setLinks((l) => l.filter((_, i) => i !== index));

  const resetForm = useCallback(() => {
    form.reset();
    setLinks([""]);
    setBriefAnswers({});
  }, [form]);

  const hasBriefAnswer = useMemo(
    () => BRIEF_QUESTIONS.some((q) => briefAnswers[q.key]?.trim()),
    [briefAnswers]
  );
  const canSubmit = useMemo(() => form.isValid() && hasBriefAnswer, [form, hasBriefAnswer]);

  const handleCancel = () => {
    resetForm();
    close();
  };

  const onSubmit = form.onSubmit((values) => {
    const {
      title,
      notes,
      dateRange,
      objectives,
      topics,
      selectedAssets,
    } = values;
    const description = formatBriefToDescription(briefAnswers);
    const { from, to } = dateRange;
    if (!from || !to) {
      toast.error("Please choose a valid start and end date.");
      return;
    }

    const cleanedLinks = links.map((l) => l.trim()).filter(Boolean);

    // ✅ Build structured assets object
    const buildAssets = <K extends keyof GetAssetsResponse>(key: K) => {
      const section = assetsData?.[key]?.content ?? [];
      return section.map((a) => ({
        ...a,
        userSelected: values.selectedAssets.includes(a.name),
      }));
    };

    const assets = {
      printedAssets: buildAssets("printedAssets"),
      digitalAssets: buildAssets("digitalAssets"),
      externalPlacements: buildAssets("externalPlacements"),
    };

    createBespoke(
      {
        name: title.trim(),
        description: description.trim(),
        from,
        to,
        status: SelectionStatus.OnPlan,
        notes,
        objectives,
        topics,
        assets,
        reference_links: cleanedLinks,
      },
      {
        onSuccess: () => {
          resetForm();
          close();
          updateState(
            setState,
            "filters.userSelectedTab",
            UserTabModes.Selected
          );
        },
        onError: (e: any) => {
          toast.error(e?.message ?? "Could not create bespoke campaign");
        },
      }
    );
  });

  return (
    <>
      <StyledButton
        fw={500}
        leftSection={<IconPlus size={14} />}
        onClick={open}
      >
        {buttonText}
      </StyledButton>

      <Modal
			fullScreen={isMobile}
			opened={opened}
        onClose={close}
        title={
          <Stack gap={0}>
            <Flex align={"center"} gap={10}>
              <IconPlus color={T.colors.blue[3]} size={21} />
              <Text fz={"h4"} fw={600}>
                Create Bespoke Campaign
              </Text>
            </Flex>
            <Text size="sm" c="gray.6">
              Create a custom campaign tailored to your specific needs
            </Text>
          </Stack>
        }
        centered
        radius={10}
        size="42rem"
        overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
      >
        <form onSubmit={onSubmit}>
          <Stack gap={25}>
            <TextInput
              withAsterisk
              radius={10}
              size="md"
              label="Campaign Title"
              placeholder="Enter campaign title"
              {...form.getInputProps("title")}
            />
            <BriefGuide
              answers={briefAnswers}
              onChange={setBriefAnswers}
            />
            <CampaignDates
              required
              minDate={new Date(2026, 0, 1)}
              maxDate={new Date(2026, 11, 31)}
              title="Preferred Dates"
              icon={<IconCalendar size={16} />}
              dateRange={form.values.dateRange}
              onChange={(range) => form.setFieldValue("dateRange", range)}
              startLabel="Preferred Start Date"
              endLabel="Preferred End Date"
              inputSize="md"
              labelSize="sm"
              titleLabelSize="md"
              hideTitleIcon
            />
            {form.errors.dateRange && (
              <Text size="xs" c="red.6">
                {" "}
                {form.errors.dateRange as string}{" "}
              </Text>
            )}
            <Stack gap={10}>
              {" "}
              <Group align="flex-start" gap={3}>
                {" "}
                <Text size="md" c="gray.9" fw={500}>
                  {" "}
                  Objectives{" "}
                </Text>{" "}
                <IconAsterisk size={9} color="red" />{" "}
              </Group>{" "}
              <Chip.Group
                multiple
                value={form.values.objectives}
                onChange={(v) => form.setFieldValue("objectives", v)}
              >
                {" "}
                <Group align="center" gap={5}>
                  {" "}
                  {filtersOptions?.objectives.map((c) => (
                    <Chip
                      value={c}
                      key={c}
                      color={"blue.3"}
                      size="xs"
                      fw={600}
                      variant={
                        form.values.objectives.includes(c)
                          ? "filled"
                          : "outline"
                      }
                    >
                      {" "}
                      {startCase(c)}{" "}
                    </Chip>
                  ))}{" "}
                </Group>{" "}
              </Chip.Group>{" "}
              {form.errors.objectives && (
                <Text size="xs" c="red.6">
                  {" "}
                  {form.errors.objectives}{" "}
                </Text>
              )}{" "}
            </Stack>{" "}
            <Stack gap={10}>
              {" "}
              <Group align="flex-start" gap={3}>
                {" "}
                <Text size="md" c="gray.9" fw={500}>
                  {" "}
                  Categories{" "}
                </Text>{" "}
                <IconAsterisk size={9} color="red" />{" "}
              </Group>{" "}
              <Chip.Group
                multiple
                value={form.values.topics}
                onChange={(v) => form.setFieldValue("topics", v)}
              >
                {" "}
                <Group align="center" gap={5}>
                  {" "}
                  {filtersOptions?.topics.map((c) => (
                    <Chip
                      value={c}
                      key={c}
                      color={"blue.3"}
                      size="xs"
                      fw={600}
                      variant={
                        form.values.topics.includes(c) ? "filled" : "outline"
                      }
                    >
                      {" "}
                      {startCase(c)}{" "}
                    </Chip>
                  ))}{" "}
                </Group>{" "}
              </Chip.Group>{" "}
              {form.errors.topics && (
                <Text size="xs" c="red.6">
                  {" "}
                  {form.errors.topics}{" "}
                </Text>
              )}{" "}
            </Stack>
            {/* ✅ Required Assets Section */}
            <Stack gap={15}>
              <Group align="flex-start" gap={3}>
                <Text size="md" c="gray.9" fw={500}>
                  Required Assets
                </Text>
                <IconAsterisk size={9} color="red" />
              </Group>

              {loadingAssets && <Loader size="sm" color="blue" />}
              {assetsError && (
                <Text size="sm" c="red">
                  Failed to load assets.
                </Text>
              )}

              {!loadingAssets && assetsData && (
                <>
                  {(
                    [
                      { key: "printedAssets", label: "Printed Assets" },
                      { key: "digitalAssets", label: "Digital Assets" },
                      // {
                      //   key: "externalPlacements",
                      //   label: "External Placements",
                      // },
                    ] as const
                  ).map(({ key, label }) => (
                    <Box key={key}>
                      <Text fw={600} size="sm" mb={6} c="blue.3">
                        {label}
                      </Text>
                      <Checkbox.Group
                        value={form.values.selectedAssets}
                        onChange={(v) =>
                          form.setFieldValue("selectedAssets", v)
                        }
                      >
                        <SimpleGrid cols={2} spacing={6} mt={4}>
                          {assetsData?.[key]?.content?.map((a) => (
                            <Checkbox
                              key={a.name}
                              radius={50}
                              size="xs"
                              color="blue.3"
                              value={a.name}
                              label={
                                <Text size="sm" fw={500}>
                                  {a.name}
                                </Text>
                              }
                            />
                          ))}
                        </SimpleGrid>
                      </Checkbox.Group>
                      <Divider my={12} color="gray.0" />
                    </Box>
                  ))}
                </>
              )}

              {form.errors.selectedAssets && (
                <Text size="xs" c="red.6">
                  {form.errors.selectedAssets}
                </Text>
              )}
            </Stack>
            {/* ✅ Reference Links */}
            <Stack gap={10}>
              <Flex align="center" justify="space-between">
                <Text size="md" c="gray.9" fw={500}>
                  Reference Links (optional)
                </Text>
                <StyledButton
                  leftSection={<IconPlus size={14} />}
                  onClick={handleAddLink}
                >
                  Add Link
                </StyledButton>
              </Flex>

              {links.map((link, index) => (
                <Grid key={index} gutter="xs">
                  <Grid.Col span={links.length > 1 ? 11 : 12}>
                    <TextInput
                      w="100%"
                      radius={10}
                      placeholder="https://example.com"
                      value={link}
                      onChange={({ target: { value } }) =>
                        handleChangeLink(index, value)
                      }
                    />
                  </Grid.Col>
                  {links.length > 1 && (
                    <Grid.Col span={1}>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleRemoveLink(index)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Grid.Col>
                  )}
                </Grid>
              ))}
            </Stack>
            <Textarea
              resize="vertical"
              radius={10}
              label="Additional Notes"
              placeholder="Any additional requirements or context"
              minRows={3}
              autosize
              {...form.getInputProps("notes")}
            />
            <Flex justify="flex-end" gap={8}>
              <StyledButton onClick={handleCancel}>Cancel</StyledButton>
              <Button
                type="submit"
                radius={10}
                color="blue.3"
                loading={creating}
                disabled={!canSubmit}
                leftSection={<IconPlus size={14} />}
              >
                Create Campaign
              </Button>
            </Flex>
          </Stack>
        </form>
      </Modal>
    </>
  );
};

export default Bespoke;
