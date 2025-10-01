import StyledButton from "@/components/styledButton/StyledButton";
import {
	Flex,
	Modal,
	Stack,
	useMantineTheme,
	Text,
	Checkbox,
	SimpleGrid,
	Textarea,
	TextInput,
	Chip,
	Group,
	ActionIcon,
	Box,
	Grid,
	Button,
	Radio,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendar, IconPlus, IconTrash } from "@tabler/icons-react";
import filtersData from "@/filters.json";
import { useState, useMemo, useContext } from "react";
import { useForm } from "@mantine/form";
import { toast } from "sonner";
import { useCreateBespokeEvent } from "@/hooks/campaign.hooks";
import CampaignDates from "@/components/campaignDates/CampaignDates";
import { UserTabModes } from "@/models/general.models";
import AppContext from "@/shared/AppContext";
import { updateState } from "@/shared/shared.utilities";

type FormValues = {
	eventType: string;
	title: string;
	description: string;
	dateRange: { from: Date | null; to: Date | null }; // ← range instead of single date
	objectives: string[];
	topics: string[];
	assets: string[];
	requirements: string;
	notes: string;
};

const initialValues: FormValues = {
	eventType: "",
	title: "",
	description: "",
	dateRange: { from: null, to: null }, // ← init range
	objectives: [],
	topics: [],
	assets: [],
	requirements: "",
	notes: "",
};

const urlish = (s: string) =>
	/^https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,10}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(
		s.trim()
	);

