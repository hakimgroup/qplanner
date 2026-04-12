import {
	Stack,
	Text,
	Badge,
	Group,
	Box,
	Timeline,
	Tabs,
	useMantineTheme,
	rgba,
	ThemeIcon,
	Center,
} from "@mantine/core";
import {
	IconArrowRight,
	IconMail,
	IconBolt,
	IconHistory,
	IconMailOff,
	IconClockOff,
} from "@tabler/icons-react";
import { GodModeSelectionDetails } from "@/hooks/godMode.hooks";
import { format, parseISO } from "date-fns";
import { startCase } from "lodash";
import { statusColors } from "@/shared/shared.const";

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

function Section({
	icon,
	title,
	tint,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	tint: string;
	children: React.ReactNode;
}) {
	const T = useMantineTheme().colors;
	const palette = T[tint as keyof typeof T] as any;
	return (
		<Box
			p="lg"
			style={{
				background: rgba(palette[0], 0.5),
				borderRadius: 14,
				border: `1px solid ${rgba(palette[3], 0.25)}`,
			}}
		>
			<Group gap={10} mb="md" align="center">
				<ThemeIcon size={32} radius="md" variant="light" color={tint}>
					{icon}
				</ThemeIcon>
				<Text fw={700} size="md" c={`${tint}.8` as any}>
					{title}
				</Text>
			</Group>
			{children}
		</Box>
	);
}

