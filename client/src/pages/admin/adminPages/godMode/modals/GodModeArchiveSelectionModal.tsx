import {
	Modal,
	Stack,
	Group,
	Button,
	Text,
	useMantineTheme,

	Alert,
	Box,
	rgba,
} from "@mantine/core";
import { useState } from "react";
import { IconArchive, IconInfoCircle } from "@tabler/icons-react";
import { useGodModeArchiveSelection } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";

interface Props {
	opened: boolean;
	onClose: () => void;
	selection: any;
	campaignName: string;
	onArchived?: () => void;
}

export default function GodModeArchiveSelectionModal({
	opened,
	onClose,
	selection,
	campaignName,
	onArchived,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeArchiveSelection();

	const [reason, setReason] = useState("");

	const handleClose = () => {
		setReason("");
		onClose();
	};

	const handleSubmit = () => {
		mutate(
			{ selectionId: selection.id, reason },
			{
				onSuccess: () => {
					setReason("");
					onArchived?.();
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
					<IconArchive size={18} color={T.orange[6]} />
					<Text fw={700} size="md" c="orange.7">
						Archive Selection
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
					icon={<IconInfoCircle size={14} />}
					color="orange"
					variant="light"
					radius="md"
					title="This removes the selection from active views"
				>
					A snapshot of the selection will be inserted into{" "}
					<strong>archived_selections</strong>, then the original selection
					will be deleted along with its notifications, notification targets,
					and email logs. Status history and God Mode log entries are kept.
				</Alert>

				<Box
					p="md"
					style={{
						background: rgba(T.orange[0], 0.5),
						borderRadius: 12,
						border: `1px solid ${rgba(T.orange[3], 0.25)}`,
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

				<GodModeReasonField value={reason} onChange={setReason} />

				<GradientDivider />

				<Group justify="space-between">
					<Button variant="subtle" color="gray" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						color="orange"
						loading={isPending}
						onClick={handleSubmit}
						leftSection={<IconArchive size={14} />}
					>
						Archive Selection
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
