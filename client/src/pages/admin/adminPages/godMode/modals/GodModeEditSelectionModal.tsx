import {
	Modal,
	Stack,
	Group,
	Button,
	TextInput,
	Select,
	Switch,
	Textarea,
	Text,
	useMantineTheme,
	Box,

	Alert,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useState, useMemo } from "react";
import { IconBolt, IconAlertTriangle } from "@tabler/icons-react";
import { useGodModeUpdateSelection } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import GodModeDiffPreview from "./GodModeDiffPreview";

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

const toDate = (v: string | null | undefined): Date | null => {
	if (!v) return null;
	const d = new Date(v);
	return isNaN(d.getTime()) ? null : d;
};

const toDateStr = (d: Date | null): string | null => {
	if (!d) return null;
	return d.toISOString().slice(0, 10);
};

export default function GodModeEditSelectionModal({
	opened,
	onClose,
	selection,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeUpdateSelection();

	const [status, setStatus] = useState<string>(selection?.status ?? "onPlan");
	const [fromDate, setFromDate] = useState<Date | null>(
		toDate(selection?.from_date)
	);
	const [toDateValue, setToDateValue] = useState<Date | null>(
		toDate(selection?.to_date)
	);
	const [notes, setNotes] = useState<string>(selection?.notes ?? "");
	const [selfPrint, setSelfPrint] = useState<boolean>(!!selection?.self_print);
	const [markupLink, setMarkupLink] = useState<string>(
		selection?.markup_link ?? ""
	);
	const [assetsLink, setAssetsLink] = useState<string>(
		selection?.assets_link ?? ""
	);
	const [reason, setReason] = useState<string>("");
	const [confirming, setConfirming] = useState(false);

	// Stage-aware field gating
	const currentStatus = selection?.status as string | undefined;
	const artworkStages = [
		"awaitingApproval",
		"confirmed",
		"live",
		"completed",
	];
	const confirmedStages = ["confirmed", "live", "completed"];
	const canEditArtworkLinks = artworkStages.includes(currentStatus ?? "");
	const canEditSelfPrint = confirmedStages.includes(currentStatus ?? "");

	const patch = useMemo(() => {
		const p: Record<string, any> = {};
		if (status !== selection?.status) p.status = status;
		const fd = toDateStr(fromDate);
		if (fd !== (selection?.from_date ?? null)) p.from_date = fd;
		const td = toDateStr(toDateValue);
		if (td !== (selection?.to_date ?? null)) p.to_date = td;
		if ((notes || null) !== (selection?.notes ?? null))
			p.notes = notes || null;
		// only include gated fields when their stage allows it
		if (canEditSelfPrint && selfPrint !== !!selection?.self_print)
			p.self_print = selfPrint;
		if (
			canEditArtworkLinks &&
			(markupLink || null) !== (selection?.markup_link ?? null)
		)
			p.markup_link = markupLink || null;
		if (
			canEditArtworkLinks &&
			(assetsLink || null) !== (selection?.assets_link ?? null)
		)
			p.assets_link = assetsLink || null;
		return p;
	}, [
		status,
		fromDate,
		toDateValue,
		notes,
		selfPrint,
		markupLink,
		assetsLink,
		selection,
		canEditArtworkLinks,
		canEditSelfPrint,
	]);

	const before = useMemo(() => {
		const b: Record<string, any> = {};
		Object.keys(patch).forEach((k) => {
			b[k] = (selection ?? {})[k] ?? null;
		});
		return b;
	}, [patch, selection]);

	const hasChanges = Object.keys(patch).length > 0;
	const statusChanged = "status" in patch;

	const handleClose = () => {
		setConfirming(false);
		setReason("");
		onClose();
	};

	const handleSave = () => {
		mutate(
			{
				selectionId: selection.id,
				patch,
				reason,
			},
			{
				onSuccess: () => {
					handleClose();
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
					<IconBolt size={18} color={T.violet[6]} />
					<Text fw={700} size="md">
						{confirming ? "Confirm Changes" : "Edit Selection"}
					</Text>
				</Group>
			}
			size="lg"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			{!confirming ? (
				<Stack gap="md">
					<Select
						label="Status"
						data={STATUS_OPTIONS}
						value={status}
						onChange={(v) => setStatus(v ?? "onPlan")}
						radius="md"
					/>

					{statusChanged && (
						<Alert
							icon={<IconAlertTriangle size={14} />}
							color="orange"
							variant="light"
							radius="md"
						>
							You are forcing a status change directly. This will NOT
							trigger any notifications or emails. Use the Workflow
							Actions tab (Phase 3) for transitions that should fire
							notifications.
						</Alert>
					)}

					<Group grow>
						<DateInput
							label="From Date"
							value={fromDate}
							onChange={setFromDate}
							valueFormat="DD MMM YYYY"
							radius="md"
							clearable
						/>
						<DateInput
							label="To Date"
							value={toDateValue}
							onChange={setToDateValue}
							valueFormat="DD MMM YYYY"
							radius="md"
							clearable
						/>
					</Group>

					<TextInput
						label="Markup Link"
						description={
							canEditArtworkLinks
								? "Link to the markup/proofing file"
								: `Locked — only editable from "Awaiting Approval" onwards (artwork hasn't been delivered yet)`
						}
						value={markupLink}
						onChange={(e) => setMarkupLink(e.currentTarget.value)}
						placeholder="https://..."
						radius="md"
						disabled={!canEditArtworkLinks}
						styles={{ description: { color: T.lime[9] } }}
					/>

					<TextInput
						label="Assets Link"
						description={
							canEditArtworkLinks
								? "Link to the final assets folder"
								: `Locked — only editable from "Awaiting Approval" onwards (artwork hasn't been delivered yet)`
						}
						value={assetsLink}
						onChange={(e) => setAssetsLink(e.currentTarget.value)}
						placeholder="https://..."
						radius="md"
						disabled={!canEditArtworkLinks}
						styles={{ description: { color: T.lime[9] } }}
					/>

					<Switch
						label="Self print"
						description={
							canEditSelfPrint
								? "Practice will print their own assets"
								: `Locked — only editable once the practice has confirmed assets`
						}
						checked={selfPrint}
						onChange={(e) => setSelfPrint(e.currentTarget.checked)}
						color="violet"
						disabled={!canEditSelfPrint}
						styles={{ description: { color: T.lime[9] } }}
					/>

					<Textarea
						label="Notes"
						value={notes}
						onChange={(e) => setNotes(e.currentTarget.value)}
						autosize
						minRows={2}
						maxRows={5}
						radius="md"
					/>

					<GradientDivider />

					<Group justify="space-between">
						<Button variant="subtle" color="gray" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							color="violet"
							disabled={!hasChanges}
							onClick={() => setConfirming(true)}
						>
							Review Changes
						</Button>
					</Group>
				</Stack>
			) : (
				<Stack gap="md">
					<Text size="sm" c="gray.7">
						You are about to change{" "}
						<Text span fw={700}>
							{Object.keys(patch).length}
						</Text>{" "}
						field{Object.keys(patch).length === 1 ? "" : "s"} on this
						selection.
					</Text>

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
						<Button
							color="violet"
							loading={isPending}
							onClick={handleSave}
						>
							Save Changes
						</Button>
					</Group>
				</Stack>
			)}
		</Modal>
	);
}
