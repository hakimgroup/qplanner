import {
	Modal,
	Stack,
	Group,
	Button,
	Text,
	useMantineTheme,

	Select,
	MultiSelect,
	TextInput,
	Alert,
	Box,
	rgba,
	ActionIcon,
} from "@mantine/core";
import { useState, useMemo } from "react";
import { IconBolt, IconMailForward, IconPlus, IconTrash } from "@tabler/icons-react";
import { useGodModeResendEmail } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { format, parseISO } from "date-fns";
import { startCase } from "lodash";

interface Props {
	opened: boolean;
	onClose: () => void;
	selection: any;
	notifications: any[];
	practiceMembers: Array<{
		user_id: string;
		email: string;
		role: string;
		first_name: string | null;
		last_name: string | null;
	}>;
}

const formatDateTime = (d?: string | null) => {
	if (!d) return "";
	try {
		return format(parseISO(d), "d MMM yyyy HH:mm");
	} catch {
		return d ?? "";
	}
};

const SUPPORTED_TYPES = new Set([
	"requested",
	"inProgress",
	"awaitingApproval",
	"confirmed",
	"feedbackRequested",
]);

export default function GodModeResendEmailModal({
	opened,
	onClose,
	selection,
	notifications,
	practiceMembers,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeResendEmail();

	// Pick a notification — show only ones with a known email template
	const notifOptions = useMemo(
		() =>
			notifications
				.filter((n) => SUPPORTED_TYPES.has(n.type))
				.map((n) => ({
					value: n.id,
					label: `${startCase(n.type)} — ${formatDateTime(n.created_at)}`,
				})),
		[notifications]
	);

	const [notificationId, setNotificationId] = useState<string | null>(
		notifOptions[0]?.value ?? null
	);

	const selectedNotif = useMemo(
		() => notifications.find((n) => n.id === notificationId) ?? null,
		[notificationId, notifications]
	);

	// Recipient pool: practice members for practice-audience, otherwise free input only
	const memberOptions = useMemo(
		() =>
			practiceMembers
				.filter((m) => m.email)
				.map((m) => ({
					value: m.email,
					label: `${[m.first_name, m.last_name].filter(Boolean).join(" ") || m.email} (${m.email})`,
				})),
		[practiceMembers]
	);

	const [pickedMembers, setPickedMembers] = useState<string[]>([]);
	const [extraEmail, setExtraEmail] = useState("");
	const [extraEmails, setExtraEmails] = useState<string[]>([]);
	const [reason, setReason] = useState("");

	const allRecipients = useMemo(
		() => Array.from(new Set([...pickedMembers, ...extraEmails])),
		[pickedMembers, extraEmails]
	);

	const addExtra = () => {
		const t = extraEmail.trim();
		if (!t) return;
		if (!t.includes("@")) return;
		setExtraEmails((prev) => Array.from(new Set([...prev, t])));
		setExtraEmail("");
	};

	const removeExtra = (e: string) => {
		setExtraEmails((prev) => prev.filter((x) => x !== e));
	};

	const handleClose = () => {
		setNotificationId(notifOptions[0]?.value ?? null);
		setPickedMembers([]);
		setExtraEmail("");
		setExtraEmails([]);
		setReason("");
		onClose();
	};

	const handleSubmit = () => {
		if (!notificationId || allRecipients.length === 0) return;
		mutate(
			{
				selectionId: selection.id,
				notificationId,
				recipientEmails: allRecipients,
				reason,
			},
			{ onSuccess: () => handleClose() }
		);
	};

	const canSend = !!notificationId && allRecipients.length > 0;

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconBolt size={18} color={T.violet[6]} />
					<Text fw={700} size="md">
						Resend Notification Email
					</Text>
				</Group>
			}
			size="lg"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			<Stack gap="md">
				<Alert icon={<IconMailForward size={14} />} color="blue" variant="light" radius="md">
					Pick which notification to resend and which recipients should receive
					it. The email uses the notification's saved payload as its content.
				</Alert>

				<Select
					label="Notification"
					data={notifOptions}
					value={notificationId}
					onChange={(v) => setNotificationId(v)}
					placeholder="Pick a notification"
					radius="md"
					nothingFoundMessage="No supported notifications on this selection"
					required
				/>

				{selectedNotif && (
					<Box
						p="sm"
						style={{
							background: rgba(T.violet[0], 0.5),
							borderRadius: 10,
							border: `1px solid ${rgba(T.violet[3], 0.25)}`,
						}}
					>
						<Text size="xs" c="gray.7">
							<strong>{startCase(selectedNotif.type)}</strong> — audience:{" "}
							<strong>{selectedNotif.audience}</strong>
						</Text>
					</Box>
				)}

				<MultiSelect
					label="Recipients from practice members"
					description="The currently assigned practice members"
					data={memberOptions}
					value={pickedMembers}
					onChange={setPickedMembers}
					placeholder="Pick practice members"
					radius="md"
					searchable
					clearable
					nothingFoundMessage="No practice members"
				/>

				<Stack gap={4}>
					<Text size="sm" fw={500}>
						Extra recipients
					</Text>
					<Text size="xs" c="gray.6">
						Add any extra email addresses (e.g. admins, ad-hoc recipients)
					</Text>
					<Group gap={6}>
						<TextInput
							style={{ flex: 1 }}
							value={extraEmail}
							onChange={(e) => setExtraEmail(e.currentTarget.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addExtra();
								}
							}}
							placeholder="someone@example.com"
							radius="md"
						/>
						<Button
							variant="light"
							color="violet"
							leftSection={<IconPlus size={14} />}
							onClick={addExtra}
						>
							Add
						</Button>
					</Group>
					{extraEmails.length > 0 && (
						<Stack gap={4} mt={4}>
							{extraEmails.map((e) => (
								<Group
									key={e}
									justify="space-between"
									p="xs"
									style={{
										background: rgba(T.violet[0], 0.5),
										borderRadius: 8,
										border: `1px solid ${rgba(T.violet[3], 0.25)}`,
									}}
								>
									<Text size="xs">{e}</Text>
									<ActionIcon
										color="red"
										variant="subtle"
										size="sm"
										onClick={() => removeExtra(e)}
									>
										<IconTrash size={12} />
									</ActionIcon>
								</Group>
							))}
						</Stack>
					)}
				</Stack>

				<Box
					p="sm"
					style={{
						background: rgba(T.teal[0], 0.5),
						borderRadius: 10,
						border: `1px solid ${rgba(T.teal[3], 0.25)}`,
					}}
				>
					<Text size="xs" c="teal.8" fw={600}>
						Will send to {allRecipients.length} unique recipient
						{allRecipients.length === 1 ? "" : "s"}
					</Text>
				</Box>

				<GodModeReasonField value={reason} onChange={setReason} />

				<GradientDivider />

				<Group justify="space-between">
					<Button variant="subtle" color="gray" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						color="violet"
						loading={isPending}
						disabled={!canSend}
						onClick={handleSubmit}
						leftSection={<IconMailForward size={14} />}
					>
						Resend Email
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
