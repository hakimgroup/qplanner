import {
	Modal,
	Stack,
	Group,
	Button,
	TextInput,
	Textarea,
	Text,
	useMantineTheme,

	Select,
	Box,
	rgba,
	Alert,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useState, useMemo, useEffect } from "react";
import { IconBolt, IconInfoCircle } from "@tabler/icons-react";
import { useGodModeUpdatePayloads } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import GodModeDiffPreview from "./GodModeDiffPreview";
import { startCase } from "lodash";
import { format, parseISO } from "date-fns";

interface Props {
	opened: boolean;
	onClose: () => void;
	selection: any;
	notifications: any[];
}

const toDate = (v: any): Date | null => {
	if (!v) return null;
	const d = new Date(v);
	return isNaN(d.getTime()) ? null : d;
};
const toDateStr = (d: Date | null): string | null => {
	if (!d) return null;
	return d.toISOString().slice(0, 10);
};

const formatDateTime = (d?: string | null) => {
	if (!d) return "";
	try {
		return format(parseISO(d), "d MMM yyyy HH:mm");
	} catch {
		return d ?? "";
	}
};

type FormState = {
	name: string;
	description: string;
	category: string;
	from_date: Date | null;
	to_date: Date | null;
	markup_link: string;
	assets_link: string;
	chosen_creative: string;
	note: string;
};

const EMPTY_FORM: FormState = {
	name: "",
	description: "",
	category: "",
	from_date: null,
	to_date: null,
	markup_link: "",
	assets_link: "",
	chosen_creative: "",
	note: "",
};

const fromPayload = (payload: any | null): FormState => {
	if (!payload) return { ...EMPTY_FORM };
	return {
		name: payload.name ?? "",
		description: payload.description ?? "",
		category: payload.category ?? "",
		from_date: toDate(payload.from_date),
		to_date: toDate(payload.to_date),
		markup_link: payload.markup_link ?? "",
		assets_link: payload.assets_link ?? "",
		chosen_creative: payload.chosen_creative ?? "",
		note: payload.note ?? "",
	};
};

