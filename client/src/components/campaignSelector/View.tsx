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
	Image,
	Modal,
	SimpleGrid,
	useMantineTheme,
	Collapse,
	ThemeIcon,
	Anchor,
	Paper,
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
	IconPhoto,
	IconArrowsMaximize,
	IconBrush,
	IconPackage,
	IconNote,
	IconExternalLink,
	IconPrinter,
	IconCheck,
	IconLink,
} from "@tabler/icons-react";
import { useContext, useMemo, useRef, useState } from "react";
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
import { useSelectionNotifications } from "@/hooks/notification.hooks";
import { SelectionsSource, SelectionStatus } from "@/shared/shared.models";
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

/** Standout section showing all details added during the selection lifecycle,
 *  sourced from notification payloads (the richest data source). */
function LifecycleDetails({ campaign: c }: { campaign: Campaign }) {
	const T = useMantineTheme();
	const { data: notifications = [] } = useSelectionNotifications(c.selection_id);

	// Merge all payloads — later notifications override earlier ones for shared keys
	const merged = useMemo(() => {
		const m: Record<string, any> = {};
		for (const n of notifications) {
			if (!n.payload) continue;
			Object.entries(n.payload).forEach(([k, v]) => {
				if (v !== null && v !== undefined && v !== "") m[k] = v;
			});
		}
		return m;
	}, [notifications]);

	// Get specific notification types for stage-specific data
	const feedbackNtfs = useMemo(
		() => notifications.filter((n) => n.type === "feedbackRequested"),
		[notifications],
	);
	const submissionNtf = useMemo(
		() => notifications.find((n) => n.type === "inProgress"),
		[notifications],
	);

	// === Data from notification payloads ===
	const chosenCreativeUrl =
		(submissionNtf?.payload?.chosen_creative as string) ||
		(merged.chosen_creative as string) ||
		undefined;
	const creativeAnswer = (c.assets as any)?.creative_answer as string | undefined;
	const allCreatives = (merged.creatives ?? []) as { url?: string; label?: string }[];
	const tier = merged.tier as string | undefined;
	const eventType = merged.event_type as string | undefined;

	// Submission note (from inProgress — what the practice wrote when submitting)
	const submissionNote = submissionNtf?.payload?.note as string | undefined;
	// Original notes (from when campaign was added to plan)
	const originalNotes = merged.original_notes as string | undefined;
	// Requirements (bespoke only)
	const requirements = merged.requirements as string | undefined;
	// Reference links from payloads
	const referenceLinks = (merged.reference_links ?? []) as string[];
	// Links
	const markupLink = merged.markup_link as string | undefined;
	const assetsLink = merged.assets_link as string | undefined;

	// Find label for the chosen creative from the creatives array
	const chosenCreativeLabel = useMemo(() => {
		if (!chosenCreativeUrl) return null;
		const match = allCreatives.find((cr) => cr.url === chosenCreativeUrl);
		return match?.label ?? null;
	}, [chosenCreativeUrl, allCreatives]);

	// Non-chosen creatives (the other options that were offered)
	const otherCreatives = useMemo(() => {
		if (!chosenCreativeUrl || allCreatives.length <= 1) return [];
		return allCreatives.filter((cr) => cr.url !== chosenCreativeUrl);
	}, [chosenCreativeUrl, allCreatives]);

	// Assets: use the inProgress payload (practice's actual choices with quantities)
	const submittedAssets = submissionNtf?.payload?.assets ?? merged.assets;
	const selectedPrinted = (submittedAssets?.printedAssets ?? []).filter(
		(a: any) => a.userSelected && (a.quantity > 0 || a.type === "free"),
	);
	const selectedDigital = (submittedAssets?.digitalAssets ?? []).filter(
		(a: any) => a.userSelected && (a.quantity > 0 || a.type === "free"),
	);
	const selectedExternal = (submittedAssets?.externalPlacements ?? []).filter(
		(a: any) => a.userSelected && (a.quantity > 0 || a.type === "free"),
	);
	const hasSelectedAssets =
		selectedPrinted.length > 0 || selectedDigital.length > 0 || selectedExternal.length > 0;

	if (notifications.length === 0) return null;

	const hasAnyContent =
		chosenCreativeUrl ||
		creativeAnswer ||
		hasSelectedAssets ||
		submissionNote ||
		originalNotes ||
		requirements ||
		feedbackNtfs.length > 0 ||
		markupLink ||
		assetsLink ||
		tier ||
		referenceLinks.length > 0 ||
		c.self_print;

	if (!hasAnyContent) return null;

	const AssetList = ({ items, label }: { items: any[]; label: string }) => {
		if (!items.length) return null;
		return (
			<Stack gap={4}>
				<Text size="xs" fw={600} c="gray.6">
					{label}
				</Text>
				{items.map((a: any, i: number) => {
					const price =
						a.chosenOptionValue != null
							? a.chosenOptionValue
							: a.price != null
								? a.price
								: null;
					return (
						<Group key={i} gap={6} align="center" wrap="nowrap">
							<IconCheck size={12} color={T.colors.teal[5]} style={{ flexShrink: 0 }} />
							<Text size="xs" c="gray.8">
								{a.name}
								{a.quantity > 0
									? ` (x${a.quantity}${a.suffix ? ` ${a.suffix}` : ""})`
									: ""}
								{a.chosenOptionLabel ? ` — ${a.chosenOptionLabel}` : ""}
								{price != null && price > 0 ? ` • £${Number(price).toFixed(2)}` : ""}
								{a.note ? ` • "${a.note}"` : ""}
							</Text>
						</Group>
					);
				})}
			</Stack>
		);
	};

	return (
		<>
			<Divider size="xs" color="gray.1" />
			<Paper
				radius="md"
				p="md"
				style={{
					background: `linear-gradient(135deg, ${T.colors.indigo[0]} 0%, ${T.colors.violet[0]} 100%)`,
					border: `1px solid ${T.colors.indigo[1]}`,
				}}
			>
				<Stack gap="md">
					{/* Header */}
					<Group gap={8} justify="space-between">
						<Group gap={8}>
							<ThemeIcon variant="light" color="indigo" radius="xl" size="sm">
								<IconPackage size={14} />
							</ThemeIcon>
							<Text fw={600} size="sm" c="indigo.9">
								Campaign Progress
							</Text>
						</Group>
						<Group gap={6}>
							{tier && (
								<Badge size="xs" variant="light" color="grape">
									{tier}
								</Badge>
							)}
							{eventType && (
								<Badge size="xs" variant="light" color="violet">
									{eventType}
								</Badge>
							)}
						</Group>
					</Group>

					{/* Chosen Creative — highlighted */}
					{chosenCreativeUrl && (
						<Stack gap={6}>
							<Group gap={6}>
								<IconBrush size={14} color={T.colors.blue[5]} />
								<Text size="xs" fw={600} c="gray.7">
									Chosen Creative
								</Text>
							</Group>
							<Card p={6} radius="sm" withBorder style={{ borderColor: T.colors.blue[2] }}>
								<Group gap="sm" align="center">
									<Image
										src={chosenCreativeUrl}
										alt={chosenCreativeLabel ?? "Chosen creative"}
										radius="xs"
										h={55}
										w={75}
										fit="cover"
									/>
									<Stack gap={2}>
										{chosenCreativeLabel && (
											<Text size="xs" fw={600} c="gray.8">
												{chosenCreativeLabel}
											</Text>
										)}
										<Badge size="xs" color="blue" variant="light">
											Selected
										</Badge>
									</Stack>
								</Group>
							</Card>
							{/* Other creative options that were available */}
							{otherCreatives.length > 0 && (
								<Stack gap={4}>
									<Text size="10px" fw={500} c="gray.5">
										Other options offered
									</Text>
									<Group gap={6}>
										{otherCreatives.map((cr, idx) => (
											<Image
												key={idx}
												src={cr.url}
												alt={cr.label ?? `Option ${idx + 1}`}
												radius="xs"
												h={35}
												w={50}
												fit="cover"
												style={{ opacity: 0.5, border: `1px solid ${T.colors.gray[2]}`, borderRadius: 4 }}
											/>
										))}
									</Group>
								</Stack>
							)}
						</Stack>
					)}

					{/* Creative Answer (response to custom question) */}
					{creativeAnswer && (
						<Stack gap={4}>
							<Group gap={6}>
								<IconNote size={14} color={T.colors.orange[5]} />
								<Text size="xs" fw={600} c="gray.7">
									Creative Response
								</Text>
							</Group>
							<Card p="xs" radius="sm" bg="orange.0" style={{ border: `1px solid ${T.colors.orange[1]}` }}>
								<Text size="xs" c="orange.9" style={{ whiteSpace: "pre-wrap" }}>
									{creativeAnswer}
								</Text>
							</Card>
						</Stack>
					)}

					{/* Selected Assets with quantities and prices */}
					{hasSelectedAssets && (
						<Stack gap={6}>
							<Group gap={6}>
								<IconPackage size={14} color={T.colors.teal[5]} />
								<Text size="xs" fw={600} c="gray.7">
									Selected Assets
								</Text>
							</Group>
							<AssetList items={selectedPrinted} label="Printed" />
							<AssetList items={selectedDigital} label="Digital" />
							<AssetList items={selectedExternal} label="External Placements" />
						</Stack>
					)}

					{/* Submission Note (from when practice submitted their choices) */}
					{submissionNote && (
						<Stack gap={4}>
							<Group gap={6}>
								<IconNote size={14} color={T.colors.blue[5]} />
								<Text size="xs" fw={600} c="gray.7">
									Submission Note
								</Text>
							</Group>
							<Text size="xs" c="gray.8" style={{ whiteSpace: "pre-wrap" }}>
								{submissionNote}
							</Text>
						</Stack>
					)}

					{/* Original Notes (from when campaign was first added to plan) */}
					{originalNotes && originalNotes !== submissionNote && (
						<Stack gap={4}>
							<Group gap={6}>
								<IconNote size={14} color={T.colors.gray[5]} />
								<Text size="xs" fw={600} c="gray.7">
									Original Notes
								</Text>
							</Group>
							<Text size="xs" c="gray.8" style={{ whiteSpace: "pre-wrap" }}>
								{originalNotes}
							</Text>
						</Stack>
					)}

					{/* All Revision Feedback entries */}
					{feedbackNtfs.length > 0 && (
						<Stack gap={6}>
							<Group gap={6}>
								<IconNote size={14} color={T.colors.red[5]} />
								<Text size="xs" fw={600} c="red.7">
									Revision Feedback
								</Text>
							</Group>
							{feedbackNtfs.map((fn, idx) => {
								const fb = fn.payload?.feedback as string | undefined;
								if (!fb) return null;
								return (
									<Card
										key={idx}
										p="xs"
										radius="sm"
										bg="red.0"
										style={{ border: `1px solid ${T.colors.red[1]}` }}
									>
										<Text size="xs" c="red.9" style={{ whiteSpace: "pre-wrap" }}>
											{fb}
										</Text>
									</Card>
								);
							})}
						</Stack>
					)}

					{/* Requirements (bespoke campaigns/events) */}
					{requirements && (
						<Stack gap={4}>
							<Group gap={6}>
								<IconNote size={14} color={T.colors.violet[5]} />
								<Text size="xs" fw={600} c="gray.7">
									Requirements
								</Text>
							</Group>
							<Text size="xs" c="gray.8" style={{ whiteSpace: "pre-wrap" }}>
								{requirements}
							</Text>
						</Stack>
					)}

					{/* Reference Links from payloads */}
					{referenceLinks.length > 0 && (
						<Stack gap={6}>
							<Group gap={6}>
								<IconShare3 size={14} color={T.colors.violet[5]} />
								<Text size="xs" fw={600} c="gray.7">
									Reference Links
								</Text>
							</Group>
							{referenceLinks.map((rl, i) => (
								<Anchor key={i} href={rl} target="_blank" underline="never">
									<Button
										variant="light"
										color="grape"
										size="xs"
										radius="md"
										fullWidth
										leftSection={<IconExternalLink size={14} />}
									>
										{getReferenceLinkLabel(rl, i)}
									</Button>
								</Anchor>
							))}
						</Stack>
					)}

					{/* Markup & Assets Links */}
					{(markupLink || assetsLink) && (
						<Stack gap={6}>
							<Group gap={6}>
								<IconLink size={14} color={T.colors.violet[5]} />
								<Text size="xs" fw={600} c="gray.7">
									Artwork & Files
								</Text>
							</Group>
							{markupLink && (
								<Anchor href={markupLink} target="_blank" underline="never">
									<Button
										variant="light"
										color="violet"
										size="xs"
										radius="md"
										fullWidth
										leftSection={<IconExternalLink size={14} />}
									>
										View Markup
									</Button>
								</Anchor>
							)}
							{assetsLink && (
								<Anchor href={assetsLink} target="_blank" underline="never">
									<Button
										variant="light"
										color="teal"
										size="xs"
										radius="md"
										fullWidth
										leftSection={<IconExternalLink size={14} />}
									>
										View Assets
									</Button>
								</Anchor>
							)}
						</Stack>
					)}

					{/* Self Print */}
					{c.self_print && (
						<Group gap={6}>
							<ThemeIcon variant="light" color="violet" radius="xl" size="xs">
								<IconPrinter size={12} />
							</ThemeIcon>
							<Text size="xs" fw={500} c="violet.8">
								Practice will print their own assets
							</Text>
						</Group>
					)}
				</Stack>
			</Paper>
		</>
	);
}

