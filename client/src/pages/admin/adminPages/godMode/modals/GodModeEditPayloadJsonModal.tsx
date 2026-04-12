import {
	Modal,
	Stack,
	Group,
	Button,
	Text,
	useMantineTheme,

	Textarea,
	Alert,
	Box,
	rgba,
	Badge,
} from "@mantine/core";
import { useState, useMemo, useEffect } from "react";
import { IconBolt, IconAlertTriangle, IconCode } from "@tabler/icons-react";
import { useGodModeReplacePayload } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { startCase } from "lodash";

interface Props {
	opened: boolean;
	onClose: () => void;
	notification: any;
	selectionId: string;
}

const stringify = (v: any): string => {
	try {
		return JSON.stringify(v ?? {}, null, 2);
	} catch {
		return "{}";
	}
};

export default function GodModeEditPayloadJsonModal({
	opened,
	onClose,
	notification,
	selectionId,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeReplacePayload();

	const original = useMemo(() => stringify(notification?.payload), [notification]);
	const [text, setText] = useState<string>(original);
	const [reason, setReason] = useState<string>("");

	// Reset text when the notification changes (e.g., switching between accordion items)
	useEffect(() => {
		if (opened) {
			setText(stringify(notification?.payload));
			setReason("");
		}
	}, [opened, notification]);

	const parsed = useMemo(() => {
		try {
			const obj = JSON.parse(text);
			if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
				return { ok: false, value: null, error: "Payload must be a JSON object" };
			}
			return { ok: true, value: obj, error: null };
		} catch (e: any) {
			return { ok: false, value: null, error: e.message };
		}
	}, [text]);

	const isUnchanged = text.trim() === original.trim();
	const canSave = parsed.ok && !isUnchanged;

	const handleClose = () => {
		setText(original);
		setReason("");
		onClose();
	};

	const handleSave = () => {
		if (!parsed.ok || !parsed.value) return;
		mutate(
			{
				notificationId: notification.id,
				selectionId,
				newPayload: parsed.value,
				reason,
			},
			{ onSuccess: () => handleClose() }
		);
	};

	const formatJson = () => {
		if (parsed.ok && parsed.value) {
			setText(JSON.stringify(parsed.value, null, 2));
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconBolt size={18} color={T.violet[6]} />
					<Text fw={700} size="md">
						Edit Notification Payload (JSON)
					</Text>
					{notification?.type && (
						<Badge size="sm" variant="light" color="violet" radius="sm">
							{startCase(notification.type)}
						</Badge>
					)}
				</Group>
			}
			size="xl"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			<Stack gap="md">
				<Alert
					icon={<IconAlertTriangle size={14} />}
					color="orange"
					variant="light"
					radius="md"
				>
					This <strong>fully replaces</strong> this notification's payload
					with whatever JSON you save here. The previous payload is captured
					in the God Mode log so it can be referenced later.
				</Alert>

				<Box
					p="sm"
					style={{
						background: rgba(T.gray[0], 0.7),
						borderRadius: 10,
						border: `1px solid ${rgba(T.violet[3], 0.25)}`,
					}}
				>
					<Stack gap={6}>
						<Group justify="space-between" align="center">
							<Group gap={6}>
								<IconCode size={14} color={T.violet[6]} />
								<Text size="xs" c="gray.7" fw={600}>
									Payload JSON
								</Text>
							</Group>
							<Group gap={6}>
								<Button
									size="xs"
									variant="subtle"
									color="gray"
									onClick={formatJson}
									disabled={!parsed.ok}
								>
									Format
								</Button>
								<Button
									size="xs"
									variant="subtle"
									color="gray"
									onClick={() => setText(original)}
									disabled={isUnchanged}
								>
									Reset
								</Button>
							</Group>
						</Group>
						<Textarea
							value={text}
							onChange={(e) => setText(e.currentTarget.value)}
							autosize
							minRows={14}
							maxRows={24}
							styles={{
								input: {
									fontFamily: "ui-monospace, SFMono-Regular, monospace",
									fontSize: 12,
									backgroundColor: "white",
								},
							}}
							radius="md"
						/>
					</Stack>
				</Box>

				{!parsed.ok && (
					<Alert color="red" variant="light" radius="md">
						<Text size="xs" c="red.8" ff="monospace">
							{parsed.error}
						</Text>
					</Alert>
				)}

				<GodModeReasonField value={reason} onChange={setReason} />

				<GradientDivider />

				<Group justify="space-between">
					<Button variant="subtle" color="gray" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						color="violet"
						loading={isPending}
						disabled={!canSave}
						onClick={handleSave}
					>
						Save Payload
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
