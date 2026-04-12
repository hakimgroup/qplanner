import {
	Modal,
	Stack,
	Group,
	Button,
	Select,
	Text,
	useMantineTheme,

	Alert,
	Box,
	rgba,
	Loader,
	Center,
} from "@mantine/core";
import { useState, useMemo } from "react";
import { IconArrowsRightLeft, IconAlertTriangle } from "@tabler/icons-react";
import {
	useGodModeReassignPractice,
	useGodModeListPractices,
} from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";

interface Props {
	opened: boolean;
	onClose: () => void;
	selection: any;
	currentPracticeName: string;
	isBespoke: boolean;
}

export default function GodModeReassignPracticeModal({
	opened,
	onClose,
	selection,
	currentPracticeName,
	isBespoke,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeReassignPractice();
	const { data: practices, isLoading } = useGodModeListPractices(opened);

	const [newPracticeId, setNewPracticeId] = useState<string | null>(null);
	const [reason, setReason] = useState("");

	const options = useMemo(
		() =>
			(practices ?? [])
				.filter((p) => p.id !== selection?.practice_id)
				.map((p) => ({ value: p.id, label: p.name })),
		[practices, selection?.practice_id]
	);

	const newPracticeName = useMemo(
		() => options.find((o) => o.value === newPracticeId)?.label,
		[options, newPracticeId]
	);

	const handleClose = () => {
		setNewPracticeId(null);
		setReason("");
		onClose();
	};

	const handleSubmit = () => {
		if (!newPracticeId) return;
		mutate(
			{ selectionId: selection.id, newPracticeId, reason },
			{ onSuccess: () => handleClose() }
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconArrowsRightLeft size={18} color={T.red[6]} />
					<Text fw={700} size="md" c="red.7">
						Reassign Practice
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
					title="This is a powerful change"
				>
					Moves this selection to a different practice. The notifications
					attached to this selection will also move (their{" "}
					<code>practice_id</code> updates), old notification targets will be
					deleted, and new ones will be created for the new practice's members.
					{isBespoke && (
						<>
							{" "}
							<strong>
								Because this is a bespoke campaign, the bespoke campaign's
								ownership will also move to the new practice.
							</strong>
						</>
					)}
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
							Currently at
						</Text>
						<Text size="sm" fw={700}>
							{currentPracticeName}
						</Text>
					</Stack>
				</Box>

				{isLoading ? (
					<Center py="md">
						<Loader color="red" size="sm" />
					</Center>
				) : (
					<Select
						label="New practice"
						data={options}
						value={newPracticeId}
						onChange={setNewPracticeId}
						placeholder="Pick a destination practice"
						radius="md"
						searchable
						clearable
						required
						nothingFoundMessage="No practices"
					/>
				)}

				{newPracticeName && (
					<Box
						p="md"
						style={{
							background: rgba(T.green[0], 0.5),
							borderRadius: 12,
							border: `1px solid ${rgba(T.green[3], 0.25)}`,
						}}
					>
						<Stack gap={4}>
							<Text size="xs" c="gray.6" fw={600} tt="uppercase">
								Will be moved to
							</Text>
							<Text size="sm" fw={700} c="green.8">
								{newPracticeName}
							</Text>
						</Stack>
					</Box>
				)}

				<GodModeReasonField value={reason} onChange={setReason} />

				<GradientDivider />

				<Group justify="space-between">
					<Button variant="subtle" color="gray" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						color="red"
						loading={isPending}
						disabled={!newPracticeId}
						onClick={handleSubmit}
						leftSection={<IconArrowsRightLeft size={14} />}
					>
						Reassign
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
