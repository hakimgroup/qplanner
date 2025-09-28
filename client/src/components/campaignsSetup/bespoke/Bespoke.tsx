import StyledButton from "@/components/styledButton/StyledButton";
import {
	ActionIcon,
	Box,
	Button,
	Checkbox,
	Chip,
	Flex,
	Grid,
	Group,
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
import { IconCalendar, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import filtersData from "@/filters.json";
import CampaignDates from "@/components/campaignDates/CampaignDates";
import { isValid as isValidDate } from "date-fns";
import { toast } from "sonner";
import { useCreateBespokeSelection } from "@/hooks/campaign.hooks";
import { SelectionStatus } from "@/shared/shared.models";

type DateRange = { from: Date | null; to: Date | null };

const Bespoke = ({
	buttonText = "Bespoke Campaign",
}: {
	buttonText?: string;
}) => {
	const [opened, { open, close }] = useDisclosure(false);
	const T = useMantineTheme();

	// Reference links are optional per requirements.
	const [links, setLinks] = useState<string[]>([""]);

	const { mutate: createBespoke, isPending: creating } =
		useCreateBespokeSelection();

	const form = useForm<{
		title: string;
		description: string;
		notes: string;
		dateRange: DateRange;
		objectives: string[];
		topics: string[];
		assets: string[];
	}>({
		initialValues: {
			title: "",
			description: "",
			notes: "",
			dateRange: { from: null, to: null },
			objectives: [],
			topics: [],
			assets: [],
		},
		validate: {
			title: (v) => (!v.trim() ? "Title is required" : null),
			description: (v) => (!v.trim() ? "Description is required" : null),
			notes: (v) => (!v.trim() ? "Notes are required" : null),
			dateRange: ({ from, to }) => {
				if (!from || !to) return "Start and end dates are required";
				if (!isValidDate(from) || !isValidDate(to))
					return "Invalid dates";
				if (from > to) return "Start date cannot be after end date";
				return null;
			},
			objectives: (arr) =>
				arr.length === 0 ? "Select at least one objective" : null,
			topics: (arr) =>
				arr.length === 0 ? "Select at least one topic" : null,
			assets: (arr) =>
				arr.length === 0 ? "Select at least one asset" : null,
		},
	});

	// Helpers for optional links UI
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
			assets,
		} = values;
		const { from, to } = dateRange;

		if (!from || !to) {
			toast.error("Please choose a valid start and end date.");
			return;
		}

		// Choose first non-empty link for more_info_link (optional)
		const cleanedLinks = links.map((l) => l.trim()).filter(Boolean);
		const more_info_link = cleanedLinks[0] ?? null;

		// Compose contextual notes (keep user-entered notes prominent)
		const extraParts: string[] = [];
		if (objectives.length)
			extraParts.push(`Objectives: ${objectives.join(", ")}`);
		if (topics.length) extraParts.push(`Topics: ${topics.join(", ")}`);
		if (assets.length) extraParts.push(`Assets: ${assets.join(", ")}`);
		if (cleanedLinks.length > 1)
			extraParts.push(`More links: ${cleanedLinks.slice(1).join(", ")}`);

		const composedNotes =
			notes.trim() +
			(extraParts.length ? `\n\n${extraParts.join("\n")}` : "");

		createBespoke(
			{
				name: title.trim(),
				description: description.trim(),
				from,
				to,
				status: SelectionStatus.OnPlan,
				notes: composedNotes,
				objectives, // string[] -> jsonb via supabase client
				topics,
				more_info_link,
				assets, // jsonb
				reference_links: cleanedLinks,
			},
			{
				onSuccess: () => {
					toast.success("Bespoke campaign added to plan");
					resetForm();
					close();
				},
				onError: (e: any) => {
					toast.error(
						e?.message ?? "Could not create bespoke campaign"
					);
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
							Create a custom campaign tailored to your specific
							needs
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size={"42rem"}
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
							key={form.key("title")}
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
							maxRows={10}
							autosize
							key={form.key("description")}
							{...form.getInputProps("description")}
						/>

						<CampaignDates
							title="Preferred Dates"
							icon={<IconCalendar size={16} />}
							dateRange={form.values.dateRange}
							onChange={(range) =>
								form.setFieldValue("dateRange", range)
							}
							startLabel="Preferred Start Date"
							endLabel="Preferred End Date"
							inputSize="md"
							labelSize="sm"
							titleLabelSize="md"
							hideTitleIcon
						/>
						{form.errors.dateRange && (
							<Text size="xs" c="red.6">
								{form.errors.dateRange as string}
							</Text>
						)}

						<Stack gap={10}>
							<Text size="md" c="gray.9" fw={500}>
								Objectives
							</Text>
							<Chip.Group
								multiple
								value={form.values.objectives}
								onChange={(v) =>
									form.setFieldValue("objectives", v)
								}
							>
								<Group align="center" gap={5}>
									{filtersData.objectives.map((c) => (
										<Chip
											value={c}
											key={c}
											color={"blue.3"}
											size="xs"
											fw={600}
											variant={
												form.values.objectives.includes(
													c
												)
													? "filled"
													: "outline"
											}
										>
											{c}
										</Chip>
									))}
								</Group>
							</Chip.Group>
							{form.errors.objectives && (
								<Text size="xs" c="red.6">
									{form.errors.objectives}
								</Text>
							)}
						</Stack>

						<Stack gap={10}>
							<Text size="md" c="gray.9" fw={500}>
								Categories
							</Text>
							<Chip.Group
								multiple
								value={form.values.topics}
								onChange={(v) =>
									form.setFieldValue("topics", v)
								}
							>
								<Group align="center" gap={5}>
									{filtersData.topics.map((c) => (
										<Chip
											value={c}
											key={c}
											color={"blue.3"}
											size="xs"
											fw={600}
											variant={
												form.values.topics.includes(c)
													? "filled"
													: "outline"
											}
										>
											{c}
										</Chip>
									))}
								</Group>
							</Chip.Group>
							{form.errors.topics && (
								<Text size="xs" c="red.6">
									{form.errors.topics}
								</Text>
							)}
						</Stack>

						<Stack gap={10}>
							<Text size="md" c="gray.9" fw={500}>
								Required Assets
							</Text>
							<Checkbox.Group
								value={form.values.assets}
								onChange={(v) =>
									form.setFieldValue("assets", v)
								}
							>
								<SimpleGrid cols={2} spacing={9} mt="xs">
									{filtersData.assets.map((ct) => (
										<Checkbox
											key={ct}
											radius={50}
											size="xs"
											color="blue.3"
											value={ct}
											label={
												<Text
													size="sm"
													fw={500}
													ml={-5}
													mt={-2}
												>
													{ct}
												</Text>
											}
										/>
									))}
								</SimpleGrid>
							</Checkbox.Group>
							{form.errors.assets && (
								<Text size="xs" c="red.6">
									{form.errors.assets}
								</Text>
							)}
						</Stack>

						<Stack gap={10}>
							<Flex align={"center"} justify={"space-between"}>
								<Text size="md" c="gray.9" fw={500}>
									Reference Links (optional)
								</Text>
								<Box onClick={handleAddLink}>
									<StyledButton
										leftSection={<IconPlus size={14} />}
									>
										Add Link
									</StyledButton>
								</Box>
							</Flex>

							{links.map((link, index) => (
								<Grid key={index} gutter="xs">
									<Grid.Col span={links.length > 1 ? 11 : 12}>
										<TextInput
											w={"100%"}
											radius={10}
											placeholder="https://example.com"
											value={link}
											onChange={({ target: { value } }) =>
												handleChangeLink(index, value)
											}
										/>
									</Grid.Col>
									<Grid.Col span={1}>
										{links.length > 1 && (
											<ActionIcon
												color="red"
												variant="subtle"
												onClick={() =>
													handleRemoveLink(index)
												}
											>
												<IconTrash size={16} />
											</ActionIcon>
										)}
									</Grid.Col>
								</Grid>
							))}
						</Stack>

						<Textarea
							withAsterisk
							resize="vertical"
							radius={10}
							label="Additional Notes"
							placeholder="Any additional requirements or context"
							minRows={3}
							maxRows={10}
							autosize
							key={form.key("notes")}
							{...form.getInputProps("notes")}
						/>

						<Flex justify={"flex-end"} gap={8}>
							<StyledButton onClick={handleCancel}>
								Cancel
							</StyledButton>
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