const View = ({ c, opened = false, closeDrawer, mode = "add" }: Props) => {
	const navigate = useNavigate();
	const isAdd = mode === "add";
	const T = useMantineTheme();
	const { setState } = useContext(AppContext);
	const [editOpened, { open: openEdit, close: closeEdit }] =
		useDisclosure(false);
	const [addOpened, { toggle: toggleAdd }] = useDisclosure(false);
	const addSectionRef = useRef<HTMLDivElement>(null);
	const [previewImage, setPreviewImage] = useState<{
		url: string;
		label: string;
	} | null>(null);

	const validCreatives = c.creatives?.filter((cr) => cr.url?.trim()) ?? [];

	// Combined callback for drawer close + tab switch
	const handleAddSuccess = () => {
		closeDrawer();
		updateState(setState, "filters.userSelectedTab", UserTabModes.Selected);
	};

	// One week from today - minimum selectable date
	const oneWeekFromNow = addDays(new Date(), 7);

	// Campaign availability bounds
	const rawAvailFrom = c.availability?.from
		? new Date(c.availability.from)
		: null;
	const availTo = c.availability?.to ? new Date(c.availability.to) : null;

	// Effective minimum date is the later of (availability.from, one week from now)
	const availFrom =
		rawAvailFrom && isAfter(rawAvailFrom, oneWeekFromNow)
			? rawAvailFrom
			: oneWeekFromNow;

	// Default start date: use effective min date (one week from now or availability.from, whichever is later)
	const defaultFrom =
		rawAvailFrom && isAfter(rawAvailFrom, oneWeekFromNow)
			? rawAvailFrom
			: oneWeekFromNow;

	// Default end date: extend to max availability if possible, otherwise 1 month from start
	const defaultTo = availTo
		? availTo
		: addDays(addMonths(defaultFrom, 1), -1);

	const [campaign, setCampaign] = useState<{ dateRange: DateRange }>(() => ({
		dateRange: {
			from: defaultFrom,
			to: defaultTo,
		},
	}));

	const { mutate: addSelection, isPending: adding } =
		useAddSelection(handleAddSuccess);
	const { mutate: deleteSelection, isPending: deleting } =
		useDeleteSelection(handleAddSuccess);

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
				{c.topics?.map((c) => (
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
			: (availFrom ?? new Date());
	};

	const computeEnd = (
		start: Date,
		opt: (typeof quickDateOptions)[number],
	) => {
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
			"EEEE, MMMM do, yyyy",
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
				from_date: format(
					campaign.dateRange.from as Date,
					"yyyy-MM-dd",
				),
				to_date: format(campaign.dateRange.to as Date, "yyyy-MM-dd"),
				status: SelectionStatus.OnPlan,
				source: SelectionsSource.Manual,
				campaignName: c.name,
				campaignCategory: c.category,
			},
			{
				onError: (e: any) => {
					toast.error(e?.message ?? "Could not add to plan");
				},
			},
		);
	};

	const onRemove = () => {
		deleteSelection(
			{
				selectionId: c.selection_id,
				bespokeId: c.bespoke_campaign_id,
				campaignName: c.name,
				campaignCategory: c.category,
			},
			{
				onError: (e: any) =>
					toast.error(e.message ?? "Could not remove"),
			},
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
									leftSection={
										<IconCalendarCheck size={15} />
									}
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
						<Text
							c={c.is_event ? "violet" : "gray.9"}
							size="sm"
							fw={700}
						>
							{c?.is_event ? "Event Dates" : "Availability"}
						</Text>

						<Text size="sm" fw={500}>
							{c.selected
								? formatDateRange(
										c.selection_from_date,
										c.selection_to_date,
									)
								: formatDateRange(
										c.availability?.from,
										c.availability?.to,
									)}
						</Text>
					</Stack>

					{validCreatives.length > 0 && (
						<>
							<Divider size={"xs"} color="gray.1" />
							<Stack gap={10}>
								<Group gap={6}>
									<IconPhoto
										size={16}
										color={T.colors.blue[3]}
									/>
									<Text size="sm" fw={500} c="blue.3">
										Campaign Creatives
									</Text>
								</Group>
								<SimpleGrid
									cols={{ base: 4, sm: 4 }}
									spacing="sm"
								>
									{validCreatives.map((cr, idx) => (
										<Stack key={idx} gap={4}>
											<Card
												p={0}
												radius="sm"
												h={80}
												style={{
													cursor: "pointer",
													overflow: "hidden",
													border: `1px solid ${T.colors.gray[2]}`,
													position: "relative",
													transition:
														"box-shadow 0.15s ease",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.boxShadow = `0 0 0 2px ${T.colors.blue[3]}`;
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.boxShadow =
														"none";
												}}
												onClick={() =>
													setPreviewImage({
														url: cr.url!,
														label:
															cr.label ||
															`Creative ${idx + 1}`,
													})
												}
											>
												<Image
													src={cr.url}
													alt={
														cr.label ||
														`Creative ${idx + 1}`
													}
													height={80}
													fit="cover"
												/>
												<Flex
													align="center"
													justify="center"
													style={{
														position: "absolute",
														top: 4,
														right: 4,
														width: 20,
														height: 20,
														borderRadius: 6,
														background:
															T.colors.blue[4],
														boxShadow:
															"0 1px 4px rgba(0,0,0,0.3)",
														pointerEvents: "none",
													}}
												>
													<IconArrowsMaximize
														size={12}
														color="white"
														strokeWidth={2.5}
													/>
												</Flex>
											</Card>
											<Text
												size="xs"
												fw={500}
												c="gray.6"
												ta="center"
											>
												{cr.label ||
													`Creative ${idx + 1}`}
											</Text>
										</Stack>
									))}
								</SimpleGrid>
							</Stack>
						</>
					)}

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

					{/* Lifecycle Details — only for selected campaigns beyond onPlan */}
					{c.selected && c.status && c.status !== SelectionStatus.OnPlan && (
						<LifecycleDetails campaign={c} />
					)}

					{validCreatives.length === 0 && (
						<>
							<Divider size={"xs"} color="gray.1" />

							<Stack gap={10}>
								<Text fw={500} size="sm">
									More Information
								</Text>

								<Text c="gray.6" size="sm">
									We don't have the current artwork for this yet, but
									please see similar campaigns that have rolled out in
									the past.
								</Text>

								<Stack mt={10}>
									{c.reference_links?.map((rl: string, i: number) => (
										<StyledButton
											alignLeft
											bg={"violet.0"}
											key={rl}
											link={rl}
											leftSection={
												<IconShare3
													size={18}
													color={T.colors.gray[9]}
												/>
											}
										>
											{getReferenceLinkLabel(rl, i)}
										</StyledButton>
									))}

									{!c.reference_links?.length && (
										<IconMinus size={20} />
									)}
								</Stack>
							</Stack>
						</>
					)}

					{validCreatives.length > 0 && !!c.reference_links?.length && (
						<>
							<Divider size={"xs"} color="gray.1" />

							<Stack gap={10}>
								<Text fw={500} size="sm">
									Reference Links
								</Text>

								<Stack>
									{c.reference_links.map((rl: string, i: number) => (
										<StyledButton
											alignLeft
											bg={"violet.0"}
											key={rl}
											link={rl}
											leftSection={
												<IconShare3
													size={18}
													color={T.colors.gray[9]}
												/>
											}
										>
											{getReferenceLinkLabel(rl, i)}
										</StyledButton>
									))}
								</Stack>
							</Stack>
						</>
					)}

					{c.selected && (
						<>
							<Divider size={"xs"} color="gray.1" />

							<Grid gutter={10}>
								<Grid.Col span={8}>
									<StyledButton
										fw={500}
										fullWidth
										leftSection={
											<IconEdit
												size={18}
												color={T.colors.gray[9]}
											/>
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
								onClick={() => {
									toggleAdd();
									setTimeout(() => {
										addSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
									}, 300);
								}}
								loading={adding}
							>
								Add to Plan
							</Button>
						</>
					)}

					<Collapse in={addOpened}>
						<Card bg={"#fbfbfc"} radius={10} ref={addSectionRef}>
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
									minDate={
										availFrom
											? new Date(availFrom)
											: undefined
									}
									maxDate={
										availTo ? new Date(availTo) : undefined
									}
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
									<Flex
										align={"center"}
										justify={"space-between"}
									>
										<Group align={"center"} gap={10}>
											<IconClockHour2
												size={18}
												color={T.colors.gray[7]}
											/>
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
															if (!disabled)
																applyQuickOption(
																	d,
																);
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

			<Modal
				opened={!!previewImage}
				onClose={() => setPreviewImage(null)}
				title={previewImage?.label}
				size="lg"
				centered
				radius={10}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				{previewImage && (
					<Image
						src={previewImage.url}
						alt={previewImage.label}
						radius="sm"
						fit="contain"
					/>
				)}
			</Modal>

			<Edit opened={editOpened} closeModal={closeEdit} selection={c} />
		</>
	);
};

export default View;
