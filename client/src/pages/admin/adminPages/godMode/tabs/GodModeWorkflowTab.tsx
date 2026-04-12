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
	IconBolt,
	IconArrowsLeftRight,
	IconMailForward,
	IconPlus,
	IconCheck,
	IconEdit,
} from "@tabler/icons-react";
import { useState } from "react";
import { GodModeSelectionDetails } from "@/hooks/godMode.hooks";
import GodModeForceStatusModal from "../modals/GodModeForceStatusModal";
import GodModeEditPayloadsModal from "../modals/GodModeEditPayloadsModal";
import GodModeResendEmailModal from "../modals/GodModeResendEmailModal";
import GodModeRecreateNotificationModal from "../modals/GodModeRecreateNotificationModal";
import GodModeForceMarkReadModal from "../modals/GodModeForceMarkReadModal";

interface Props {
	data: GodModeSelectionDetails;
}

type ActionCard = {
	id: string;
	icon: React.ReactNode;
	title: string;
	description: string;
	color: string;
};

const actions: ActionCard[] = [
	{
		id: "force_status",
		icon: <IconArrowsLeftRight size={18} />,
		title: "Force Status Transition",
		description:
			"Force any status change. Optional silent mode skips notifications and emails.",
		color: "violet",
	},
	{
		id: "edit_payloads",
		icon: <IconEdit size={18} />,
		title: "Update Notification Payloads",
		description:
			"Patch payload fields with a stage selector — pick which notification stages to update.",
		color: "indigo",
	},
	{
		id: "resend_email",
		icon: <IconMailForward size={18} />,
		title: "Resend Email",
		description:
			"Resend any workflow email with a recipient picker to choose who receives it.",
		color: "blue",
	},
	{
		id: "recreate",
		icon: <IconPlus size={18} />,
		title: "Recreate Notification",
		description:
			"Create a missing notification for any stage that wasn't fired correctly.",
		color: "teal",
	},
	{
		id: "mark_read",
		icon: <IconCheck size={18} />,
		title: "Force Mark As Read",
		description:
			"Mark all notifications for this selection as read for every practice member.",
		color: "green",
	},
];

export default function GodModeWorkflowTab({ data }: Props) {
	const T = useMantineTheme().colors;
	const [openModal, setOpenModal] = useState<string | null>(null);

	return (
		<Stack gap="lg">
			<Box
				p="lg"
				style={{
					background: rgba(T.violet[0], 0.5),
					borderRadius: 14,
					border: `1px solid ${rgba(T.violet[3], 0.25)}`,
				}}
			>
				<Group gap={10} mb="sm" align="center">
					<ThemeIcon size={32} radius="md" variant="light" color="violet">
						<IconBolt size={18} />
					</ThemeIcon>
					<Text fw={700} size="md" c="violet.8">
						Workflow Actions
					</Text>
				</Group>
				<Text size="sm" c="gray.7">
					Powerful overrides that fix anything about a campaign at any stage.
					Every action is logged with an optional reason. Some actions can run
					in <strong>silent mode</strong> to skip notifications and emails.
				</Text>
			</Box>

			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
				{actions.map((p) => {
					const palette = (T as any)[p.color];
					return (
						<Box
							key={p.id}
							p="lg"
							style={{
								background: rgba(palette[0], 0.4),
								borderRadius: 14,
								border: `1px solid ${rgba(palette[3], 0.25)}`,
							}}
						>
							<Stack gap="md">
								<Group gap={12} align="flex-start" wrap="nowrap">
									<ThemeIcon
										size={40}
										radius="md"
										variant="light"
										color={p.color}
									>
										{p.icon}
									</ThemeIcon>
									<Stack gap={2} style={{ flex: 1 }}>
										<Text fw={700} size="sm" c={`${p.color}.8` as any}>
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
									color={p.color}
									radius="md"
									onClick={() => setOpenModal(p.id)}
								>
									Open
								</Button>
							</Stack>
						</Box>
					);
				})}
			</SimpleGrid>

			<GodModeForceStatusModal
				opened={openModal === "force_status"}
				onClose={() => setOpenModal(null)}
				selection={data.selection}
			/>
			<GodModeEditPayloadsModal
				opened={openModal === "edit_payloads"}
				onClose={() => setOpenModal(null)}
				selection={data.selection}
				notifications={data.notifications}
			/>
			<GodModeResendEmailModal
				opened={openModal === "resend_email"}
				onClose={() => setOpenModal(null)}
				selection={data.selection}
				notifications={data.notifications}
				practiceMembers={data.practice_members}
			/>
			<GodModeRecreateNotificationModal
				opened={openModal === "recreate"}
				onClose={() => setOpenModal(null)}
				selection={data.selection}
			/>
			<GodModeForceMarkReadModal
				opened={openModal === "mark_read"}
				onClose={() => setOpenModal(null)}
				selection={data.selection}
				notifications={data.notifications}
			/>
		</Stack>
	);
}
