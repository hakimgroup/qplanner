import StyledButton from "@/components/styledButton/StyledButton";
import {
	Alert,
	Box,
	Button,
	Checkbox,
	Chip,
	Collapse,
	Flex,
	Group,
	Loader,
	Modal,
	NumberInput,
	SegmentedControl,
	Stack,
	Text,
	Textarea,
	TextInput,
	ThemeIcon,
	useMantineTheme,
} from "@mantine/core";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
	IconPlus,
	IconCalendar,
	IconAsterisk,
	IconSparkles,
	IconBuildingStore,
	IconDiscount2,
	IconConfetti,
	IconBox,
	IconSpeakerphone,
	IconNotes,
} from "@tabler/icons-react";
import { useCallback, useContext, useMemo, useState } from "react";
import { isValid as isValidDate } from "date-fns";
import { toast } from "sonner";
import { startCase } from "lodash";
import { useCreateBespokeEventV3 } from "@/hooks/campaign.hooks";
import { useEventDeliverables } from "@/hooks/bespoke.hooks";
import { UserTabModes } from "@/models/general.models";
import {
	BespokeBrief,
	ChosenEventDeliverable,
	DateSlot,
} from "@/models/bespokeBrief.models";
import EventDateSlots from "./EventDateSlots";
import EventDeliverablesPicker from "./EventDeliverablesPicker";
import AppContext from "@/shared/AppContext";
import { updateState } from "@/shared/shared.utilities";
import { useIsMobile } from "@/shared/shared.hooks";

const emptyNarrative = {
	theme: "",
	brands: "",
	discounts: "",
	on_the_day: "",
	requirements: "",
	notes: "",
};

/** Compose a readable description from the event brief for back-compat. */
function composeDescription(n: typeof emptyNarrative, pr: boolean | null): string {
	const parts: [string, string][] = [
		["Theme", n.theme],
		["Brands", n.brands],
		["Exclusive discounts", n.discounts],
		["On the day", n.on_the_day],
		["PR", pr === null ? "" : pr ? "Yes" : "No"],
	];
	return parts
		.filter(([, v]) => v.trim())
		.map(([label, v]) => `${label}\n${v.trim()}`)
		.join("\n\n");
}

function buildEventAssets(
	chosen: Record<string, ChosenEventDeliverable>,
	other: { on: boolean; text: string; qty: number },
) {
	// Tick items (digital / direct comms) carry quantity 1 so the existing
	// quantity-based renderers (admin review, email, plan detail) show them.
	// The `group` field is preserved for richer future rendering.
	const mk = (c: ChosenEventDeliverable) => ({
		name: c.name,
		group: c.group,
		quantity: c.input_mode === "quantity" ? (c.quantity ?? 1) : 1,
		suffix: null,
		type: "default",
		userSelected: true,
	});
	const vals = Object.values(chosen);
	const printed = vals.filter((c) => c.channel === "print").map(mk);
	if (other.on && other.text.trim()) {
		printed.push({
			name: "Other",
			group: "Other",
			quantity: other.qty,
			suffix: null,
			type: "default",
			userSelected: true,
			note: other.text.trim(),
		} as any);
	}
	// Digital + Direct Communications both render under Digital Assets.
	const digital = vals
		.filter((c) => c.channel === "digital" || c.channel === "direct_comms")
		.map(mk);
	return {
		printedAssets: printed,
		digitalAssets: digital,
		externalPlacements: [],
	};
}

function SectionHeader({
	icon,
	title,
	color,
	required,
}: {
	icon: React.ReactNode;
	title: string;
	color: string;
	required?: boolean;
}) {
	return (
		<Group gap={8} align="center">
			<ThemeIcon size="sm" radius="xl" variant="light" color={color}>
				{icon}
			</ThemeIcon>
			<Text fw={700} size="sm" c="gray.8">
				{title}
			</Text>
			{required && <IconAsterisk size={8} color="red" />}
		</Group>
	);
}

