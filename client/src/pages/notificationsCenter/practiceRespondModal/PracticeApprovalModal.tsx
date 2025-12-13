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
} from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";

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
					Artwork Confirmation Required
				</Text>
			}
		>
			<Stack gap="lg">
				{/* Campaign / name */}
				<Text fz={"h4"} fw={600}>
					{ntf.payload.name}
				</Text>

				{/* Descriptive copy */}
				<Text c="gray.7">
					Updated artwork for {ntf.payload.name} incorporating your
					feedback is ready for final approval.
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

				<Text size="sm" c="gray.6">
					Please click through on the link below to go to the markup
					file to do feedback on the artwork directly.
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
