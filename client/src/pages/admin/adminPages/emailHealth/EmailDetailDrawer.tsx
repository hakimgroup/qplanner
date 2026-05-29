import {
	Badge,
	Box,
	Card,
	Code,
	Divider,
	Drawer,
	Flex,
	Group,
	Loader,
	ScrollArea,
	Stack,
	Tabs,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
	IconBuilding,
	IconCalendarEvent,
	IconClock,
	IconCode,
	IconFileText,
	IconInfoCircle,
	IconMail,
	IconUser,
} from "@tabler/icons-react";
import api from "@/api/express";
import { format } from "date-fns";
import { useIsMobile } from "@/shared/shared.hooks";

interface PreviewResponse {
	metadata: {
		id: string;
		notification_id: string | null;
		email_type: string | null;
		recipient_email: string | null;
		status: string;
		attempt_source: string | null;
		attempted_at: string | null;
		sent_at: string | null;
		created_at: string;
		error_message: string | null;
		practice_name: string | null;
		campaign_name: string | null;
		subject: string | null;
		resend_message_id: string | null;
		payload: any;
	};
	html: string | null;
}

const STATUS_COLOR: Record<string, string> = {
	attempted: "gray",
	dispatched: "blue",
	sent: "teal",
	failed: "red",
	bounced: "orange",
	complaint: "grape",
};

const SOURCE_COLOR: Record<string, string> = {
	client: "blue",
	server: "teal",
	pg_net: "violet",
	god_mode: "grape",
	cron: "yellow",
};

interface Props {
	logId: string | null;
	opened: boolean;
	onClose: () => void;
}