const Event = ({ buttonText = "Event" }) => {
	const {
		state: { filtersOptions },
		setState,
	} = useContext(AppContext);
	const [opened, { open, close }] = useDisclosure(false);
	const T = useMantineTheme();
	const isMobile = useIsMobile();

	const { data: catalog, isLoading: loadingCatalog } = useEventDeliverables();
	const { mutate: createEvent, isPending: creating } =
		useCreateBespokeEventV3();

	const [narrative, setNarrative] = useState({ ...emptyNarrative });
	const setField = (k: keyof typeof emptyNarrative, v: string) =>
		setNarrative((prev) => ({ ...prev, [k]: v }));

	const [slots, setSlots] = useState<DateSlot[]>([{ date: "", start: "", end: "" }]);
	const [chosen, setChosen] = useState<Record<string, ChosenEventDeliverable>>({});
	const [showOther, setShowOther] = useState(false);
	const [otherText, setOtherText] = useState("");
	const [otherQty, setOtherQty] = useState<number>(1);
	const [pr, setPr] = useState<boolean | null>(null);

	const form = useForm<{
		title: string;
		objectives: string[];
		topics: string[];
	}>({
		initialValues: { title: "", objectives: [], topics: [] },
		validate: {
			title: (v) => (!v.trim() ? "Event name is required" : null),
			objectives: (a) => (a.length === 0 ? "Select at least one objective" : null),
			topics: (a) => (a.length === 0 ? "Select at least one category" : null),
		},
	});

	const validSlots = useMemo(
		() =>
			slots.filter(
				(s) => s.date && s.start && s.end && isValidDate(new Date(s.date)),
			),
		[slots],
	);
	const { fromDate, toDate } = useMemo(() => {
		const times = validSlots.map((s) => +new Date(s.date));
		if (!times.length) return { fromDate: null as Date | null, toDate: null as Date | null };
		return { fromDate: new Date(Math.min(...times)), toDate: new Date(Math.max(...times)) };
	}, [validSlots]);

	const deliverableCount = Object.keys(chosen).length;
	const hasDeliverable =
		deliverableCount > 0 || (showOther && otherText.trim().length > 0);

	const canSubmit =
		form.isValid() && validSlots.length > 0 && hasDeliverable && !creating;

	const resetForm = useCallback(() => {
		form.reset();
		setNarrative({ ...emptyNarrative });
		setSlots([{ date: "", start: "", end: "" }]);
		setChosen({});
		setShowOther(false);
		setOtherText("");
		setOtherQty(1);
		setPr(null);
	}, [form]);

	const handleCancel = () => {
		resetForm();
		close();
	};

	const minDate = (() => {
		const d = new Date();
		d.setDate(d.getDate() + 30);
		return d;
	})();
	const maxDate = new Date(new Date().getFullYear() + 2, 11, 31);

	const handleSubmit = () => {
		const { hasErrors } = form.validate();
		if (hasErrors) return;
		if (validSlots.length === 0) {
			toast.error("Add at least one date with a start and end time.");
			return;
		}
		if (!hasDeliverable) {
			toast.error("Pick at least one deliverable (or describe one under Other).");
			return;
		}
		if (!fromDate || !toDate) return;

		const brief: BespokeBrief = {
			theme: narrative.theme.trim() || undefined,
			brands: narrative.brands.trim() || undefined,
			discounts: narrative.discounts.trim() || undefined,
			on_the_day: narrative.on_the_day.trim() || undefined,
			date_slots: validSlots,
			pr: pr ?? undefined,
			other_deliverable:
				showOther && otherText.trim() ? otherText.trim() : undefined,
		};
		const assets = buildEventAssets(chosen, {
			on: showOther,
			text: otherText,
			qty: otherQty,
		});

		createEvent(
			{
				eventType: narrative.theme.trim(),
				title: form.values.title.trim(),
				description: composeDescription(narrative, pr),
				eventFromDate: fromDate,
				eventToDate: toDate,
				objectives: form.values.objectives,
				topics: form.values.topics,
				assets,
				selectedAssets: assets,
				requirements: narrative.requirements.trim() || null,
				notes: narrative.notes.trim() || null,
				links: [],
				brief,
			},
			{
				onSuccess: () => {
					resetForm();
					close();
					updateState(setState, "filters.userSelectedTab", UserTabModes.Selected);
				},
				onError: (e: any) => {
					toast.error(e?.message ?? "Failed to create event");
				},
			},
		);
	};

	return (
		<>
			<StyledButton fw={500} leftSection={<IconPlus size={14} />} onClick={open}>
				{buttonText}
			</StyledButton>

			<Modal
				fullScreen={isMobile}
				opened={opened}
				onClose={close}
				title={
					<Stack gap={0}>
						<Flex align="center" gap={10}>
							<IconCalendar color={T.colors.blue[3]} size={21} />
							<Text fz="h4" fw={600}>
								Create Event
							</Text>
						</Flex>
						<Text size="sm" c="gray.6">
							Submit an event brief — our design team picks it up straight away.
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size="44rem"
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<Stack gap={22}>
					{/* Event name */}
					<TextInput
						withAsterisk
						radius={10}
						size="md"
						label="What is the name of this event?"
						placeholder="e.g. 20th Anniversary Celebration"
						{...form.getInputProps("title")}
					/>

					{/* Dates & times */}
					<EventDateSlots
						slots={slots}
						onChange={setSlots}
						minDate={minDate}
						maxDate={maxDate}
						disabled={creating}
					/>

					<GradientDivider />

					{/* Theme */}
					<Stack gap={10}>
						<SectionHeader
							icon={<IconSparkles size={14} />}
							title="Do you have a theme?"
							color="violet"
						/>
						<TextInput
							radius={10}
							placeholder="e.g. anniversary, practice milestone, brand showcase, Clinical, Other"
							value={narrative.theme}
							onChange={(e) => setField("theme", e.currentTarget.value)}
						/>
					</Stack>

					{/* Brands */}
					<Stack gap={10}>
						<SectionHeader
							icon={<IconBuildingStore size={14} />}
							title="If you are working with brands, let us know which ones!"
							color="teal"
						/>
						<Text size="xs" c="gray.5" mt={-6}>
							Please ensure that this is confirmed with your brand rep.
						</Text>
						<TextInput
							radius={10}
							placeholder="e.g. Maui Jim, Oakley, Tom Ford"
							value={narrative.brands}
							onChange={(e) => setField("brands", e.currentTarget.value)}
						/>
					</Stack>

					{/* Discounts */}
					<Stack gap={10}>
						<SectionHeader
							icon={<IconDiscount2 size={14} />}
							title="Will there be any exclusive discounts?"
							color="grape"
						/>
						<Text size="xs" c="gray.5" mt={-6}>
							If you're unsure, write what you think it will be.
						</Text>
						<TextInput
							radius={10}
							placeholder="e.g. 20% off prescription sunglasses"
							value={narrative.discounts}
							onChange={(e) => setField("discounts", e.currentTarget.value)}
						/>
					</Stack>

					{/* On the day */}
					<Stack gap={10}>
						<SectionHeader
							icon={<IconConfetti size={14} />}
							title="What will you be doing on the day?"
							color="orange"
						/>
						<Textarea
							radius={10}
							autosize
							minRows={2}
							placeholder="e.g. refreshments, raffle, balloons, goody bags, snacks"
							value={narrative.on_the_day}
							onChange={(e) => setField("on_the_day", e.currentTarget.value)}
						/>
						<Alert color="gray" variant="light" radius="md" p="sm">
							<Text size="xs" c="gray.7">
								We're unfortunately unable to help with sourcing things such as
								balloons, merchandise, or partnerships with local
								businesses/charities. We'll support you the best we can, but
								setting these up is the practice's responsibility.
							</Text>
						</Alert>
					</Stack>

					<GradientDivider />

					{/* Objectives + Categories (kept) */}
					<Stack gap={14}>
						<Stack gap={8}>
							<Group gap={3}>
								<Text size="sm" fw={500} c="gray.8">
									Objectives
								</Text>
								<IconAsterisk size={8} color="red" />
							</Group>
							<Chip.Group
								multiple
								value={form.values.objectives}
								onChange={(v) => form.setFieldValue("objectives", v)}
							>
								<Group gap={5}>
									{filtersOptions?.objectives.map((c: string) => (
										<Chip
											value={c}
											key={c}
											color="blue.3"
											size="xs"
											fw={600}
											variant={
												form.values.objectives.includes(c) ? "filled" : "outline"
											}
										>
											{startCase(c)}
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

						<Stack gap={8}>
							<Group gap={3}>
								<Text size="sm" fw={500} c="gray.8">
									Categories
								</Text>
								<IconAsterisk size={8} color="red" />
							</Group>
							<Chip.Group
								multiple
								value={form.values.topics}
								onChange={(v) => form.setFieldValue("topics", v)}
							>
								<Group gap={5}>
									{filtersOptions?.topics.map((c: string) => (
										<Chip
											value={c}
											key={c}
											color="blue.3"
											size="xs"
											fw={600}
											variant={
												form.values.topics.includes(c) ? "filled" : "outline"
											}
										>
											{startCase(c)}
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
					</Stack>

					<GradientDivider />

					{/* Deliverables */}
					<Stack gap={12}>
						<SectionHeader
							icon={<IconBox size={14} />}
							title="Deliverables"
							color="indigo"
							required
						/>
						{loadingCatalog ? (
							<Loader size="sm" color="blue" />
						) : (
							<EventDeliverablesPicker
								catalog={catalog ?? []}
								value={chosen}
								onChange={setChosen}
								disabled={creating}
							/>
						)}

						{/* Printed "Other" */}
						<Box>
							<Checkbox
								size="xs"
								radius="sm"
								color="blue.5"
								disabled={creating}
								checked={showOther}
								onChange={(e) => {
									const on = e.currentTarget.checked;
									setShowOther(on);
									if (!on) {
										setOtherText("");
										setOtherQty(1);
									}
								}}
								label={
									<Text size="sm" fw={500} c="gray.7">
										Other (printed)
									</Text>
								}
							/>
							<Collapse in={showOther}>
								<Group align="flex-end" gap={8} mt={8}>
									<TextInput
										flex={1}
										radius={10}
										label="Please specify"
										placeholder="e.g. A6 flyer, table talkers…"
										value={otherText}
										onChange={(e) => setOtherText(e.currentTarget.value)}
									/>
									<NumberInput
										radius={10}
										w={100}
										min={1}
										label="Qty"
										value={otherQty}
										onChange={(v) => setOtherQty(typeof v === "number" ? v : 1)}
									/>
								</Group>
							</Collapse>
						</Box>
					</Stack>

					<GradientDivider />

					{/* PR */}
					<Stack gap={8}>
						<SectionHeader
							icon={<IconSpeakerphone size={14} />}
							title="Would you like some PR surrounding your event?"
							color="pink"
						/>
						<Text size="xs" c="gray.5" mt={-4}>
							This typically only applies to practice milestone events.
						</Text>
						<SegmentedControl
							w={140}
							size="xs"
							value={pr === null ? "" : pr ? "yes" : "no"}
							onChange={(v) => setPr(v === "yes")}
							data={[
								{ label: "Yes", value: "yes" },
								{ label: "No", value: "no" },
							]}
						/>
					</Stack>

					{/* Special Requirements */}
					<Textarea
						radius={10}
						autosize
						minRows={2}
						label="Special Requirements"
						placeholder="Any special requirements for this event"
						value={narrative.requirements}
						onChange={(e) => setField("requirements", e.currentTarget.value)}
					/>

					{/* Additional Notes */}
					<Stack gap={10}>
						<SectionHeader
							icon={<IconNotes size={14} />}
							title="Additional Notes"
							color="gray"
						/>
						<Textarea
							radius={10}
							autosize
							minRows={2}
							placeholder="Any additional requirements or context"
							value={narrative.notes}
							onChange={(e) => setField("notes", e.currentTarget.value)}
						/>
					</Stack>

					<Flex justify="flex-end" gap={8}>
						<StyledButton onClick={handleCancel} disabled={creating}>
							Cancel
						</StyledButton>
						<Button
							radius={10}
							color="blue.5"
							loading={creating}
							disabled={!canSubmit}
							leftSection={<IconPlus size={14} />}
							onClick={handleSubmit}
						>
							Submit Event
						</Button>
					</Flex>
				</Stack>
			</Modal>
		</>
	);
};

export default Event;
