import {
	Modal,
	Stack,
	Group,
	Button,
	TextInput,
	Text,
	useMantineTheme,

	Alert,
	Box,
	rgba,
} from "@mantine/core";
import { useState } from "react";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { useGodModeDeleteSelection } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";

interface Props {
	opened: boolean;
	onClose: () => void;
	selection: any;
	campaignName: string;
	onDeleted?: () => void;
}

export default function GodModeDeleteSelectionModal({
	opened,
	onClose,
	selection,
	campaignName,
	onDeleted,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeDeleteSelection();

	const [confirmText, setConfirmText] = useState("");
	const [reason, setReason] = useState("");

	const expected = "DELETE";
	const canConfirm = confirmText === expected;

	const handleClose = () => {
		setConfirmText("");
		setReason("");
		onClose();
	};

	const handleSubmit = () => {
		mutate(
			{ selectionId: selection.id, reason },
			{
				onSuccess: () => {
					setConfirmText("");
					setReason("");
					onDeleted?.();
				},
			}
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconTrash size={18} color={T.red[6]} />
					<Text fw={700} size="md" c="red.7">
						Delete Selection
					</Text>
				</Group>
			}
			size="lg"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			<Stack gap="md">
				<Alert
					icon={<IconAlertTriangle size={14} />}
					color="red"
					variant="light"
					radius="md"
					title="This action cannot be undone"
				>
					This will permanently delete the selection along with all its
					notifications, notification targets, and email logs. Status history
					and God Mode log entries will survive (with selection_id set to
					NULL) so the audit trail is preserved. A full snapshot of the
					selection will also be saved in the God Mode log for recoverability.
				</Alert>

				<Box
					p="md"
					style={{
						background: rgba(T.red[0], 0.5),
						borderRadius: 12,
						border: `1px solid ${rgba(T.red[3], 0.25)}`,
					}}
				>
					<Stack gap={4}>
						<Text size="xs" c="gray.6" fw={600} tt="uppercase">
							Selection
						</Text>
						<Text size="sm" fw={700}>
							{campaignName}
						</Text>
						<Text size="xs" c="gray.6" ff="monospace">
							{selection?.id}
						</Text>
					</Stack>
				</Box>

				<TextInput
					label={
						<Text size="sm">
							Type{" "}
							<Text span fw={700} c="red.7" ff="monospace">
								{expected}
							</Text>{" "}
							to confirm
						</Text>
					}
					value={confirmText}
					onChange={(e) => setConfirmText(e.currentTarget.value)}
					placeholder={expected}
					radius="md"
				/>

				<GodModeReasonField value={reason} onChange={setReason} />

				<GradientDivider />

				<Group justify="space-between">
					<Button variant="subtle" color="gray" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						color="red"
						loading={isPending}
						disabled={!canConfirm}
						onClick={handleSubmit}
						leftSection={<IconTrash size={14} />}
					>
						Delete Permanently
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
