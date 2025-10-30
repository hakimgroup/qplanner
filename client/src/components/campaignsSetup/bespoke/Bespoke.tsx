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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  IconAsterisk,
  IconCalendar,
  IconPlus,
  IconTrash,
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

type DateRange = { from: Date | null; to: Date | null };

const Bespoke = ({
  buttonText = "Bespoke Campaign",
}: {
  buttonText?: string;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const T = useMantineTheme();
  const {
    state: { filtersOptions },
    setState,
  } = useContext(AppContext);

  const [links, setLinks] = useState<string[]>([""]);
  const {
    data: assetsData,
    isLoading: loadingAssets,
    error: assetsError,
  } = useAssets();
  const { mutate: createBespoke, isPending: creating } =
    useCreateBespokeSelection();

  const form = useForm<{
    title: string;
    description: string;
    notes: string;
    dateRange: DateRange;
    objectives: string[];
    topics: string[];
    selectedAssets: string[];
  }>({
    initialValues: {
      title: "",
      description: "",
      notes: "",
      dateRange: { from: null, to: null },
      objectives: [],
      topics: [],
      selectedAssets: [],
    },
    validate: {
      title: (v) => (!v.trim() ? "Title is required" : null),
      description: (v) => (!v.trim() ? "Description is required" : null),
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
  }, [form]);

  const canSubmit = useMemo(() => form.isValid(), [form]);

  const handleCancel = () => {
    resetForm();
    close();
  };

  const onSubmit = form.onSubmit((values) => {
    const {
      title,
      description,
      notes,
      dateRange,
      objectives,
      topics,
      selectedAssets,
    } = values;
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
          toast.success("Bespoke campaign added to plan");
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
            <Textarea
              withAsterisk
              resize="vertical"
              size="md"
              radius={10}
              label="Description"
              placeholder="Describe your campaign goals and requirements"
              minRows={3}
              autosize
              {...form.getInputProps("description")}
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
