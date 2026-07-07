import StyledButton from "@/components/styledButton/StyledButton";
import {
	useConfirmAssets,
	useRequestRevision,
	useRecordMarkupOpened,
	useSelectionMarkupOpenedAt} from "@/hooks/notification.hooks";
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
	Title} from "@mantine/core";
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
	IconCheck,
	IconPencil} from "@tabler/icons-react";
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
	notification: ntf}: PracticeApprovalModalProps) {
	const T = useMantineTheme().colors;
	const isMobile = useIsMobile();

	// State for feedback view
	const [showFeedbackForm, setShowFeedbackForm] = useState(false);
	const [feedback, setFeedback] = useState("");
	const [selfPrint, setSelfPrint] = useState(false);

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
				}},
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
				}},
		);
	};

	// One-click revise for the markup path — matches the email UX. The design
	// team already has the practice's feedback on the markup file itself, so
	// the planner only needs to record the DECISION with a generic note.
	const handleRequestChangesDirect = () => {
		if (!ntf?.selection_id) return;
		requestRevision(
			{
				selectionId: ntf.selection_id,
				feedback:
					"Practice indicated changes were left on the markup file — see markup for details.",
			},
			{ onSuccess: () => onClose() },
		);
	};

	const handleClose = () => {
		setFeedback("");
		setShowFeedbackForm(false);
		setSelfPrint(false);
		setOpenedThisSession(false);
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
									backgroundColor: T.gray[0]}}}
						/>

						{/* Info text */}
						<Paper
							p="md"
							radius="md"
							style={{
								backgroundColor: T.orange[0],
								border: `1px solid ${T.orange[2]}`}}
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
										backgroundColor: T.gray[0]}}
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
										border: `1px solid ${T.teal[2]}`}}
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

						{/* ===== MARKUP VERSION UI — matches the reminder email's design ===== */}
						{showMarkupVersion && (
							<>
								{/* "Quick check-in" pill — same violet-light styling as the email badge */}
								<Group justify="center" mt={4}>
									<Badge
										variant="light"
										color="violet"
										size="lg"
										fw={700}
										radius="xl"
										tt="uppercase"
										styles={{
											label: {
												letterSpacing: 0.6,
												fontSize: 11,
											},
										}}
									>
										Quick check-in
									</Badge>
								</Group>

								{/* Big centered heading */}
								<Title
									order={2}
									ta="center"
									fz={22}
									fw={700}
									c="gray.9"
									style={{ lineHeight: 1.3 }}
								>
									What did you think of the{" "}
									{ntf?.payload?.name} artwork?
								</Title>

								{/* Contextual body paragraph */}
								<Text
									ta="center"
									size="sm"
									c="gray.7"
									style={{ lineHeight: 1.6 }}
								>
									Take a look at the markup file, then let us
									know whether the artwork's good to go — or if
									you've left changes for the design team.
								</Text>

								{/* Question box — violet-tinted with purple left border, mirrors email quote box */}
								<Paper
									p="md"
									radius="md"
									style={{
										backgroundColor: T.gray[0],
										border: `1px solid ${T.violet[2]}`,
										borderLeft: `4px solid ${T.violet[7]}`,
									}}
								>
									<Text
										size="md"
										fw={600}
										c="gray.9"
										style={{ lineHeight: 1.55 }}
									>
										Did you leave changes on the markup, or
										are you happy with it as-is?
									</Text>
								</Paper>

								{/* Self-print checkbox — placed here (above the buttons) to
								    match the original modal layout. Only affects the
								    Approve path (passed as p_self_print to confirm_assets). */}
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

								{/* Stacked decision buttons — same green + amber as the email */}
								<Stack gap="sm">
									<Button
										size="lg"
										fullWidth
										radius="md"
										leftSection={<IconCheck size={18} />}
										onClick={handleConfirmAssets}
										loading={isConfirming}
										disabled={
											!ntf?.selection_id || isLoading
										}
										fw={700}
										styles={{
											root: { backgroundColor: "#0f9466" },
										}}
									>
										Looks good — approve
									</Button>
									<Button
										size="lg"
										fullWidth
										radius="md"
										leftSection={<IconPencil size={18} />}
										onClick={handleRequestChangesDirect}
										loading={isSubmittingFeedback}
										disabled={
											!ntf?.selection_id || isLoading
										}
										fw={700}
										styles={{
											root: { backgroundColor: "#f59e0b" },
										}}
									>
										I've left changes on the markup
									</Button>
								</Stack>

								{/* Helper text under the buttons */}
								<Text
									ta="center"
									size="xs"
									c="gray.5"
									mt={-8}
								>
									One click sends this straight to the design team.
								</Text>

								<GradientDivider />

								{/* Tertiary — Open markup file (again if already opened) */}
								<Stack gap={8}>
									<Text size="sm" c="gray.7">
										{hasOpenedMarkup
											? "Want another look at the markup?"
											: "Take a look at the markup first:"}
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
												<IconExternalLink size={18} />
											}
											disabled={
												!ntf?.payload?.markup_link
											}
										>
											{hasOpenedMarkup
												? "Open markup file again"
												: "Open markup file"}
										</StyledButton>
									</Anchor>
								</Stack>

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
