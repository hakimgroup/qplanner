import StyledButton from "@/components/styledButton/StyledButton";
import {
	Box,
	Button,
	Checkbox,
	Chip,
	Collapse,
	Flex,
	Group,
	Loader,
	Modal,
	Stack,
	Text,
	Textarea,
	TextInput,
	ThemeIcon,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
	IconPlus,
	IconCalendar,
	IconAsterisk,
	IconBulb,
	IconUsers,
	IconPhoto,
	IconGift,
	IconPalette,
	IconBox,
	IconNotes,
} from "@tabler/icons-react";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { useCallback, useContext, useMemo, useState } from "react";
import CampaignDates from "@/components/campaignDates/CampaignDates";
import { isValid as isValidDate } from "date-fns";
import { toast } from "sonner";
import { startCase } from "lodash";
import { useCreateBespokeSelectionV3 } from "@/hooks/campaign.hooks";
import {
	useBespokeDeliverables,
	uploadBespokeBriefFiles,
} from "@/hooks/bespoke.hooks";
import { UserTabModes } from "@/models/general.models";
import { BespokeBrief, ChosenDeliverable } from "@/models/bespokeBrief.models";
import BespokeDeliverablesPicker from "./BespokeDeliverablesPicker";
import BriefFileUpload from "./BriefFileUpload";
import AppContext from "@/shared/AppContext";
import { updateState } from "@/shared/shared.utilities";
import { useIsMobile } from "@/shared/shared.hooks";

type DateRange = { from: Date | null; to: Date | null };

const emptyNarrative = {
	purpose: "",
	audience_notes: "",
	offers_cta: "",
	look_and_feel: "",
	what_to_avoid: "",
	other_deliverable: "",
};

/** Compose a readable description from the brief for back-compat surfaces. */
function composeDescription(n: typeof emptyNarrative): string {
	const parts: [string, string][] = [
		["Purpose", n.purpose],
		["About the audience", n.audience_notes],
		["Offers / Promotions / CTA", n.offers_cta],
		["Look & feel", n.look_and_feel],
		["What to avoid", n.what_to_avoid],
		["Other deliverable", n.other_deliverable],
	];
	return parts
		.filter(([, v]) => v.trim())
		.map(([label, v]) => `${label}\n${v.trim()}`)
		.join("\n\n");
}

/** Build the existing {printedAssets, digitalAssets} assets shape from picks. */
function buildFinalAssets(chosen: Record<string, ChosenDeliverable>) {
	const toItem = (c: ChosenDeliverable) => ({
		name: c.name,
		group: c.group,
		price: c.price ?? null,
		quantity: c.quantity ?? null,
		suffix: null,
		type: c.price != null ? "card" : "default",
		userSelected: true,
		optionLabel: c.optionLabel ?? null,
	});
	const vals = Object.values(chosen);
	return {
		printedAssets: vals.filter((c) => c.channel === "print").map(toItem),
		digitalAssets: vals.filter((c) => c.channel === "digital").map(toItem),
		externalPlacements: [],
	};
}

