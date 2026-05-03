import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Group,
	Stack,
	Text,
	Title,
	Tooltip,
	useMatches,
} from "@mantine/core";
import cl from "./campaignCard.module.scss";
import {
	IconCalendarCheck,
	IconCheck,
	IconPencil,
	IconPlus,
	IconSend,
	IconShare3,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import StyledButton from "@/components/styledButton/StyledButton";
import View from "../View";
import Edit from "../Edit";
import { Campaign } from "@/models/campaign.models";
import { startCase, truncate } from "lodash";
import { formatAvailabilityForUI } from "@/shared/shared.utilities";
import { BadgeList } from "@/components/badgeList/BadgeList";
import { useContext, useEffect, useState } from "react";
import Status from "@/components/status/Status";
import { AppRoutes, SelectionStatus } from "@/shared/shared.models";
import AppContext from "@/shared/AppContext";
import { UserTabModes } from "@/models/general.models";
import { useSubmitDraftSelection } from "@/hooks/selection.hooks";
import SubmitChoicesModal from "@/components/assets/SubmitChoicesModal";
import clsx from "clsx";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const CampaignCard = (c: Campaign) => {
	const [viewMode, setViewMode] = useState("view");
	const [opened, { open, close }] = useDisclosure(false);
	const [editOpened, { open: openEdit, close: closeEdit }] =
		useDisclosure(false);
	const [draftSubmitOpen, setDraftSubmitOpen] = useState(false);
	const {
		state: { filters },
	} = useContext(AppContext);
	const isSelections = filters.userSelectedTab === UserTabModes.Selected;
	const isDraft = c.status === SelectionStatus.Draft;
	const validCreatives = c.creatives?.filter((cr) => cr.url?.trim()) ?? [];

	const { mutate: submitDraft, isPending: submittingDraft } =
		useSubmitDraftSelection();

	const handleSubmitDraft = (result: {
		chosenCreative: string | null;
		finalAssets: any;
		note: string | null;
	}) => {
		if (!c.selection_id) return;
		submitDraft(
			{
				selectionId: c.selection_id,
				chosenCreative: result.chosenCreative,
				assets: result.finalAssets,
				note: result.note,
				campaignName: c.name,
			},
			{
				onSuccess: () => setDraftSubmitOpen(false),
				onError: (e: any) =>
					toast.error(e?.message ?? "Could not submit draft"),
			}
		);
	};
	const mih = useMatches({
		base: 430,
		md: 480,
		lg: 470,
	});

	const [searchParams, setSearchParams] = useSearchParams();
	const [copied, setCopied] = useState(false);

	// Auto-open this card's drawer if the URL contains ?campaign=<this id>
	// (catalog campaigns only — bespoke campaigns/events are not shareable)
	useEffect(() => {
		if (c.is_bespoke || c.is_event) return;
		const target = searchParams.get("campaign");
		if (target && target === c.id) {
			setViewMode("view");
			open();
			// Strip the query param so refresh / nav doesn't reopen
			const next = new URLSearchParams(searchParams);
			next.delete("campaign");
			setSearchParams(next, { replace: true });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [c.id]);

	const handleShare = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!c.id) return;
		const base =
			(import.meta as any).env?.VITE_APP_BASE_URL ||
			window.location.origin;
		const url = `${base.replace(/\/$/, "")}${AppRoutes.Dashboard}?campaign=${c.id}`;
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.success("Share link copied to clipboard");
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error("Failed to copy link");
		}
	};

	const Objectives = ({ noTitle = false }) => (
		<Stack gap={5}>
			{!noTitle && (
				<Text size="xs" fw={500} c={"blue.3"}>
					Objectives
				</Text>
			)}
			<Flex align={"center"} gap={4}>
				<BadgeList items={c.objectives} maxDisplay={3} />
			</Flex>
		</Stack>
	);

	const Topics = ({ noTitle = false }) => (
		<Stack gap={5}>
			{!noTitle && (
				<Text size="xs" fw={500} c={"blue.3"}>
					Categories
				</Text>
			)}

			<Flex align={"center"} gap={4}>
				<BadgeList
					items={c.topics}
					maxDisplay={3}
					firstBadgeVariant="outline"
					firstBadgeColor="gray.1"
					firstBadgeTextColor="gray.9"
				/>
			</Flex>
		</Stack>
	);

	return (
		<>
			{/* Main card Component */}
			<Card
				radius={10}
				className={clsx(
					cl["campaign-card"],
					c.selected && cl.isSelected,
					c.is_event && cl.isEvent
				)}
				mih={mih}
				onClick={open}
			>
				<Stack gap={15}>
					<Flex
						justify={"space-between"}
						align={"center"}
						w={"100%"}
					>
						{c.selected && c.is_event ? (
							<Group gap={10}>
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
						) : (
							<Box />
						)}
						<Group gap={6} align="center">
							{c.selected && (
								<Status
									status={
										!isSelections && c.status !== SelectionStatus.Draft
											? SelectionStatus.OnPlan
											: c.status
									}
								/>
							)}
							{!c.is_bespoke && !c.is_event && (
								<Tooltip
									label={copied ? "Copied!" : "Share campaign"}
									withArrow
									position="left"
								>
									<ActionIcon
										variant="light"
										color="violet"
										radius="xl"
										size="md"
										aria-label="Share campaign"
										onClick={handleShare}
									>
										{copied ? (
											<IconCheck size={14} />
										) : (
											<IconShare3 size={14} />
										)}
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
					</Flex>

					<Stack gap={3} mt={c.selected ? -10 : "auto"}>
						<Title order={5} fw={600}>
							{c.name}
						</Title>
						<Text size="sm" c={"gray.7"}>
							{truncate(c.description, { length: 100 })}
						</Text>
					</Stack>

					<Stack gap={5}>
						<Text size="sm" fw={500} c={"blue.3"}>
							{c.is_event
								? "Event Period"
								: c.selected
								? "Scheduled For"
								: "Availability"}
						</Text>
						<Text size="xs" c={"gray.6"} fw={600}>
							{formatAvailabilityForUI(
								c.selected
									? {
											from: c.selection_from_date,
											to: c.selection_to_date,
									  }
									: c.availability
							)}
						</Text>
					</Stack>

					<Stack gap={5}>
						<Text size="xs" fw={500} c={"blue.3"}>
							Activity
						</Text>

						<Flex align={"center"} gap={4}>
							<Badge variant="outline" color="gray.1">
								<Text size="xs" fw={600} c={"gray.9"}>
									{startCase(c.category)}
								</Text>
							</Badge>
						</Flex>
					</Stack>

					<Objectives />

					<Topics />

					{isDraft ? (
						<Box
							pos={"absolute"}
							bottom={20}
							left={20}
							right={20}
						>
							<Button
								fullWidth
								variant="gradient"
								gradient={{ from: "violet", to: "grape", deg: 90 }}
								leftSection={<IconSend size={14} />}
								loading={submittingDraft}
								onClick={(e) => {
									e.stopPropagation();
									setDraftSubmitOpen(true);
								}}
							>
								Send to Design Team
							</Button>
						</Box>
					) : (
						<Flex
							justify={"space-between"}
							pos={"absolute"}
							bottom={20}
							left={0}
							pr={20}
							pl={20}
							w={"100%"}
						>
							<StyledButton
								variant={c.is_event ? "light" : "subtle"}
								color="violet"
								onClick={(e) => {
									e.stopPropagation();
									setViewMode("view");
									open();
								}}
							>
								View {c.is_event && <>Event</>} Details
							</StyledButton>

							{c.selected ? (
								c.status === SelectionStatus.OnPlan ? (
									<Button
										color={
											c.is_event
												? "violet"
												: isSelections
												? "blue.3"
												: "red.4"
										}
										leftSection={<IconPencil size={14} />}
										onClick={(e) => {
											e.stopPropagation();
											openEdit();
										}}
									>
										Edit
									</Button>
								) : null
							) : (
								<Button
									leftSection={<IconPlus size={14} />}
									onClick={(e) => {
										e.stopPropagation();
										setViewMode("add");
										open();
									}}
								>
									Add
								</Button>
							)}
						</Flex>
					)}
				</Stack>
			</Card>

			{/* Card Details Breakdown */}
			<View
				mode={viewMode as any}
				c={c}
				opened={opened}
				closeDrawer={close}
			/>

			{/* Editing Card */}
			<Edit opened={editOpened} closeModal={closeEdit} selection={c} />

			{/* Send to Design Team modal (drafts only) */}
			<SubmitChoicesModal
				opened={draftSubmitOpen}
				onClose={() => setDraftSubmitOpen(false)}
				title={`Send ${c.name ?? "Campaign"} to design team`}
				subtitle={c.is_event ? `${c.event_type ?? "Event"}` : undefined}
				category={c.category ?? null}
				description={c.description ?? null}
				fromDate={c.selection_from_date ?? null}
				toDate={c.selection_to_date ?? null}
				assets={c.assets}
				creatives={validCreatives}
				preselectAssets={false}
				loading={submittingDraft}
				submitLabel="Send to Design Team"
				onSubmit={handleSubmitDraft}
			/>
		</>
	);
};

export default CampaignCard;
