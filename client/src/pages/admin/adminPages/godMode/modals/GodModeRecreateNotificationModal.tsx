import {
	Modal,
	Stack,
	Group,
	Button,
	Select,
	Text,
	useMantineTheme,

	Alert,
} from "@mantine/core";
import { useState } from "react";
import { IconBolt, IconInfoCircle } from "@tabler/icons-react";
import { useGodModeRecreateNotification } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";

interface Props {
	opened: boolean;
	onClose: () => void;
	selection: any;
}

const TYPE_OPTIONS = [
	{ label: "Requested → practice", value: "requested|practice" },
	{ label: "In Progress → admins", value: "inProgress|admins" },
	{ label: "Awaiting Approval → practice", value: "awaitingApproval|practice" },
	{ label: "Confirmed → admins", value: "confirmed|admins" },
	{ label: "Feedback Requested → admins", value: "feedbackRequested|admins" },
];

export default function GodModeRecreateNotificationModal({
	opened,
	onClose,
	selection,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeRecreateNotification();

	const [combo, setCombo] = useState<string>(TYPE_OPTIONS[0].value);
	const [reason, setReason] = useState("");

	const [type, audience] = combo.split("|") as [string, "practice" | "admins"];

	const handleClose = () => {
		setCombo(TYPE_OPTIONS[0].value);
		setReason("");
		onClose();
	};

	const handleSubmit = () => {
		mutate(
			{
				selectionId: selection.id,
				notificationType: type,
				audience,
				payload: null, // RPC builds default payload from selection state
				reason,
			},
			{ onSuccess: () => handleClose() }
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconBolt size={18} color={T.violet[6]} />
					<Text fw={700} size="md">
						Recreate Notification
					</Text>
				</Group>
			}
			size="md"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			<Stack gap="md">
				<Alert
					icon={<IconInfoCircle size={14} />}
					color="blue"
					variant="light"
					radius="md"
				>
					Creates a brand-new notification for the selected stage using the
					current selection state. Targets are auto-built (practice members
					for "practice", all admins for "admins"). <strong>No email is
					sent</strong> — use Resend Email if you want one.
				</Alert>

				<Select
					label="Notification stage & audience"
					data={TYPE_OPTIONS}
					value={combo}
					onChange={(v) => setCombo(v ?? TYPE_OPTIONS[0].value)}
					radius="md"
				/>

				<GodModeReasonField value={reason} onChange={setReason} />

				<GradientDivider />

				<Group justify="space-between">
					<Button variant="subtle" color="gray" onClick={handleClose}>
						Cancel
					</Button>
					<Button color="violet" loading={isPending} onClick={handleSubmit}>
						Create Notification
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
