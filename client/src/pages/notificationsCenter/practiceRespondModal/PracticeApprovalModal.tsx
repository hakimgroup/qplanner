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
	Button,
	Group,
	Anchor,
	useMantineTheme,
	Badge,
	Checkbox,
	Radio,
} from "@mantine/core";
import { IconExternalLink, IconEye } from "@tabler/icons-react";
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

	const [selfPrint, setSelfPrint] = useState(false);
	// Which decision the practice selected in Step 2.
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

	// The review document link. `markup_link` is the review/markup doc; on the
	// very first awaitingApproval round only `assets_link` is populated, so we
	// fall back to it. Either way the practice always sees the same review UI.
	const reviewLink: string | undefined =
		ntf?.payload?.markup_link || ntf?.payload?.assets_link || undefined;
	const hasReviewLink = !!reviewLink;

	const isLoading = isConfirming || isSubmittingFeedback;

	const handleClose = () => {
		setSelfPrint(false);
		setOpenedThisSession(false);
		setSelectedAction(null);
		onClose();
	};

	const handleMarkupOpen = () => {
		if (!ntf?.selection_id) return;
		// Fire-and-forget telemetry; the link itself still opens via the Anchor.
		recordMarkupOpened(ntf.selection_id);
		setOpenedThisSession(true);
	};

	// Commit the Step 2 decision. Approve calls confirm_assets (honours the
	// self-print checkbox). Revise calls request_revision with a generic note;
	// the design team reads the practice's real comments off the review document.
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
					Artwork Confirmation Required
				</Text>
			}
		>
			<Stack gap="lg">
				{/* Campaign name */}
				<Text fz={"h4"} fw={600}>
					{ntf?.payload?.name}
				</Text>

				{/* Intro line */}
				<Text c="gray.7" size="sm">
					The artwork for{" "}
					<Text span fw={600} c="gray.9">
						{ntf?.payload?.name}
					</Text>{" "}
					is ready for your review and approval.
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
							Open the review document in a new tab. Leave any
							comments directly on the artwork — the design team can
							see them there.
						</Text>
						<Anchor
							href={reviewLink}
							target="_blank"
							rel="noopener noreferrer"
							underline="never"
							onClick={handleMarkupOpen}
							style={{
								pointerEvents: hasReviewLink ? "auto" : "none",
							}}
						>
							<StyledButton
								fullWidth
								variant="default"
								radius="md"
								leftSection={<IconEye size={18} />}
								rightSection={<IconExternalLink size={16} />}
								disabled={!hasReviewLink}
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
								<Text fw={600} size="sm" c="gray.9">
									Tell us what you think
								</Text>
							</Group>
							<Text size="xs" c="gray.7">
								Once you've reviewed,{" "}
								<Text span fw={600} c="gray.9">
									come back here
								</Text>{" "}
								and let us know whether to proceed or revise. The
								campaign stays parked until you choose.
							</Text>
						</Stack>

						<Radio.Group
							value={selectedAction ?? ""}
							onChange={(v) =>
								setSelectedAction(v as "approve" | "revise")
							}
						>
							<Stack gap="sm">
								<Radio.Card
									value="revise"
									radius="md"
									p="md"
									style={{
										backgroundColor: "white",
										borderColor:
											selectedAction === "revise"
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
											style={{ marginTop: 2 }}
										/>
										<Stack gap={4}>
											<Text fw={700} size="sm" c="gray.9">
												I have left changes on the review
												document
											</Text>
											<Text
												size="xs"
												c="gray.6"
												style={{ lineHeight: 1.5 }}
											>
												We will implement the changes you
												have requested on the review
												document and send you a
												notification when this is
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
										backgroundColor: "white",
										borderColor:
											selectedAction === "approve"
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
											style={{ marginTop: 2 }}
										/>
										<Stack gap={4}>
											<Text fw={700} size="sm" c="gray.9">
												Looks good - approve
											</Text>
											<Text
												size="xs"
												c="gray.6"
												style={{ lineHeight: 1.5 }}
											>
												Once approved, the design team
												will create the final files and
												they'll be made available on the
												planner. We'll send you a
												notification when this is
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
					onChange={(e) => setSelfPrint(e.currentTarget.checked)}
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
						disabled={!selectedAction || !ntf?.selection_id}
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
			</Stack>
		</Modal>
	);
}
