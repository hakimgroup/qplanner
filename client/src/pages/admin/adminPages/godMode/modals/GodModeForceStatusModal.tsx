import {
	Modal,
	Stack,
	Group,
	Button,
	Select,
	Switch,
	Text,
	useMantineTheme,

	Alert,
	Badge,
	Box,
	rgba,
} from "@mantine/core";
import { useState } from "react";
import {
	IconBolt,
	IconAlertTriangle,
	IconArrowRight,
} from "@tabler/icons-react";
import { useGodModeForceStatus } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { startCase } from "lodash";
import { statusColors } from "@/shared/shared.const";

interface Props {
	opened: boolean;
	onClose: () => void;
	selection: any;
}

const STATUS_OPTIONS = [
	{ label: "On Plan", value: "onPlan" },
	{ label: "Requested", value: "requested" },
	{ label: "In Progress", value: "inProgress" },
	{ label: "Awaiting Approval", value: "awaitingApproval" },
	{ label: "Confirmed", value: "confirmed" },
	{ label: "Live", value: "live" },
	{ label: "Completed", value: "completed" },
];

const NOTIFICATION_STAGES = new Set([
	"requested",
	"inProgress",
	"awaitingApproval",
	"confirmed",
]);

export default function GodModeForceStatusModal({
	opened,
	onClose,
	selection,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeForceStatus();

	const currentStatus = selection?.status;
	const [target, setTarget] = useState<string>(currentStatus ?? "onPlan");
	const [createNotification, setCreateNotification] = useState(false);
	const [reason, setReason] = useState("");

	const handleClose = () => {
		setTarget(currentStatus ?? "onPlan");
		setCreateNotification(false);
		setReason("");
		onClose();
	};

	const handleSubmit = () => {
		mutate(
			{
				selectionId: selection.id,
				targetStatus: target,
				createNotification,
				silent: !createNotification,
				reason,
			},
			{ onSuccess: () => handleClose() }
		);
	};

	const fromColor =
		(statusColors as any)[currentStatus] ?? T.gray[6];
	const toColor = (statusColors as any)[target] ?? T.gray[6];
	const noChange = target === currentStatus;
	const willCreateNotif = createNotification && NOTIFICATION_STAGES.has(target);

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconBolt size={18} color={T.violet[6]} />
					<Text fw={700} size="md">
						Force Status Transition
					</Text>
				</Group>
			}
			size="lg"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			<Stack gap="md">
				<Box
					p="md"
					style={{
						background: rgba(T.violet[0], 0.5),
						borderRadius: 12,
						border: `1px solid ${rgba(T.violet[3], 0.25)}`,
					}}
				>
					<Group gap="md" align="center" justify="center">
						<Badge
							size="lg"
							radius="sm"
							style={{
								background: rgba(fromColor, 0.12),
								color: fromColor,
							}}
						>
							{startCase(currentStatus ?? "—")}
						</Badge>
						<IconArrowRight size={18} color={T.gray[5]} />
						<Badge
							size="lg"
							radius="sm"
							style={{
								background: rgba(toColor, 0.12),
								color: toColor,
							}}
						>
							{startCase(target)}
						</Badge>
					</Group>
				</Box>

				<Select
					label="Target status"
					data={STATUS_OPTIONS}
					value={target}
					onChange={(v) => setTarget(v ?? "onPlan")}
					radius="md"
				/>

				<Switch
					label="Also create a notification for this stage"
					description={
						NOTIFICATION_STAGES.has(target)
							? "When ON, a fresh notification will be created (and targeted) for the appropriate audience. When OFF (default), the status changes silently with no notifications or emails."
							: `Stage "${startCase(target)}" doesn't normally have a notification — this toggle will be ignored.`
					}
					checked={createNotification}
					onChange={(e) => setCreateNotification(e.currentTarget.checked)}
					color="violet"
					disabled={!NOTIFICATION_STAGES.has(target)}
				/>

				<Alert
					icon={<IconAlertTriangle size={14} />}
					color={willCreateNotif ? "orange" : "blue"}
					variant="light"
					radius="md"
				>
					{willCreateNotif ? (
						<>
							A new notification will be created and visible to the{" "}
							{target === "inProgress" ||
							target === "confirmed" ||
							target === "feedbackRequested"
								? "admin team"
								: "practice users"}
							. <strong>No email will be sent</strong> automatically — use
							"Resend Email" if you want them notified by email too.
						</>
					) : (
						<>
							This will be a <strong>silent</strong> status change. No
							notification, no email. Status history will record it as a
							God Mode action.
						</>
					)}
				</Alert>

				<GodModeReasonField value={reason} onChange={setReason} />

				<GradientDivider />

				<Group justify="space-between">
					<Button variant="subtle" color="gray" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						color="violet"
						loading={isPending}
						disabled={noChange}
						onClick={handleSubmit}
					>
						Force Status
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