function SectionHeader({
	icon,
	title,
	color,
}: {
	icon: React.ReactNode;
	title: string;
	color: string;
}) {
	return (
		<Group gap={8} align="center">
			<ThemeIcon size="sm" radius="xl" variant="light" color={color}>
				{icon}
			</ThemeIcon>
			<Text fw={700} size="sm" c="gray.8">
				{title}
			</Text>
		</Group>
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

	const { data: catalog, isLoading: loadingCatalog } = useBespokeDeliverables();
	const { mutate: createBespoke, isPending: creating } =
		useCreateBespokeSelectionV3();

	// Narrative (brief) text fields
	const [narrative, setNarrative] = useState({ ...emptyNarrative });
	const setField = (k: keyof typeof emptyNarrative, v: string) =>
		setNarrative((prev) => ({ ...prev, [k]: v }));

	// Content & Assets / Design examples — Yes/No + files
	const [hasContent, setHasContent] = useState<boolean | null>(null);
	const [contentFiles, setContentFiles] = useState<File[]>([]);
	const [hasImagery, setHasImagery] = useState<boolean | null>(null);
	const [imageryFiles, setImageryFiles] = useState<File[]>([]);
	const [hasExamples, setHasExamples] = useState<boolean | null>(null);
	const [exampleFiles, setExampleFiles] = useState<File[]>([]);

	// Deliverables
	const [chosen, setChosen] = useState<Record<string, ChosenDeliverable>>({});
	const [showOther, setShowOther] = useState(false);

	// Uploading state (mutation.isPending only covers the RPC, not uploads)
	const [uploading, setUploading] = useState(false);
	const busy = uploading || creating;

	const form = useForm<{
		title: string;
		dateRange: DateRange;
		objectives: string[];
		topics: string[];
		notes: string;
	}>({
		initialValues: {
			title: "",
			dateRange: { from: null, to: null },
			objectives: [],
			topics: [],
			notes: "",
		},
		validate: {
			title: (v) => (!v.trim() ? "Project name is required" : null),
			dateRange: ({ from, to }) => {
				if (!from || !to) return "Start and end dates are required";
				if (!isValidDate(from) || !isValidDate(to)) return "Invalid dates";
				if (from > to) return "Start date cannot be after end date";
				return null;
			},
			objectives: (arr) =>
				arr.length === 0 ? "Select at least one objective" : null,
			topics: (arr) =>
				arr.length === 0 ? "Select at least one category" : null,
		},
	});

	const deliverableCount = Object.keys(chosen).length;
	const hasDeliverable =
		deliverableCount > 0 || narrative.other_deliverable.trim().length > 0;

	const canSubmit = useMemo(
		() =>
			form.isValid() &&
			narrative.purpose.trim().length > 0 &&
			hasDeliverable,
		[form, narrative.purpose, hasDeliverable],
	);

	const resetForm = useCallback(() => {
		form.reset();
		setNarrative({ ...emptyNarrative });
		setHasContent(null);
		setContentFiles([]);
		setHasImagery(null);
		setImageryFiles([]);
		setHasExamples(null);
		setExampleFiles([]);
		setChosen({});
		setShowOther(false);
	}, [form]);

	const handleCancel = () => {
		resetForm();
		close();
	};

	const handleSubmit = async () => {
		const { hasErrors } = form.validate();
		if (hasErrors) return;
		if (!narrative.purpose.trim()) {
			toast.error("Please tell us the purpose of this project.");
			return;
		}
		if (!hasDeliverable) {
			toast.error("Pick at least one deliverable (or describe one under Other).");
			return;
		}
		const { from, to } = form.values.dateRange;
		if (!from || !to) return;

		// 1. Upload any brief files → durable public URLs
		let content_files: BespokeBrief["content_files"] = [];
		let imagery_files: BespokeBrief["imagery_files"] = [];
		let example_files: BespokeBrief["example_files"] = [];
		try {
			setUploading(true);
			[content_files, imagery_files, example_files] = await Promise.all([
				hasContent && contentFiles.length
					? uploadBespokeBriefFiles(contentFiles)
					: Promise.resolve([]),
				hasImagery && imageryFiles.length
					? uploadBespokeBriefFiles(imageryFiles)
					: Promise.resolve([]),
				hasExamples && exampleFiles.length
					? uploadBespokeBriefFiles(exampleFiles)
					: Promise.resolve([]),
			]);
		} catch (e: any) {
			setUploading(false);
			toast.error(e?.message ?? "File upload failed. Please try again.");
			return;
		}
		setUploading(false);

		// 2. Assemble the structured brief + back-compat description + assets
		const brief: BespokeBrief = {
			purpose: narrative.purpose.trim() || undefined,
			audience_notes: narrative.audience_notes.trim() || undefined,
			offers_cta: narrative.offers_cta.trim() || undefined,
			look_and_feel: narrative.look_and_feel.trim() || undefined,
			what_to_avoid: narrative.what_to_avoid.trim() || undefined,
			other_deliverable: narrative.other_deliverable.trim() || undefined,
			has_content: hasContent ?? false,
			content_files,
			has_imagery: hasImagery ?? false,
			imagery_files,
			has_examples: hasExamples ?? false,
			example_files,
		};
		const finalAssets = buildFinalAssets(chosen);

		createBespoke(
			{
				name: form.values.title.trim(),
				description: composeDescription(narrative),
				from,
				to,
				notes: form.values.notes || null,
				objectives: form.values.objectives,
				topics: form.values.topics,
				assets: finalAssets,
				reference_links: [],
				selectedAssets: finalAssets,
				brief,
			},
			{
				onSuccess: () => {
					resetForm();
					close();
					updateState(
						setState,
						"filters.userSelectedTab",
						UserTabModes.Selected,
					);
				},
				onError: (e: any) => {
					toast.error(e?.message ?? "Could not create bespoke campaign");
				},
			},
		);
	};

	const maxDate = new Date(new Date().getFullYear() + 2, 11, 31);
	const minDate = (() => {
		const d = new Date();
		d.setDate(d.getDate() + 30);
		return d;
	})();

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
						<Flex align="center" gap={10}>
							<IconPlus color={T.colors.blue[3]} size={21} />
							<Text fz="h4" fw={600}>
								Create Bespoke Campaign
							</Text>
						</Flex>
						<Text size="sm" c="gray.6">
							Submit a custom campaign brief — our design team picks it up
							straight away.
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size="44rem"
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<Stack gap={22}>
					{/* Project name */}
					<TextInput
						withAsterisk
						radius={10}
						size="md"
						label="What is the name of this project?"
						placeholder="e.g. Local Homes Drop"
						{...form.getInputProps("title")}
					/>

					{/* Background */}
					<Stack gap={12}>
						<SectionHeader
							icon={<IconBulb size={14} />}
							title="Background"
							color="blue"
						/>
						<Textarea
							radius={10}
							autosize
							minRows={2}
							withAsterisk
							label="What is the purpose of this project?"
							placeholder="e.g. To increase brand awareness in the local area and inform those who have just moved onto new build estates that we are a trusted, local, independent optician."
							value={narrative.purpose}
							onChange={(e) => setField("purpose", e.currentTarget.value)}
						/>
					</Stack>

					{/* Who is the Audience? */}
					<Stack gap={12}>
						<SectionHeader
							icon={<IconUsers size={14} />}
							title="Who is the Audience?"
							color="teal"
						/>
						<Textarea
							radius={10}
							autosize
							minRows={2}
							label="Is there anything important we should know about this audience?"
							placeholder="e.g. The audience is non-patients in our local area. The area is very affluent and high-end; the estate has an entry house price of £750k."
							value={narrative.audience_notes}
							onChange={(e) =>
								setField("audience_notes", e.currentTarget.value)
							}
						/>
					</Stack>

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
									{filtersOptions?.objectives.map((c) => (
										<Chip
											value={c}
											key={c}
											color="blue.3"
											size="xs"
											fw={600}
											variant={
												form.values.objectives.includes(c)
													? "filled"
													: "outline"
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
									{filtersOptions?.topics.map((c) => (
										<Chip
											value={c}
											key={c}
											color="blue.3"
											size="xs"
											fw={600}
											variant={
												form.values.topics.includes(c)
													? "filled"
													: "outline"
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

					{/* Content & Assets */}
					<Stack gap={14}>
						<SectionHeader
							icon={<IconPhoto size={14} />}
							title="Content & Assets"
							color="grape"
						/>
						<BriefFileUpload
							question="Do you already have content written for this project?"
							has={hasContent}
							onHasChange={setHasContent}
							files={contentFiles}
							onFilesChange={setContentFiles}
							disabled={busy}
						/>
						<BriefFileUpload
							question="Do you already have imagery for this project?"
							has={hasImagery}
							onHasChange={setHasImagery}
							files={imageryFiles}
							onFilesChange={setImageryFiles}
							disabled={busy}
						/>
					</Stack>

					<GradientDivider />

					{/* Offers, Promotions & CTA */}
					<Stack gap={12}>
						<SectionHeader
							icon={<IconGift size={14} />}
							title="Offers, Promotions & Call-to-Action"
							color="teal"
						/>
						<Textarea
							radius={10}
							autosize
							minRows={2}
							label="Would you like to include any offers, promotions, or calls-to-action?"
							placeholder="e.g. I would like to offer 10% off for new patients, I'd also like to invite patients to book an appointment by scanning a QR code."
							value={narrative.offers_cta}
							onChange={(e) => setField("offers_cta", e.currentTarget.value)}
						/>
					</Stack>

					<GradientDivider />

					{/* Design & Style */}
					<Stack gap={14}>
						<SectionHeader
							icon={<IconPalette size={14} />}
							title="Design & Style"
							color="pink"
						/>
						<Textarea
							radius={10}
							autosize
							minRows={2}
							label="How should this look and feel?"
							placeholder="e.g. High-end and uncluttered. We want to target affluent patients, so we'd like to show the technology in the practice as well as some of the designer brands we have available. We don't want too many words; we'd like to rely more on the practice imagery provided."
							value={narrative.look_and_feel}
							onChange={(e) =>
								setField("look_and_feel", e.currentTarget.value)
							}
						/>
						<BriefFileUpload
							question="Are there any existing designs or examples we should refer to?"
							has={hasExamples}
							onHasChange={setHasExamples}
							files={exampleFiles}
							onFilesChange={setExampleFiles}
							disabled={busy}
						/>
						<Textarea
							radius={10}
							autosize
							minRows={2}
							label="What should be avoided?"
							placeholder="e.g. I'd like to avoid using too much written content."
							value={narrative.what_to_avoid}
							onChange={(e) =>
								setField("what_to_avoid", e.currentTarget.value)
							}
						/>
					</Stack>

					<GradientDivider />

					{/* Deliverables */}
					<Stack gap={12}>
						<Group gap={3} align="center">
							<SectionHeader
								icon={<IconBox size={14} />}
								title="Deliverables"
								color="indigo"
							/>
							<IconAsterisk size={8} color="red" />
						</Group>
						<Text size="xs" c="gray.5" mt={-6}>
							What assets do you need for this project?
						</Text>

						{loadingCatalog ? (
							<Loader size="sm" color="blue" />
						) : (
							<BespokeDeliverablesPicker
								catalog={catalog ?? []}
								value={chosen}
								onChange={setChosen}
								disabled={busy}
							/>
						)}

						<Box>
							<Checkbox
								size="xs"
								radius="sm"
								color="blue.5"
								disabled={busy}
								checked={showOther}
								onChange={(e) => {
									const on = e.currentTarget.checked;
									setShowOther(on);
									if (!on) setField("other_deliverable", "");
								}}
								label={
									<Text size="sm" fw={500} c="gray.7">
										Other
									</Text>
								}
							/>
							<Collapse in={showOther}>
								<Textarea
									mt={8}
									radius={10}
									autosize
									minRows={2}
									label="If you have selected other, please specify:"
									placeholder="e.g. We would like an accompanying advert for our local magazine, they need 185mm x 130mm with a 3mm bleed."
									value={narrative.other_deliverable}
									onChange={(e) =>
										setField("other_deliverable", e.currentTarget.value)
									}
								/>
							</Collapse>
						</Box>
					</Stack>

					<GradientDivider />

					{/* Preferred Dates */}
					<CampaignDates
						required
						minDate={minDate}
						maxDate={maxDate}
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
							{form.errors.dateRange as string}
						</Text>
					)}

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
							label="Any additional requirements or context?"
							placeholder="e.g. We have recently chosen our new rebrand option, could we please have this in our new branding ready for launch."
							{...form.getInputProps("notes")}
						/>
					</Stack>

					<Flex justify="flex-end" gap={8}>
						<StyledButton onClick={handleCancel} disabled={busy}>
							Cancel
						</StyledButton>
						<Button
							radius={10}
							color="blue.5"
							loading={busy}
							disabled={!canSubmit}
							leftSection={<IconPlus size={14} />}
							onClick={handleSubmit}
						>
							Submit Campaign
						</Button>
					</Flex>
				</Stack>
			</Modal>
		</>
	);
};

export default Bespoke;
