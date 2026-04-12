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
import { useState, useMemo } from "react";
import { IconBolt, IconCheck } from "@tabler/icons-react";
import { useGodModeForceMarkRead } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { format, parseISO } from "date-fns";
import { startCase } from "lodash";

interface Props {
	opened: boolean;
	onClose: () => void;
	selection: any;
	notifications: any[];
}

const formatDateTime = (d?: string | null) => {
	if (!d) return "";
	try {
		return format(parseISO(d), "d MMM yyyy HH:mm");
	} catch {
		return d ?? "";
	}
};

export default function GodModeForceMarkReadModal({
	opened,
	onClose,
	selection,
	notifications,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeForceMarkRead();

	const options = useMemo(
		() =>
			[
				{ value: "all", label: "All notifications on this selection" },
			].concat(
				notifications.map((n) => ({
					value: n.id,
					label: `${startCase(n.type)} — ${formatDateTime(n.created_at)}`,
				}))
			),
		[notifications]
	);

	const [target, setTarget] = useState<string>("all");
	const [reason, setReason] = useState("");

	const handleClose = () => {
		setTarget("all");
		setReason("");
		onClose();
	};

	const handleSubmit = () => {
		mutate(
			{
				selectionId: selection.id,
				notificationId: target === "all" ? null : target,
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
						Force Mark As Read
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
					icon={<IconCheck size={14} />}
					color="green"
					variant="light"
					radius="md"
				>
					Marks notification targets as read for every user assigned to the
					notification(s). Useful when a user can't dismiss a stuck notification
					or after a manual fix.
				</Alert>

				<Select
					label="Which notifications to mark as read?"
					data={options}
					value={target}
					onChange={(v) => setTarget(v ?? "all")}
					radius="md"
				/>

				<GodModeReasonField value={reason} onChange={setReason} />

				<GradientDivider />

				<Group justify="space-between">
					<Button variant="subtle" color="gray" onClick={handleClose}>
						Cancel
					</Button>
					<Button color="violet" loading={isPending} onClick={handleSubmit}>
						Mark As Read
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