export default function GodModeHistoryTab({ data }: Props) {
	const T = useMantineTheme().colors;
	const history = data.status_history ?? [];
	const emails = data.emails ?? [];
	const log = data.god_mode_log ?? [];

	return (
		<Tabs
			defaultValue="status"
			color="violet"
			variant="pills"
			radius="xl"
			styles={{
				list: { gap: 6, marginBottom: 16 },
				tab: { fontWeight: 600, fontSize: 13 },
			}}
		>
			<Tabs.List>
				<Tabs.Tab value="status" leftSection={<IconHistory size={14} />}>
					Status History ({history.length})
				</Tabs.Tab>
				<Tabs.Tab value="emails" leftSection={<IconMail size={14} />}>
					Emails ({emails.length})
				</Tabs.Tab>
				<Tabs.Tab value="god_mode" leftSection={<IconBolt size={14} />}>
					God Mode Log ({log.length})
				</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value="status">
				<Section icon={<IconHistory size={18} />} title="Status Timeline" tint="blue">
					{history.length === 0 ? (
						<Center py="lg">
							<Stack gap={6} align="center">
								<ThemeIcon size={42} radius="xl" variant="light" color="gray">
									<IconClockOff size={20} />
								</ThemeIcon>
								<Text size="sm" c="gray.6">
									No status transitions yet.
								</Text>
							</Stack>
						</Center>
					) : (
						<Box
							p="md"
							style={{
								background: "white",
								borderRadius: 12,
								border: `1px solid ${rgba(T.blue[3], 0.25)}`,
							}}
						>
							<Timeline
								active={history.length - 1}
								bulletSize={22}
								lineWidth={2}
								color="violet"
							>
								{history.map((h) => {
									const toColor =
										(statusColors as any)[h.to_status] ?? T.violet[6];
									return (
										<Timeline.Item
											key={h.id}
											title={
												<Group gap={6}>
													<Badge
														size="sm"
														variant="light"
														color="gray"
														radius="sm"
													>
														{startCase(h.from_status ?? "—")}
													</Badge>
													<IconArrowRight size={12} color={T.gray[5]} />
													<Badge
														size="sm"
														variant="light"
														radius="sm"
														style={{
															background: rgba(toColor, 0.12),
															color: toColor,
														}}
													>
														{startCase(h.to_status)}
													</Badge>
												</Group>
											}
										>
											<Text size="xs" c="gray.6" mt={4}>
												{formatDateTime(h.created_at)}
											</Text>
											{h.message && (
												<Text size="sm" c="gray.8" mt={4}>
													{h.message}
												</Text>
											)}
											{h.note && (
												<Text size="xs" c="gray.7" mt={4} fs="italic">
													Note: {h.note}
												</Text>
											)}
										</Timeline.Item>
									);
								})}
							</Timeline>
						</Box>
					)}
				</Section>
			</Tabs.Panel>

			<Tabs.Panel value="emails">
				<Section icon={<IconMail size={18} />} title="Emails Sent" tint="teal">
					{emails.length === 0 ? (
						<Center py="lg">
							<Stack gap={6} align="center">
								<ThemeIcon size={42} radius="xl" variant="light" color="gray">
									<IconMailOff size={20} />
								</ThemeIcon>
								<Text size="sm" c="gray.6">
									No emails logged for this selection.
								</Text>
							</Stack>
						</Center>
					) : (
						<Stack gap={8}>
							{emails.map((e) => (
								<Group
									key={e.id}
									justify="space-between"
									align="flex-start"
									p="sm"
									style={{
										background: "white",
										borderRadius: 10,
										border: `1px solid ${rgba(T.teal[3], 0.25)}`,
									}}
									wrap="nowrap"
								>
									<Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
										<Group gap={6}>
											<Badge
												size="xs"
												variant="light"
												color="blue"
												radius="sm"
											>
												{startCase(e.email_type)}
											</Badge>
											<Badge
												size="xs"
												variant="light"
												color={e.status === "sent" ? "green" : "red"}
												radius="sm"
											>
												{e.status}
											</Badge>
										</Group>
										<Text size="sm" fw={500} c="gray.9">
											{e.recipient_email}
										</Text>
										{e.error_message && (
											<Text size="xs" c="red.6">
												{e.error_message}
											</Text>
										)}
									</Stack>
									<Text size="xs" c="gray.6" style={{ whiteSpace: "nowrap" }}>
										{formatDateTime(e.created_at)}
									</Text>
								</Group>
							))}
						</Stack>
					)}
				</Section>
			</Tabs.Panel>

			<Tabs.Panel value="god_mode">
				<Section icon={<IconBolt size={18} />} title="God Mode Log" tint="violet">
					{log.length === 0 ? (
						<Center py="lg">
							<Stack gap={6} align="center">
								<ThemeIcon size={42} radius="xl" variant="light" color="gray">
									<IconBolt size={20} />
								</ThemeIcon>
								<Text size="sm" c="gray.6">
									No God Mode actions taken on this selection yet.
								</Text>
							</Stack>
						</Center>
					) : (
						<Stack gap={8}>
							{log.map((l) => (
								<Group
									key={l.id}
									justify="space-between"
									align="flex-start"
									p="sm"
									style={{
										background: "white",
										borderRadius: 10,
										border: `1px solid ${rgba(T.violet[3], 0.25)}`,
									}}
									wrap="nowrap"
								>
									<Stack gap={4} style={{ flex: 1 }}>
										<Group gap={6}>
											<Badge
												size="xs"
												variant="filled"
												color="violet"
												radius="sm"
											>
												{l.action_type}
											</Badge>
											{l.target && (
												<Badge
													size="xs"
													variant="outline"
													color="violet"
													radius="sm"
												>
													{l.target}
												</Badge>
											)}
											{l.silent && (
												<Badge
													size="xs"
													variant="light"
													color="gray"
													radius="sm"
												>
													Silent
												</Badge>
											)}
										</Group>
										{l.reason && (
											<Text size="xs" c="gray.7" fs="italic">
												"{l.reason}"
											</Text>
										)}
									</Stack>
									<Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
										<Text size="xs" c="gray.6" style={{ whiteSpace: "nowrap" }}>
											{formatDateTime(l.created_at)}
										</Text>
										{(l.actor_name || l.actor_email) && (
											<Badge
												size="xs"
												variant="light"
												color="red"
												radius="sm"
											>
												{l.actor_name || l.actor_email}
											</Badge>
										)}
									</Stack>
								</Group>
							))}
						</Stack>
					)}
				</Section>
			</Tabs.Panel>
		</Tabs>
	);
}
