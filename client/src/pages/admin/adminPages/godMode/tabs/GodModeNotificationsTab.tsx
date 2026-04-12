import {
	Stack,
	Text,
	Badge,
	Group,
	Accordion,
	Code,
	SimpleGrid,
	Box,
	useMantineTheme,
	rgba,
	ThemeIcon,
	Center,
	Button,
} from "@mantine/core";
import { IconMail, IconMailOff, IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import { GodModeSelectionDetails } from "@/hooks/godMode.hooks";
import { format, parseISO } from "date-fns";
import { startCase } from "lodash";
import GodModeEditPayloadJsonModal from "../modals/GodModeEditPayloadJsonModal";

interface Props {
	data: GodModeSelectionDetails;
}

const formatDateTime = (d?: string | null) => {
	if (!d) return "—";
	try {
		return format(parseISO(d), "d MMM yyyy, HH:mm:ss");
	} catch {
		return d;
	}
};

const typeColors: Record<string, string> = {
	requested: "orange",
	inProgress: "blue",
	awaitingApproval: "grape",
	confirmed: "indigo",
	feedbackRequested: "pink",
	campaignAdded: "teal",
	bespokeAdded: "violet",
	bespokeEventAdded: "violet",
};

export default function GodModeNotificationsTab({ data }: Props) {
	const T = useMantineTheme().colors;
	const notifications = data.notifications ?? [];
	const [editingNotification, setEditingNotification] = useState<any | null>(null);

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
				<Group gap={10} mb="md" align="center" justify="space-between">
					<Group gap={10}>
						<ThemeIcon size={32} radius="md" variant="light" color="violet">
							<IconMail size={18} />
						</ThemeIcon>
						<Stack gap={0}>
							<Text fw={700} size="md" c="violet.8">
								Notification Payloads
							</Text>
							<Text size="xs" c="gray.6">
								Each notification has its own payload snapshot. The UI reads
								from these payloads — editing them comes in Phase 3.
							</Text>
						</Stack>
					</Group>
					<Badge variant="light" color="violet" size="md" radius="sm">
						{notifications.length} total
					</Badge>
				</Group>

				{notifications.length === 0 ? (
					<Center py="xl">
						<Stack gap={6} align="center">
							<ThemeIcon size={42} radius="xl" variant="light" color="gray">
								<IconMailOff size={20} />
							</ThemeIcon>
							<Text size="sm" c="gray.6">
								No notifications have been created for this selection yet.
							</Text>
						</Stack>
					</Center>
				) : (
					<Accordion
						multiple
						radius="md"
						styles={{
							item: {
								background: "white",
								border: `1px solid ${rgba(T.violet[3], 0.25)}`,
								marginBottom: 8,
								borderRadius: 12,
								overflow: "hidden",
							},
							control: {
								padding: "12px 16px",
								"&:hover": { background: rgba(T.violet[0], 0.5) },
							},
							panel: {
								background: rgba(T.gray[0], 0.5),
							},
							content: {
								padding: "16px",
							},
						}}
					>
						{notifications.map((n) => {
							const color = typeColors[n.type] ?? "gray";
							return (
								<Accordion.Item key={n.id} value={n.id}>
									<Accordion.Control>
										<Group
											justify="space-between"
											align="center"
											wrap="nowrap"
										>
											<Group gap="xs" wrap="nowrap">
												<Badge
													variant="light"
													color={color}
													size="md"
													radius="sm"
												>
													{startCase(n.type)}
												</Badge>
												<Badge
													variant="outline"
													color={n.audience === "admins" ? "blue" : "teal"}
													size="xs"
													radius="sm"
												>
													→ {n.audience}
												</Badge>
											</Group>
											<Text size="xs" c="gray.6">
												{formatDateTime(n.created_at)}
											</Text>
										</Group>
									</Accordion.Control>
									<Accordion.Panel>
										<Stack gap="md">
											<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
												<Stack gap={2}>
													<Text
														size="xs"
														c="gray.6"
														fw={600}
														tt="uppercase"
														style={{ letterSpacing: 0.4 }}
													>
														Notification ID
													</Text>
													<Text size="xs" ff="monospace" c="gray.8">
														{n.id}
													</Text>
												</Stack>
												<Stack gap={2}>
													<Text
														size="xs"
														c="gray.6"
														fw={600}
														tt="uppercase"
														style={{ letterSpacing: 0.4 }}
													>
														Title
													</Text>
													<Text size="xs" c="gray.8">
														{n.title ?? "—"}
													</Text>
												</Stack>
											</SimpleGrid>

											{n.message && (
												<Stack gap={2}>
													<Text
														size="xs"
														c="gray.6"
														fw={600}
														tt="uppercase"
														style={{ letterSpacing: 0.4 }}
													>
														Message
													</Text>
													<Text size="sm" c="gray.8">
														{n.message}
													</Text>
												</Stack>
											)}

											<Stack gap={4}>
												<Group justify="space-between" align="center">
													<Text
														size="xs"
														c="gray.6"
														fw={600}
														tt="uppercase"
														style={{ letterSpacing: 0.4 }}
													>
														Payload
													</Text>
													<Button
														size="xs"
														variant="light"
														color="violet"
														radius="md"
														leftSection={<IconEdit size={12} />}
														onClick={() => setEditingNotification(n)}
													>
														Edit JSON
													</Button>
												</Group>
												<Code
													block
													style={{
														fontSize: 11,
														maxHeight: 320,
														overflow: "auto",
														background: "white",
														borderRadius: 8,
													}}
												>
													{JSON.stringify(n.payload, null, 2)}
												</Code>
											</Stack>
										</Stack>
									</Accordion.Panel>
								</Accordion.Item>
							);
						})}
					</Accordion>
				)}
			</Box>

			{editingNotification && (
				<GodModeEditPayloadJsonModal
					opened={!!editingNotification}
					onClose={() => setEditingNotification(null)}
					notification={editingNotification}
					selectionId={data.selection.id}
				/>
			)}
		</Stack>
	);
}
