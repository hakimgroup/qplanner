import StyledButton from "@/components/styledButton/StyledButton";
import {
	useConfirmAssets,
	useRequestRevision,
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
	Divider,
	ThemeIcon,
	Textarea,
} from "@mantine/core";
import {
	IconExternalLink,
	IconCalendar,
	IconCategory,
	IconSparkles,
	IconThumbUpFilled,
	IconClipboard,
	IconArrowLeft,
	IconSend,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { useState } from "react";

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

	// State for feedback view
	const [showFeedbackForm, setShowFeedbackForm] = useState(false);
	const [feedback, setFeedback] = useState("");

	const { mutate: confirmAssets, isPending: isConfirming } =
		useConfirmAssets();
	const { mutate: requestRevision, isPending: isSubmittingFeedback } =
		useRequestRevision();

	const handleConfirmAssets = () => {
		if (!ntf?.selection_id) return;
		confirmAssets(
			{ selectionId: ntf.selection_id },
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

	const handleClose = () => {
		setFeedback("");
		setShowFeedbackForm(false);
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
												<Divider color="gray.2" />
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

						{/* ===== MARKUP VERSION UI (existing) ===== */}
						{showMarkupVersion && (
							<>
								{/* Campaign / name */}
								<Text fz={"h4"} fw={600}>
									{ntf?.payload?.name}
								</Text>

								{/* Descriptive copy */}
								<Text c="gray.7">
									Updated artwork for {ntf?.payload?.name}{" "}
									incorporating your feedback is ready for
									final approval.
								</Text>

								{/* Artwork Preview */}
								<Stack gap={6}>
									<Text fw={700} size="sm" c="blue.3">
										Artwork Preview
									</Text>

									<Paper
										radius="lg"
										style={{
											backgroundColor: "white",
										}}
									>
										{ntf?.payload?.chosen_creative ? (
											<Image
												src={
													ntf.payload.chosen_creative
												}
												alt="Campaign artwork"
												radius="md"
												fit="contain"
												h={180}
											/>
										) : (
											<Box
												style={{
													height: 80,
													borderRadius: 10,
													backgroundColor: T.gray[0],
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<Text size="sm" c="gray.5">
													No preview available
												</Text>
											</Box>
										)}
									</Paper>
								</Stack>

								{/* Instruction text */}
								<Text size="sm" c="gray.6">
									Please click through on the link below to go
									to the markup file to do feedback on the
									artwork directly.
								</Text>

								{/* Markup link */}
								<Anchor
									href={
										ntf?.payload?.markup_link ?? undefined
									}
									target="_blank"
									rel="noopener noreferrer"
									underline="never"
									style={{
										pointerEvents: ntf?.payload?.markup_link
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
										disabled={!ntf?.payload?.markup_link}
									>
										Open Markup File for Feedback
									</StyledButton>
								</Anchor>
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

						{/* Actions */}
						<Flex align={"center"} justify={"space-between"}>
							<Button
								color="teal.7"
								rightSection={<IconThumbUpFilled size={14} />}
								onClick={handleConfirmAssets}
								loading={isConfirming}
								disabled={!ntf?.selection_id || isLoading}
							>
								Confirm Assets
							</Button>
							<Button
								variant="light"
								color="orange.9"
								rightSection={<IconClipboard size={14} />}
								onClick={() => setShowFeedbackForm(true)}
								disabled={!ntf?.selection_id || isLoading}
							>
								Leave Feedback
							</Button>
						</Flex>
					</>
				)}
			</Stack>
		</Modal>
	);
}