export default function EmailDetailDrawer({ logId, opened, onClose }: Props) {
	const T = useMantineTheme().colors;
	const isMobile = useIsMobile();

	const { data, isLoading, error } = useQuery<PreviewResponse>({
		queryKey: ["email_preview", logId],
		queryFn: async () => {
			const { data } = await api.get(`/preview-email/${logId}`);
			return data;
		},
		enabled: Boolean(opened && logId),
	});

	const meta = data?.metadata;
	const html = data?.html;

	const fmt = (iso: string | null | undefined) => {
		if (!iso) return "—";
		try {
			return format(new Date(iso), "dd MMM yyyy, HH:mm:ss");
		} catch {
			return iso;
		}
	};

	// Shared scrollbar treatment, matches PeopleActions/PracticeMembersDrawer
	const subtleScroll = {
		scrollbarWidth: "thin" as const,
		scrollbarColor: `${T.gray[2]} transparent`,
	};

	const InfoRow = ({
		icon,
		label,
		value,
		mono = false,
		muted = false,
	}: {
		icon?: React.ReactNode;
		label: string;
		value: React.ReactNode;
		mono?: boolean;
		muted?: boolean;
	}) => (
		<Flex gap={12} align="flex-start" py={8}>
			{icon && (
				<Box
					mt={2}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: 24,
						height: 24,
						borderRadius: 6,
						background: T.blue[0],
						color: T.blue[5],
					}}
				>
					{icon}
				</Box>
			)}
			<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
				<Text size="xs" c="gray.6" fw={600} tt="uppercase" lts={0.3}>
					{label}
				</Text>
				<Text
					size="sm"
					c={muted ? "gray.5" : "gray.9"}
					ff={mono ? "monospace" : undefined}
					style={{ wordBreak: "break-word" }}
				>
					{value ?? "—"}
				</Text>
			</Stack>
		</Flex>
	);

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position="right"
			size={isMobile ? "100%" : "52rem"}
			offset={8}
			radius={10}
			overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
			title={
				<Group gap={10}>
					<Box
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 36,
							height: 36,
							borderRadius: 10,
							background: `linear-gradient(135deg, ${T.blue[0]}, ${T.violet[0]})`,
						}}
					>
						<IconMail size={18} color={T.blue[5]} />
					</Box>
					<Stack gap={0}>
						<Text fw={700} size="md" c="gray.9">
							Email Details
						</Text>
						<Text size="xs" c="gray.6">
							Inspect contents and delivery state
						</Text>
					</Stack>
				</Group>
			}
			styles={{
				body: { ...subtleScroll, paddingTop: 8 },
			}}
		>
			{isLoading && (
				<Group justify="center" p="xl">
					<Loader size="sm" />
				</Group>
			)}
			{error && (
				<Card p="md" bg="red.0" radius={10}>
					<Text size="sm" c="red.7">
						Failed to load preview: {(error as Error).message}
					</Text>
				</Card>
			)}

			{meta && (
				<Stack gap={18}>
					{/* Hero card — subject, badges, gradient accent */}
					<Card
						radius={12}
						p="lg"
						style={{
							background: `linear-gradient(135deg, ${T.blue[0]} 0%, ${T.violet[0]} 100%)`,
							border: `1px solid ${T.blue[1]}`,
						}}
						shadow="xs"
					>
						<Stack gap={12}>
							<Text
								size="xs"
								c="blue.7"
								fw={700}
								tt="uppercase"
								lts={0.5}
							>
								Subject
							</Text>
							<Text fw={700} size="lg" c="gray.9" lh={1.3}>
								{meta.subject ?? meta.email_type ?? "—"}
							</Text>

							<Group gap={6} mt={4}>
								<Badge
									variant="filled"
									color={STATUS_COLOR[meta.status] ?? "gray"}
									size="sm"
									fw={700}
									radius="sm"
								>
									{meta.status}
								</Badge>
								<Badge
									variant="light"
									color={SOURCE_COLOR[meta.attempt_source ?? ""] ?? "gray"}
									size="sm"
									radius="sm"
								>
									{meta.attempt_source ?? "—"}
								</Badge>
								{meta.email_type && (
									<Badge
										variant="outline"
										color="gray.5"
										size="sm"
										radius="sm"
										style={{
											borderColor: T.gray[3],
											color: T.gray[7],
										}}
									>
										{meta.email_type}
									</Badge>
								)}
							</Group>
						</Stack>
					</Card>

					{/* Compact context strip */}
					<Card
						radius={10}
						p="md"
						style={{
							background: "#fbfbfd",
							border: `1px solid ${T.gray[1]}`,
						}}
					>
						<Flex gap={20} wrap="wrap">
							<Group gap={8} align="center">
								<IconUser size={14} color={T.gray[5]} />
								<Text size="xs" c="gray.7">
									{meta.recipient_email ?? "—"}
								</Text>
							</Group>
							<Group gap={8} align="center">
								<IconBuilding size={14} color={T.gray[5]} />
								<Text size="xs" c="gray.7">
									{meta.practice_name ?? "—"}
								</Text>
							</Group>
							<Group gap={8} align="center">
								<IconClock size={14} color={T.gray[5]} />
								<Text size="xs" c="gray.7">
									{fmt(meta.sent_at ?? meta.attempted_at ?? meta.created_at)}
								</Text>
							</Group>
						</Flex>
					</Card>

					<Tabs
						defaultValue="preview"
						keepMounted={false}
						styles={{
							list: { borderBottom: `1px solid ${T.gray[1]}` },
						}}
					>
						<Tabs.List>
							<Tabs.Tab
								value="preview"
								leftSection={<IconMail size={14} />}
							>
								Email content
							</Tabs.Tab>
							<Tabs.Tab
								value="metadata"
								leftSection={<IconInfoCircle size={14} />}
							>
								Metadata
							</Tabs.Tab>
							<Tabs.Tab
								value="payload"
								leftSection={<IconCode size={14} />}
							>
								Payload
							</Tabs.Tab>
						</Tabs.List>

						{/* Email preview */}
						<Tabs.Panel value="preview" pt="md">
							{html ? (
								<Box
									style={{
										borderRadius: 12,
										border: `1px solid ${T.gray[2]}`,
										overflow: "hidden",
										background: "#fff",
										boxShadow: "0 1px 2px rgba(20, 30, 80, 0.04)",
									}}
								>
									<Flex
										align="center"
										gap={6}
										px="md"
										py="xs"
										style={{
											background: T.gray[0],
											borderBottom: `1px solid ${T.gray[1]}`,
										}}
									>
										<Box
											style={{
												width: 10,
												height: 10,
												borderRadius: 999,
												background: "#ff6058",
											}}
										/>
										<Box
											style={{
												width: 10,
												height: 10,
												borderRadius: 999,
												background: "#ffbe2d",
											}}
										/>
										<Box
											style={{
												width: 10,
												height: 10,
												borderRadius: 999,
												background: "#26c93e",
											}}
										/>
										<Text size="xs" c="gray.6" ml={8} lineClamp={1}>
											{meta.subject ?? "(no subject)"}
										</Text>
									</Flex>
									<iframe
										srcDoc={html}
										title="Email preview"
										style={{
											width: "100%",
											height: "62vh",
											border: "none",
											display: "block",
											background: "#fff",
										}}
										sandbox=""
									/>
								</Box>
							) : (
								<Text size="sm" c="gray.6">
									No HTML preview available.
								</Text>
							)}
						</Tabs.Panel>

						{/* Metadata */}
						<Tabs.Panel value="metadata" pt="md">
							<Card
								radius={10}
								p="lg"
								style={{ border: `1px solid ${T.gray[1]}`, background: "#fff" }}
								shadow="xs"
							>
								<Stack gap={0}>
									<InfoRow
										icon={<IconFileText size={13} />}
										label="Subject"
										value={meta.subject}
										muted={!meta.subject}
									/>
									<Divider color={T.gray[1]} />
									<InfoRow
										icon={<IconUser size={13} />}
										label="Recipient"
										value={meta.recipient_email}
										muted={!meta.recipient_email}
									/>
									<Divider color={T.gray[1]} />
									<InfoRow
										icon={<IconBuilding size={13} />}
										label="Practice"
										value={meta.practice_name}
										muted={!meta.practice_name}
									/>
									<Divider color={T.gray[1]} />
									<InfoRow
										icon={<IconCalendarEvent size={13} />}
										label="Campaign"
										value={meta.campaign_name}
										muted={!meta.campaign_name}
									/>
									<Divider color={T.gray[1]} />
									<InfoRow
										icon={<IconClock size={13} />}
										label="Created"
										value={fmt(meta.created_at)}
									/>
									<Divider color={T.gray[1]} />
									<InfoRow
										label="Attempted at"
										value={fmt(meta.attempted_at)}
										muted={!meta.attempted_at}
									/>
									<Divider color={T.gray[1]} />
									<InfoRow
										label="Sent at"
										value={fmt(meta.sent_at)}
										muted={!meta.sent_at}
									/>
									<Divider color={T.gray[1]} />
									<InfoRow
										label="Email type"
										value={meta.email_type}
										mono
										muted={!meta.email_type}
									/>
									<Divider color={T.gray[1]} />
									<InfoRow
										label="Resend message ID"
										value={meta.resend_message_id}
										mono
										muted={!meta.resend_message_id}
									/>
									<Divider color={T.gray[1]} />
									<InfoRow
										label="Notification ID"
										value={meta.notification_id}
										mono
										muted={!meta.notification_id}
									/>

									{meta.error_message && (
										<>
											<Divider color={T.gray[1]} mb={8} />
											<Card
												p="sm"
												radius={8}
												bg="red.0"
												style={{ border: `1px solid ${T.red[1]}` }}
											>
												<Text
													size="xs"
													c="red.8"
													fw={700}
													tt="uppercase"
													lts={0.3}
													mb={4}
												>
													Error
												</Text>
												<Text size="sm" c="red.7" ff="monospace">
													{meta.error_message}
												</Text>
											</Card>
										</>
									)}
								</Stack>
							</Card>
						</Tabs.Panel>

						{/* Payload */}
						<Tabs.Panel value="payload" pt="md">
							<Card
								radius={10}
								p={0}
								style={{
									border: `1px solid ${T.gray[1]}`,
									overflow: "hidden",
									background: "#fafbff",
								}}
								shadow="xs"
							>
								<ScrollArea
									h={"60vh"}
									type="auto"
									scrollbarSize={8}
									scrollbars="y"
									styles={{
										scrollbar: { background: "transparent" },
										thumb: { background: T.gray[3], borderRadius: 6 },
									}}
								>
									<Box p="md" style={subtleScroll}>
										<Code
											block
											fz="xs"
											style={{
												background: "transparent",
												border: "none",
												color: T.gray[8],
												lineHeight: 1.55,
											}}
										>
											{JSON.stringify(meta.payload ?? {}, null, 2)}
										</Code>
									</Box>
								</ScrollArea>
							</Card>
						</Tabs.Panel>
					</Tabs>
				</Stack>
			)}
		</Drawer>
	);
}