const Event = ({ buttonText = "Bespoke Event" }) => {
	const { setState } = useContext(AppContext);
	const [opened, { open, close }] = useDisclosure(false);
	const T = useMantineTheme();
	const [links, setLinks] = useState<string[]>([""]);

	const form = useForm<FormValues>({
		initialValues,
		validateInputOnBlur: true,
		validate: {
			eventType: (v) => (!!v?.trim() ? null : "Event type is required"),
			title: (v) => (!!v?.trim() ? null : "Event title is required"),
			description: (v) =>
				!!v?.trim() ? null : "Event description is required",
			dateRange: ({ from, to }) =>
				from instanceof Date &&
				!isNaN(+from) &&
				to instanceof Date &&
				!isNaN(+to) &&
				+from <= +to
					? null
					: "Valid start and end dates are required",
			objectives: (arr) =>
				Array.isArray(arr) && arr.length > 0
					? null
					: "Select at least one objective",
			topics: (arr) =>
				Array.isArray(arr) && arr.length > 0
					? null
					: "Select at least one category",
			assets: (arr) =>
				Array.isArray(arr) && arr.length > 0
					? null
					: "Select at least one asset",
		},
	});

	const { mutate: createEvent, isPending: creating } =
		useCreateBespokeEvent();

	const handleReset = () => {
		form.reset();
		setLinks([""]);
	};

	const handleChangeLink = (index: number, value: string) => {
		const updated = [...links];
		updated[index] = value;
		setLinks(updated);
	};
	const handleAddLink = () => setLinks((l) => [...l, ""]);
	const handleRemoveLink = (index: number) =>
		setLinks((l) => l.filter((_, i) => i !== index));

	const handleCancel = () => {
		handleReset();
		close();
	};

	const cleanedLinks = useMemo(
		() => links.map((l) => l.trim()).filter(Boolean),
		[links]
	);

	const invalidLink = useMemo(() => {
		const bad = cleanedLinks.find((l) => !urlish(l));
		return !!bad ? "One or more links are invalid" : null;
	}, [cleanedLinks]);

	const handleSubmit = form.onSubmit((values) => {
		if (invalidLink) {
			toast.error(invalidLink);
			return;
		}

		const extra: string[] = [];
		if (cleanedLinks.length)
			extra.push(`Links:\n${cleanedLinks.join("\n")}`);
		const composedNotes = [values.notes.trim(), ...extra]
			.filter(Boolean)
			.join("\n\n");

		createEvent(
			{
				eventType: values.eventType,
				title: values.title,
				description: values.description,
				eventFromDate: values.dateRange.from as Date,
				eventToDate: values.dateRange.to as Date,
				objectives: values.objectives,
				topics: values.topics,
				assets: values.assets,
				requirements: values.requirements || null,
				notes: composedNotes,
				links: cleanedLinks,
			},
			{
				onSuccess: () => {
					toast.success("Event created");
					handleReset();
					close();
					updateState(
						setState,
						"filters.userSelectedTab",
						UserTabModes.Selected
					);
				},
				onError: (e) => {
					toast.error(e?.message ?? "Failed to create event");
				},
			}
		);
	});

	const requiredFilled =
		!!form.values.eventType?.trim() &&
		!!form.values.title?.trim() &&
		!!form.values.description?.trim() &&
		form.values.dateRange.from instanceof Date &&
		!isNaN(+form.values.dateRange.from!) &&
		form.values.dateRange.to instanceof Date &&
		!isNaN(+form.values.dateRange.to!) &&
		+form.values.dateRange.from! <= +form.values.dateRange.to! &&
		form.values.objectives.length > 0 &&
		form.values.topics.length > 0 &&
		form.values.assets.length > 0;

	const canSubmit = requiredFilled && !creating;

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
							<IconCalendar color={T.colors.blue[3]} size={21} />
							<Text fz={"h4"} fw={600}>
								Create Bespoke Event
							</Text>
						</Flex>
						<Text size="sm" c="gray.6">
							Create an event campaign tailored to your specific
							occasion.
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size={"42rem"}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<form onSubmit={handleSubmit}>
					<Stack gap={25}>
						{/* Event Type */}
						<Stack gap={0}>
							<Text size="md" c="gray.9" fw={500}>
								Event Type
							</Text>

							<Radio.Group
								withAsterisk
								{...form.getInputProps("eventType")}
								value={form.values.eventType}
								onChange={(v) =>
									form.setFieldValue("eventType", v)
								}
							>
								<SimpleGrid cols={2} spacing={9} mt="xs">
									{filtersData.eventTypes.map(
										(ev: string) => (
											<Radio
												size="xs"
												color="blue.3"
												key={ev}
												value={ev}
												label={
													<Text
														size="sm"
														fw={500}
														ml={-5}
														mt={-2}
													>
														{ev}
													</Text>
												}
											/>
										)
									)}
								</SimpleGrid>
							</Radio.Group>
							{form.errors.eventType && (
								<Text size="xs" c="red.6" mt={6}>
									{form.errors.eventType}
								</Text>
							)}
						</Stack>

						<TextInput
							withAsterisk
							radius={10}
							label="Event Title"
							placeholder="Enter event title"
							{...form.getInputProps("title")}
						/>

						<Textarea
							withAsterisk
							resize="vertical"
							radius={10}
							label="Event Description"
							placeholder="Describe your event goals and requirements"
							minRows={3}
							maxRows={10}
							autosize
							{...form.getInputProps("description")}
						/>

						{/* Date Range */}
						<Stack gap={10}>
							<Text size="md" c="gray.9" fw={500}>
								Event Dates
							</Text>

							<CampaignDates
								icon={<IconCalendar size={16} />}
								dateRange={form.values.dateRange}
								onChange={(range) =>
									form.setFieldValue("dateRange", range)
								}
								startLabel="Start Date"
								endLabel="End Date"
								inputSize="md"
								labelSize="sm"
								titleLabelSize="sm"
								hideTitleIcon
							/>
							{form.errors.dateRange && (
								<Text size="xs" c="red.6" mt={6}>
									{form.errors.dateRange as any}
								</Text>
							)}
						</Stack>

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
									{filtersData.objectives.map((c: string) => (
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
								<Text size="xs" c="red.6" mt={6}>
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
									{filtersData.topics.map((c: string) => (
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
								<Text size="xs" c="red.6" mt={6}>
									{form.errors.topics}
								</Text>
							)}
						</Stack>

						<Stack gap={0}>
							<Text size="md" c="gray.9" fw={500}>
								Required Assets
							</Text>
							<Checkbox.Group
								value={form.values.assets}
								onChange={(v) =>
									form.setFieldValue("assets", v)
								}
								error={form.errors.assets}
							>
								<SimpleGrid cols={2} spacing={9} mt="xs">
									{filtersData.eventAssets.map(
										(ct: string) => (
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
										)
									)}
								</SimpleGrid>
							</Checkbox.Group>
						</Stack>

						<Textarea
							resize="vertical"
							radius={10}
							label="Special Requirements"
							placeholder="Any special requirements for this event (venue considerations, timing, audience, etc.)"
							minRows={3}
							maxRows={10}
							autosize
							{...form.getInputProps("requirements")}
						/>

						<Stack gap={10}>
							<Flex align={"center"} justify={"space-between"}>
								<Text size="md" c="gray.9" fw={500}>
									Reference Links
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
											error={
												invalidLink &&
												link.trim() &&
												!urlish(link)
													? "Invalid URL"
													: null
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
							resize="vertical"
							radius={10}
							label="Additional Notes"
							placeholder="Any additional requirements or context"
							minRows={3}
							maxRows={10}
							autosize
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
								Create Event
							</Button>
						</Flex>
					</Stack>
				</form>
			</Modal>
		</>
	);
};

export default Event;
