import {
	Stack,
	Text,
	Box,
	useMantineTheme,
	rgba,
	ThemeIcon,
	Group,
	SimpleGrid,
	Button,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconTrash,
	IconArchive,
	IconArrowsRightLeft,
} from "@tabler/icons-react";
import { useState } from "react";
import { GodModeSelectionDetails } from "@/hooks/godMode.hooks";
import GodModeDeleteSelectionModal from "../modals/GodModeDeleteSelectionModal";
import GodModeArchiveSelectionModal from "../modals/GodModeArchiveSelectionModal";
import GodModeReassignPracticeModal from "../modals/GodModeReassignPracticeModal";

interface Props {
	data: GodModeSelectionDetails;
	onSelectionRemoved?: () => void;
}

type ActionCard = {
	id: string;
	icon: React.ReactNode;
	title: string;
	description: string;
	cta: string;
};

const actions: ActionCard[] = [
	{
		id: "reassign",
		icon: <IconArrowsRightLeft size={18} />,
		title: "Reassign Practice",
		description:
			"Move this selection to a different practice. Notifications and (for bespoke) ownership move along with it.",
		cta: "Reassign",
	},
	{
		id: "archive",
		icon: <IconArchive size={18} />,
		title: "Archive Selection",
		description:
			"Snapshot the selection into archived_selections, then remove it from active views. Notifications and emails are removed.",
		cta: "Archive",
	},
	{
		id: "delete",
		icon: <IconTrash size={18} />,
		title: "Delete Selection",
		description:
			"Permanently delete the selection along with its notifications and email logs. Status history and audit trail survive.",
		cta: "Delete",
	},
];

export default function GodModeDangerZoneTab({
	data,
	onSelectionRemoved,
}: Props) {
	const T = useMantineTheme().colors;
	const [openModal, setOpenModal] = useState<string | null>(null);

	const sel = data.selection;
	const camp = data.bespoke_campaign ?? data.campaign;
	const campaignName = camp?.name ?? "—";
	const isBespoke = !!data.bespoke_campaign;
	const practiceName = data.practice?.name ?? "—";

	return (
		<Stack gap="lg">
			<Box
				p="lg"
				style={{
					background: rgba(T.red[0], 0.5),
					borderRadius: 14,
					border: `1px solid ${rgba(T.red[3], 0.25)}`,
				}}
			>
				<Group gap={10} mb="sm" align="center">
					<ThemeIcon size={32} radius="md" variant="light" color="red">
						<IconAlertTriangle size={18} />
					</ThemeIcon>
					<Text fw={700} size="md" c="red.8">
						Danger Zone
					</Text>
				</Group>
				<Text size="sm" c="gray.7">
					Destructive or hard-to-reverse operations. Each action requires
					explicit confirmation. <strong>Delete</strong> requires you to type
					"DELETE" before it can be triggered. Every action is logged with an
					optional reason.
				</Text>
			</Box>

			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
				{actions.map((p) => (
					<Box
						key={p.id}
						p="lg"
						style={{
							background: rgba(T.red[0], 0.4),
							borderRadius: 14,
							border: `1px solid ${rgba(T.red[3], 0.25)}`,
						}}
					>
						<Stack gap="md">
							<Group gap={12} align="flex-start" wrap="nowrap">
								<ThemeIcon size={40} radius="md" variant="light" color="red">
									{p.icon}
								</ThemeIcon>
								<Stack gap={2} style={{ flex: 1 }}>
									<Text fw={700} size="sm" c="red.8">
										{p.title}
									</Text>
									<Text size="xs" c="gray.7">
										{p.description}
									</Text>
								</Stack>
							</Group>
							<Button
								size="xs"
								variant="filled"
								color="red"
								radius="md"
								onClick={() => setOpenModal(p.id)}
							>
								{p.cta}
							</Button>
						</Stack>
					</Box>
				))}
			</SimpleGrid>

			<GodModeDeleteSelectionModal
				opened={openModal === "delete"}
				onClose={() => setOpenModal(null)}
				selection={sel}
				campaignName={campaignName}
				onDeleted={() => {
					setOpenModal(null);
					onSelectionRemoved?.();
				}}
			/>
			<GodModeArchiveSelectionModal
				opened={openModal === "archive"}
				onClose={() => setOpenModal(null)}
				selection={sel}
				campaignName={campaignName}
				onArchived={() => {
					setOpenModal(null);
					onSelectionRemoved?.();
				}}
			/>
			<GodModeReassignPracticeModal
				opened={openModal === "reassign"}
				onClose={() => setOpenModal(null)}
				selection={sel}
				currentPracticeName={practiceName}
				isBespoke={isBespoke}
			/>
		</Stack>
	);
}
