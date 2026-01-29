import StyledButton from "@/components/styledButton/StyledButton";
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
} from "@mantine/core";
import {
	IconExternalLink,
	IconCalendar,
	IconCategory,
	IconSparkles,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";

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

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			size="lg"
			radius="lg"
			trapFocus
			withCloseButton
			overlayProps={{ backgroundOpacity: 0.65, blur: 4 }}
			title={
				<Text fz={"h4"} fw={600}>
					{showAssetsVersion
						? "Assets Ready for Review"
						: "Artwork Confirmation Required"}
				</Text>
			}
		>
			<Stack gap="lg">
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
									Your campaign assets are ready for review
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
												<IconCategory size={12} />
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
										<Text size="sm" c="gray.9" fw={500}>
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
									<Text size="sm" c="gray.6" ta="center">
										View your campaign assets and approve or
										request changes
									</Text>
								</Stack>
								<Anchor
									href={
										ntf?.payload?.assets_link ?? undefined
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
											<IconExternalLink size={18} />
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
							incorporating your feedback is ready for final
							approval.
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
										src={ntf.payload.chosen_creative}
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
							Please click through on the link below to go to the
							markup file to do feedback on the artwork directly.
						</Text>

						{/* Markup link */}
						<Anchor
							href={ntf?.payload?.markup_link ?? undefined}
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
								leftSection={<IconExternalLink size={18} />}
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
				<Group justify="flex-end" mt="xs">
					<StyledButton variant="default" onClick={onClose}>
						Close
					</StyledButton>
					<Button onClick={() => {}}>Mark as Reviewed</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