export default function GodModeEditPayloadsModal({
	opened,
	onClose,
	selection,
	notifications,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeUpdatePayloads();

	// Build dropdown options — one per notification, label includes type + timestamp
	// so the user knows which one they're editing
	const stageOptions = useMemo(
		() =>
			notifications.map((n) => ({
				value: n.id,
				label: `${startCase(n.type)} — ${formatDateTime(n.created_at)}`,
				type: n.type,
			})),
		[notifications]
	);

	const [notificationId, setNotificationId] = useState<string | null>(null);
	const [form, setForm] = useState<FormState>(EMPTY_FORM);
	const [reason, setReason] = useState("");
	const [confirming, setConfirming] = useState(false);

	// The notification + its payload that we're editing
	const selectedNotif = useMemo(
		() => notifications.find((n) => n.id === notificationId) ?? null,
		[notificationId, notifications]
	);
	const originalPayload = selectedNotif?.payload ?? null;

	// Pre-populate form when stage changes
	useEffect(() => {
		if (notificationId) {
			setForm(fromPayload(originalPayload));
		} else {
			setForm(EMPTY_FORM);
		}
	}, [notificationId, originalPayload]);

	// Compute diff: only fields that differ from the original payload
	const { patch, before } = useMemo(() => {
		const p: Record<string, any> = {};
		const b: Record<string, any> = {};
		if (!originalPayload) return { patch: p, before: b };

		const compare = (key: keyof FormState, payloadKey: string) => {
			const formVal = form[key];
			let normalized: any;
			if (key === "from_date" || key === "to_date") {
				normalized = toDateStr(formVal as Date | null);
			} else {
				normalized = (formVal as string)?.trim() === "" ? null : formVal;
			}
			const origVal = originalPayload[payloadKey] ?? null;
			if (normalized !== origVal) {
				p[payloadKey] = normalized;
				b[payloadKey] = origVal;
			}
		};

		compare("name", "name");
		compare("description", "description");
		compare("category", "category");
		compare("from_date", "from_date");
		compare("to_date", "to_date");
		compare("markup_link", "markup_link");
		compare("assets_link", "assets_link");
		compare("chosen_creative", "chosen_creative");
		compare("note", "note");

		return { patch: p, before: b };
	}, [form, originalPayload]);

	const hasChanges = Object.keys(patch).length > 0;
	const canProceed = !!selectedNotif && hasChanges;

	const handleClose = () => {
		setNotificationId(null);
		setForm(EMPTY_FORM);
		setReason("");
		setConfirming(false);
		onClose();
	};

	const handleSubmit = () => {
		if (!selectedNotif) return;
		mutate(
			{
				selectionId: selection.id,
				notificationTypes: [selectedNotif.type],
				payloadPatch: patch,
				reason,
			},
			{ onSuccess: () => handleClose() }
		);
	};

	const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconBolt size={18} color={T.violet[6]} />
					<Text fw={700} size="md">
						{confirming ? "Confirm Payload Patch" : "Edit Notification Payloads"}
					</Text>
				</Group>
			}
			size="xl"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			{!confirming ? (
				<Stack gap="md">
					<Alert
						icon={<IconInfoCircle size={14} />}
						color="violet"
						variant="light"
						radius="md"
					>
						Each notification has its own payload snapshot used by modals/UI,
						and is also consumed by downstream automations (Trello, n8n,
						Airtable) which read the same payload to surface campaign details.
						Pick the stage you want to patch — the form is pre-populated with
						its current payload values. Edit any field, and only the changed
						ones will be merged in.
					</Alert>

					<Select
						label="Notification stage"
						description="Pick a notification on this selection — fields below will be pre-filled with its payload"
						data={stageOptions}
						value={notificationId}
						onChange={setNotificationId}
						placeholder="Select a notification…"
						radius="md"
						searchable
						clearable
						nothingFoundMessage="No notifications on this selection"
						required
					/>

					{selectedNotif && (
						<>
							<GradientDivider label="Payload fields" />

							<TextInput
								label="Name (campaign name)"
								value={form.name}
								onChange={(e) => updateField("name", e.currentTarget.value)}
								radius="md"
							/>
							<TextInput
								label="Category"
								value={form.category}
								onChange={(e) => updateField("category", e.currentTarget.value)}
								radius="md"
							/>
							<Textarea
								label="Description"
								value={form.description}
								onChange={(e) =>
									updateField("description", e.currentTarget.value)
								}
								radius="md"
								autosize
								minRows={2}
								maxRows={4}
							/>
							<Group grow>
								<DateInput
									label="From Date"
									value={form.from_date}
									onChange={(v) => updateField("from_date", v)}
									valueFormat="DD MMM YYYY"
									radius="md"
									clearable
								/>
								<DateInput
									label="To Date"
									value={form.to_date}
									onChange={(v) => updateField("to_date", v)}
									valueFormat="DD MMM YYYY"
									radius="md"
									clearable
								/>
							</Group>
							<TextInput
								label="Markup Link"
								value={form.markup_link}
								onChange={(e) =>
									updateField("markup_link", e.currentTarget.value)
								}
								placeholder="https://..."
								radius="md"
							/>
							<TextInput
								label="Assets Link"
								value={form.assets_link}
								onChange={(e) =>
									updateField("assets_link", e.currentTarget.value)
								}
								placeholder="https://..."
								radius="md"
							/>
							<TextInput
								label="Chosen Creative URL"
								value={form.chosen_creative}
								onChange={(e) =>
									updateField("chosen_creative", e.currentTarget.value)
								}
								placeholder="https://..."
								radius="md"
							/>
							<TextInput
								label="Step note"
								value={form.note}
								onChange={(e) => updateField("note", e.currentTarget.value)}
								radius="md"
							/>
						</>
					)}

					<GradientDivider />

					<Group justify="space-between">
						<Button variant="subtle" color="gray" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							color="violet"
							disabled={!canProceed}
							onClick={() => setConfirming(true)}
						>
							Review Patch
						</Button>
					</Group>
				</Stack>
			) : (
				<Stack gap="md">
					<Box
						p="md"
						style={{
							background: rgba(T.violet[0], 0.5),
							borderRadius: 12,
							border: `1px solid ${rgba(T.violet[3], 0.25)}`,
						}}
					>
						<Text size="sm" c="gray.7">
							Patching <strong>{Object.keys(patch).length}</strong> field
							{Object.keys(patch).length === 1 ? "" : "s"} on the{" "}
							<Text span c="violet.8" fw={600}>
								{selectedNotif ? startCase(selectedNotif.type) : ""}
							</Text>{" "}
							notification.
						</Text>
					</Box>

					<GodModeDiffPreview before={before} after={patch} />

					<GodModeReasonField value={reason} onChange={setReason} />

					<GradientDivider />

					<Group justify="space-between">
						<Button
							variant="subtle"
							color="gray"
							onClick={() => setConfirming(false)}
							disabled={isPending}
						>
							Back
						</Button>
						<Button color="violet" loading={isPending} onClick={handleSubmit}>
							Apply Patch
						</Button>
					</Group>
				</Stack>
			)}
		</Modal>
	);
}
