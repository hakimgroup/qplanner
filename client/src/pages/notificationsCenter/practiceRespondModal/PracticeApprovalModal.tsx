import StyledButton from "@/components/styledButton/StyledButton";
import {
	useConfirmAssets,
	useRequestRevision,
	useRecordMarkupOpened,
	useSelectionMarkupOpenedAt,
} from "@/hooks/notification.hooks";
import { NotificationRow } from "@/models/notification.models";
import {
	Modal,
	Stack,
	Text,
	Paper,
	Image,
	Button,
	Group,
	Anchor,
	useMantineTheme,
	Box,
	Badge,
	Flex,
	ThemeIcon,
	Textarea,
	Checkbox,
	Radio,
} from "@mantine/core";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import {
	IconExternalLink,
	IconCalendar,
	IconCategory,
	IconSparkles,
	IconThumbUpFilled,
	IconClipboard,
	IconArrowLeft,
	IconSend,
	IconEye,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { useIsMobile } from "@/shared/shared.hooks";

export type PracticeApprovalModalProps = {
	opened: boolean;
	onClose: () => void;
	notification?: NotificationRow;
};

export default function PracticeApprovalModal({
	opened,
	onClose,
	notification: ntf,
}: PracticeApprovalModalProps) {
	const T = useMantineTheme().colors;
	const isMobile = useIsMobile();

	// State for feedback view
	const [showFeedbackForm, setShowFeedbackForm] = useState(false);
	const [feedback, setFeedback] = useState("");
	const [selfPrint, setSelfPrint] = useState(false);
	// Which decision the practice selected in Step 2 (markup version).
	const [selectedAction, setSelectedAction] = useState<
		"approve" | "revise" | null
	>(null);

	const { mutate: confirmAssets, isPending: isConfirming } =
		useConfirmAssets();
	const { mutate: requestRevision, isPending: isSubmittingFeedback } =
		useRequestRevision();
	const { mutate: recordMarkupOpened } = useRecordMarkupOpened();
	const { data: persistedOpenedAt } = useSelectionMarkupOpenedAt(
		ntf?.selection_id ?? null,
	);

	// Tracks whether the practice has clicked through in THIS session.
	// Combined with the DB-persisted timestamp so the "Opened" badge survives
	// modal close/reopen and cross-session reloads.
	const [openedThisSession, setOpenedThisSession] = useState(false);
	const hasOpenedMarkup = openedThisSession || !!persistedOpenedAt;

	const handleMarkupOpen = () => {
		if (!ntf?.selection_id) return;
		// Fire-and-forget telemetry; the link itself still opens via the Anchor.
		recordMarkupOpened(ntf.selection_id);
		setOpenedThisSession(true);
	};

	const handleConfirmAssets = () => {
		if (!ntf?.selection_id) return;
		confirmAssets(
			{ selectionId: ntf.selection_id, selfPrint },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	};

	const handleSubmitFeedback = () => {
		if (!ntf?.selection_id || !feedback.trim()) return;
		requestRevision(
			{ selectionId: ntf.selection_id, feedback: feedback.trim() },
			{
				onSuccess: () => {
					setFeedback("");
					setShowFeedbackForm(false);
					onClose();
				},
			},
		);
	};

	// Commit the Step 2 decision (markup version). Approve calls
	// confirm_assets (honours the self-print checkbox). Revise calls
	// request_revision with a generic note; the design team reads the
	// practice's real comments off the markup file itself.
	const handleContinue = () => {
		if (!ntf?.selection_id || !selectedAction) return;
		if (selectedAction === "approve") {
			confirmAssets(
				{ selectionId: ntf.selection_id, selfPrint },
				{ onSuccess: () => handleClose() },
			);
		} else {
			requestRevision(
				{
					selectionId: ntf.selection_id,
					feedback:
						"Practice indicated changes were left on the review document.",
				},
				{ onSuccess: () => handleClose() },
			);
		}
	};

	const handleClose = () => {
		setFeedback("");
		setShowFeedbackForm(false);
		setSelfPrint(false);
		setOpenedThisSession(false);
		setSelectedAction(null);
		onClose();
	};

	const hasMarkupLink = !!ntf?.payload?.markup_link;
	const hasAssetsLink = !!ntf?.payload?.assets_link;

	// Determine which version to show:
	// - If markup_link exists, always show markup version
	// - If no markup_link but assets_link exists, show assets version
	const showMarkupVersion = hasMarkupLink;
	const showAssetsVersion = !hasMarkupLink && hasAssetsLink;

	// Format dates for display
	const formatDate = (dateStr?: string) => {
		if (!dateStr) return null;
		try {
			return format(parseISO(dateStr), "d MMM yyyy");
		} catch {
			return dateStr;
		}
	};

	const fromDate = formatDate(ntf?.payload?.from_date);
	const toDate = formatDate(ntf?.payload?.to_date);
	const dateRange = fromDate && toDate ? `${fromDate} - ${toDate}` : null;

	const isLoading = isConfirming || isSubmittingFeedback;

	return (
		<Modal
			fullScreen={isMobile}
			opened={opened}
			onClose={handleClose}
			centered
			size="lg"
			radius="lg"
			trapFocus
			withCloseButton
			overlayProps={{ backgroundOpacity: 0.65, blur: 4 }}
			title={
				<Text fz={"h4"} fw={600}>
					{showFeedbackForm
						? "Request Changes"
						: showAssetsVersion
							? "Assets Ready for Review"
							: "Artwork Confirmation Required"}
				</Text>
			}
		>
			<Stack gap="lg">
				{/* ===== FEEDBACK FORM VIEW ===== */}
				{showFeedbackForm ? (
					<>
						{/* Back button and campaign name */}
						<Flex align="center" gap="md">
							<ThemeIcon
								size={50}
								radius="xl"
								variant="light"
								color="orange"
							>
								<IconClipboard size={26} />
							</ThemeIcon>
							<Stack gap={2}>
								<Text fz="h4" fw={700}>
									{ntf?.payload?.name}
								</Text>
								<Text size="sm" c="gray.6">
									Tell us what changes you need
								</Text>
							</Stack>
						</Flex>

						{/* Feedback textarea */}
						<Textarea
							label="Your Feedback"
							description="Please describe the changes you'd like made to the assets"
							placeholder="e.g., Please update the logo positioning, change the headline text to..."
							minRows={4}
							maxRows={8}
							autosize
							value={feedback}
							onChange={(e) => setFeedback(e.currentTarget.value)}
							disabled={isSubmittingFeedback}
							required
							styles={{
								input: {
									backgroundColor: T.gray[0],
								},
							}}
						/>

						{/* Info text */}
						<Paper
							p="md"
							radius="md"
							style={{
								backgroundColor: T.orange[0],
								border: `1px solid ${T.orange[2]}`,
							}}
						>
							<Text size="sm" c="orange.9">
								Your feedback will be sent to the team and the
								campaign will be moved back to "In Progress" for
								revisions. You'll receive a notification when
								the updated assets are ready for review.
							</Text>
						</Paper>

						{/* Actions */}
						<Flex align="center" justify="space-between">
							<Button
								variant="subtle"
								color="gray"
								leftSection={<IconArrowLeft size={14} />}
								onClick={() => setShowFeedbackForm(false)}
								disabled={isSubmittingFeedback}
							>
								Back
							</Button>
							<Button
								color="orange"
								rightSection={<IconSend size={14} />}
								onClick={handleSubmitFeedback}
								loading={isSubmittingFeedback}
								disabled={!feedback.trim()}
							>
								Submit Feedback
							</Button>
						</Flex>
					</>
				) : (
					<>
						{/* ===== ASSETS VERSION UI ===== */}
						{showAssetsVersion && (
							<>
								{/* Header with icon */}
								<Flex align="center" gap="md">
									<ThemeIcon
										size={50}
										radius="xl"
										variant="light"
										color="teal"
									>
										<IconSparkles size={26} />
									</ThemeIcon>
									<Stack gap={2}>
										<Text fz="h4" fw={700}>
											{ntf?.payload?.name}
										</Text>
										<Text size="sm" c="gray.6">
											Your campaign assets are ready for
											review
										</Text>
									</Stack>
								</Flex>

								{/* Campaign Details Card */}
								<Paper
									p="md"
									radius="md"
									style={{
										backgroundColor: T.gray[0],
									}}
								>
									<Stack gap="md">
										{/* Category & Tier Badges */}
										<Group gap="xs">
											{ntf?.payload?.category && (
												<Badge
													leftSection={
														<IconCategory
															size={12}
														/>
													}
													variant="light"
													color="blue"
													size="lg"
												>
													{ntf.payload.category}
												</Badge>
											)}
											{ntf?.payload?.tier && (
												<Badge
													variant="light"
													color="gray"
													c={"gray.9"}
													size="lg"
												>
													{ntf.payload.tier}
												</Badge>
											)}
										</Group>

										{/* Date Range */}
										{dateRange && (
											<Flex align="center" gap="xs">
												<IconCalendar
													size={16}
													color={T.gray[6]}
												/>
												<Text
													size="sm"
													c="gray.9"
													fw={500}
												>
													{dateRange}
												</Text>
											</Flex>
										)}

										{/* Description */}
										{ntf?.payload?.description && (
											<>
												<GradientDivider />
												<Text
													size="sm"
													c="gray.9"
													lineClamp={3}
												>
													{ntf.payload.description}
												</Text>
											</>
										)}
									</Stack>
								</Paper>

								{/* Review Section */}
								<Paper
									p="lg"
									radius="md"
									style={{
										background: `linear-gradient(135deg, ${T.teal[0]} 0%, ${T.cyan[0]} 100%)`,
										border: `1px solid ${T.teal[2]}`,
									}}
								>
									<Stack gap="md" align="center">
										<ThemeIcon
											size={60}
											radius="xl"
											color="teal"
											variant="filled"
										>
											<IconExternalLink size={30} />
										</ThemeIcon>
										<Stack gap={4} align="center">
											<Text fw={600} size="md">
												Review Your Assets
											</Text>
											<Text
												size="sm"
												c="gray.6"
												ta="center"
											>
												View your campaign assets and
												approve or request changes
											</Text>
										</Stack>
										<Anchor
											href={
												ntf?.payload?.assets_link ??
												undefined
											}
											target="_blank"
											rel="noopener noreferrer"
											underline="never"
											w="100%"
										>
											<Button
												fullWidth
												size="md"
												radius="md"
												color="teal"
												leftSection={
													<IconExternalLink
														size={18}
													/>
												}
											>
												View Assets Folder
											</Button>
										</Anchor>
									</Stack>
								</Paper>
							</>
						)}

						{/* ===== MARKUP VERSION UI — two-step review + radio decision ===== */}
						{showMarkupVersion && (
							<>
								{/* Campaign name */}
								<Text fz={"h4"} fw={600}>
									{ntf?.payload?.name}
								</Text>

								{/* Intro line */}
								<Text c="gray.7" size="sm">
									Updated artwork for{" "}
									<Text span fw={600} c="gray.9">
										{ntf?.payload?.name}
									</Text>{" "}
									is ready for your final approval.
								</Text>

								{/* ----- Step 1 — Review the artwork ----- */}
								<Paper
									p="md"
									radius="md"
									style={{
										backgroundColor: T.gray[0],
										border: `1px solid ${T.gray[2]}`,
									}}
								>
									<Stack gap="sm">
										<Group gap={8} align="center">
											<Badge
												size="sm"
												variant="filled"
												color="violet"
												radius="sm"
											>
												Step 1
											</Badge>
											<Text fw={600} size="sm" c="gray.9">
												Review the artwork
											</Text>
											{hasOpenedMarkup && (
												<Badge
													size="xs"
													variant="light"
													color="teal"
													radius="sm"
												>
													Opened
												</Badge>
											)}
										</Group>
										<Text size="xs" c="gray.6">
											Open the review document in a new
											tab. Leave any comments directly on
											the artwork — the design team can
											see them there.
										</Text>
										<Anchor
											href={
												ntf?.payload?.markup_link ??
												undefined
											}
											target="_blank"
											rel="noopener noreferrer"
											underline="never"
											onClick={handleMarkupOpen}
											style={{
												pointerEvents: ntf?.payload
													?.markup_link
													? "auto"
													: "none",
											}}
										>
											<StyledButton
												fullWidth
												variant="default"
												radius="md"
												leftSection={
													<IconEye size={18} />
												}
												rightSection={
													<IconExternalLink
														size={16}
													/>
												}
												disabled={
													!ntf?.payload?.markup_link
												}
											>
												Open review document
											</StyledButton>
										</Anchor>
									</Stack>
								</Paper>

								{/* ----- Step 2 — Tell us what you think ----- */}
								<Paper
									p="md"
									radius="md"
									style={{
										background: `linear-gradient(135deg, ${T.violet[0]} 0%, ${T.blue[0]} 100%)`,
										border: `1px solid ${T.violet[2]}`,
									}}
								>
									<Stack gap="md">
										<Stack gap="xs">
											<Group gap={8} align="center">
												<Badge
													size="sm"
													variant="filled"
													color="violet"
													radius="sm"
												>
													Step 2
												</Badge>
												<Text
													fw={600}
													size="sm"
													c="gray.9"
												>
													Tell us what you think
												</Text>
											</Group>
											<Text size="xs" c="gray.7">
												Once you've reviewed,{" "}
												<Text span fw={600} c="gray.9">
													come back here
												</Text>{" "}
												and let us know whether to
												proceed or revise. The campaign
												stays parked until you choose.
											</Text>
										</Stack>

										<Radio.Group
											value={selectedAction ?? ""}
											onChange={(v) =>
												setSelectedAction(
													v as "approve" | "revise",
												)
											}
										>
											<Stack gap="sm">
												<Radio.Card
													value="revise"
													radius="md"
													p="md"
													style={{
														backgroundColor:
															"white",
														borderColor:
															selectedAction ===
															"revise"
																? T.violet[5]
																: T.gray[3],
													}}
												>
													<Group
														align="flex-start"
														wrap="nowrap"
														gap="sm"
													>
														<Radio.Indicator
															color="violet"
															style={{
																marginTop: 2,
															}}
														/>
														<Stack gap={4}>
															<Text
																fw={700}
																size="sm"
																c="gray.9"
															>
																I have left
																changes on the
																review document
															</Text>
															<Text
																size="xs"
																c="gray.6"
																style={{
																	lineHeight: 1.5,
																}}
															>
																We will
																implement the
																changes you have
																requested on the
																review document
																and send you a
																notification
																when this is
																complete.
															</Text>
														</Stack>
													</Group>
												</Radio.Card>

												<Radio.Card
													value="approve"
													radius="md"
													p="md"
													style={{
														backgroundColor:
															"white",
														borderColor:
															selectedAction ===
															"approve"
																? T.violet[5]
																: T.gray[3],
													}}
												>
													<Group
														align="flex-start"
														wrap="nowrap"
														gap="sm"
													>
														<Radio.Indicator
															color="violet"
															style={{
																marginTop: 2,
															}}
														/>
														<Stack gap={4}>
															<Text
																fw={700}
																size="sm"
																c="gray.9"
															>
																Looks good -
																approve
															</Text>
															<Text
																size="xs"
																c="gray.6"
																style={{
																	lineHeight: 1.5,
																}}
															>
																Once approved,
																the design team
																will create the
																final files and
																they'll be made
																available on the
																planner. We'll
																send you a
																notification
																when this is
																complete.
															</Text>
														</Stack>
													</Group>
												</Radio.Card>
											</Stack>
										</Radio.Group>
									</Stack>
								</Paper>

								{/* Self-print — only affects the approve path */}
								<Checkbox
									label="We will print our own assets"
									description="Check this if your practice will handle printing independently"
									checked={selfPrint}
									onChange={(e) =>
										setSelfPrint(e.currentTarget.checked)
									}
									disabled={isLoading}
									color="violet"
									radius="sm"
									size="sm"
								/>

								{/* Continue / Cancel */}
								<Group grow>
									<Button
										color="dark"
										size="md"
										radius="md"
										onClick={handleContinue}
										loading={isLoading}
										disabled={
											!selectedAction ||
											!ntf?.selection_id
										}
									>
										Done
									</Button>
									<Button
										variant="default"
										size="md"
										radius="md"
										onClick={handleClose}
										disabled={isLoading}
									>
										Cancel
									</Button>
								</Group>
							</>
						)}

						{/* Fallback when neither link is available */}
						{!showMarkupVersion && !showAssetsVersion && (
							<StyledButton
								fullWidth
								variant="default"
								radius="md"
								leftSection={<IconExternalLink size={18} />}
								disabled
							>
								No link available
							</StyledButton>
						)}

						{/* Assets-only footer — self-print + Confirm/Leave Feedback.
						    The markup version has its own equivalents inline above. */}
						{!showMarkupVersion && (
							<>
								<Checkbox
									label="We will print our own assets"
									description="Check this if your practice will handle printing independently"
									checked={selfPrint}
									onChange={(e) =>
										setSelfPrint(e.currentTarget.checked)
									}
									disabled={isLoading}
									color="violet"
									radius="sm"
									size="sm"
								/>

								<Flex
									align="center"
									justify="space-between"
									gap="sm"
									direction={{
										base: "column-reverse",
										sm: "row",
									}}
								>
									<Button
										variant="light"
										color="orange"
										size="md"
										radius="md"
										leftSection={
											<IconClipboard size={16} />
										}
										onClick={() =>
											setShowFeedbackForm(true)
										}
										disabled={
											!ntf?.selection_id || isLoading
										}
										fullWidth={isMobile}
									>
										Request changes
									</Button>
									<Button
										color="teal.7"
										size="md"
										radius="md"
										rightSection={
											<IconThumbUpFilled size={16} />
										}
										onClick={handleConfirmAssets}
										loading={isConfirming}
										disabled={
											!ntf?.selection_id || isLoading
										}
										fullWidth={isMobile}
									>
										Looks good — approve
									</Button>
								</Flex>
							</>
						)}
					</>
				)}
			</Stack>
		</Modal>
	);
}
