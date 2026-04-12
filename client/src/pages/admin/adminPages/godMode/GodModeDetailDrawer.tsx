import {
	Drawer,
	Tabs,
	Stack,
	Text,
	Group,
	Badge,
	Loader,
	Center,
	useMantineTheme,
	Box,
	ActionIcon,
	rgba,
	CopyButton,
	Tooltip,
} from "@mantine/core";
import {
	IconInfoCircle,
	IconPhoto,
	IconMail,
	IconHistory,
	IconAlertTriangle,
	IconBolt,
	IconX,
	IconCopy,
	IconCheck,
} from "@tabler/icons-react";
import { useGodModeSelectionDetails } from "@/hooks/godMode.hooks";
import { startCase } from "lodash";
import { statusColors } from "@/shared/shared.const";
import GodModeOverviewTab from "./tabs/GodModeOverviewTab";
import GodModeAssetsTab from "./tabs/GodModeAssetsTab";
import GodModeNotificationsTab from "./tabs/GodModeNotificationsTab";
import GodModeWorkflowTab from "./tabs/GodModeWorkflowTab";
import GodModeHistoryTab from "./tabs/GodModeHistoryTab";
import GodModeDangerZoneTab from "./tabs/GodModeDangerZoneTab";
import { useIsMobile } from "@/shared/shared.hooks";

interface Props {
	opened: boolean;
	selectionId: string | null;
	onClose: () => void;
}

export default function GodModeDetailDrawer({
	opened,
	selectionId,
	onClose,
}: Props) {
	const T = useMantineTheme().colors;
	const isMobile = useIsMobile();
	const { data, isLoading, isError, error } = useGodModeSelectionDetails(
		selectionId,
		opened
	);

	const selection = data?.selection;
	const campaign = data?.campaign;
	const bespoke = data?.bespoke_campaign;
	const practice = data?.practice;

	const campaignName = bespoke?.name ?? campaign?.name ?? "—";
	const isBespoke = !!bespoke;
	const statusColor = selection?.status
		? (statusColors as any)[selection.status] ?? "gray"
		: "gray";

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position="right"
			size={isMobile ? "100%" : "52%"}
			offset={isMobile ? 0 : 16}
			radius={isMobile ? 0 : "lg"}
			padding={0}
			withCloseButton={false}
			overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
			styles={{
				body: { padding: 0, height: "100%" },
			}}
		>
			<Stack
				gap={0}
				h="100%"
				style={{ background: "white" }}
			>
				{/* Status accent strip */}
				<Box
					style={{
						height: 4,
						background: statusColor,
					}}
				/>

				{/* Header */}
				<Box
					px="xl"
					pt="md"
					pb="lg"
					style={{
						background: "white",
						borderBottom: `1px solid ${T.gray[1]}`,
					}}
				>
					{/* Top row: micro-label + close */}
					<Group justify="space-between" align="center" mb="md">
						<Group gap={6}>
							<IconBolt size={14} color={T.violet[6]} />
							<Text
								size="xs"
								fw={700}
								c="violet.7"
								tt="uppercase"
								style={{ letterSpacing: 1 }}
							>
								God Mode
							</Text>
							<Text size="xs" c="gray.4">
								•
							</Text>
							<Text size="xs" c="gray.6" fw={500}>
								Selection
							</Text>
						</Group>
						<ActionIcon
							variant="subtle"
							color="gray"
							size="md"
							radius="md"
							onClick={onClose}
							aria-label="Close"
						>
							<IconX size={16} />
						</ActionIcon>
					</Group>

					{/* Hero row: campaign name + status */}
					<Group
						justify="space-between"
						align="flex-start"
						wrap="nowrap"
						mb="sm"
					>
						<Text
							fz={22}
							fw={700}
							c="gray.9"
							lineClamp={2}
							style={{ flex: 1, lineHeight: 1.25 }}
						>
							{campaignName}
						</Text>
						{selection?.status && (
							<Box
								style={{
									padding: "6px 12px",
									borderRadius: 8,
									background: rgba(statusColor, 0.1),
									border: `1px solid ${rgba(statusColor, 0.25)}`,
									flexShrink: 0,
								}}
							>
								<Text size="xs" fw={700} c={statusColor as any}>
									{startCase(selection.status)}
								</Text>
							</Box>
						)}
					</Group>

					{/* Meta row */}
					<Group gap="xs" align="center">
						<Badge
							variant="light"
							color={isBespoke ? "violet" : "blue"}
							size="sm"
							radius="sm"
						>
							{isBespoke ? "Bespoke" : "Catalog"}
						</Badge>
						{practice?.name && (
							<>
								<Text size="xs" c="gray.4">
									•
								</Text>
								<Text size="xs" c="gray.7" fw={500}>
									{practice.name}
								</Text>
							</>
						)}
						{selection?.id && (
							<>
								<Text size="xs" c="gray.4">
									•
								</Text>
								<Group gap={4} align="center">
									<Text size="xs" c="gray.5" ff="monospace">
										{selection.id.slice(0, 8)}
									</Text>
									<CopyButton value={selection.id} timeout={1500}>
										{({ copied, copy }) => (
											<Tooltip
												label={copied ? "Copied" : "Copy full ID"}
												withArrow
											>
												<ActionIcon
													size="xs"
													variant="subtle"
													color="gray"
													onClick={copy}
												>
													{copied ? (
														<IconCheck size={11} />
													) : (
														<IconCopy size={11} />
													)}
												</ActionIcon>
											</Tooltip>
										)}
									</CopyButton>
								</Group>
							</>
						)}
					</Group>
				</Box>

				{/* Body */}
				<Box style={{ flex: 1, overflowY: "auto" }}>
					{isLoading && (
						<Center h={400}>
							<Loader color="violet" />
						</Center>
					)}

					{isError && (
						<Center h={400}>
							<Text c="red.6">
								Failed to load: {(error as Error)?.message}
							</Text>
						</Center>
					)}

					{!isLoading && !isError && data && (
						<Tabs
							defaultValue="overview"
							color="violet"
							variant="pills"
							radius="xl"
							styles={{
								list: {
									padding: "16px 24px 0 24px",
									gap: 6,
									borderBottom: "none",
								},
								tab: {
									fontWeight: 600,
									fontSize: 13,
								},
							}}
						>
							<Tabs.List>
								<Tabs.Tab
									value="overview"
									leftSection={<IconInfoCircle size={15} />}
								>
									Overview
								</Tabs.Tab>
								<Tabs.Tab
									value="assets"
									leftSection={<IconPhoto size={15} />}
								>
									Assets & Creatives
								</Tabs.Tab>
								<Tabs.Tab
									value="notifications"
									leftSection={<IconMail size={15} />}
								>
									Notification Payloads
								</Tabs.Tab>
								<Tabs.Tab
									value="workflow"
									leftSection={<IconBolt size={15} />}
								>
									Workflow Actions
								</Tabs.Tab>
								<Tabs.Tab
									value="history"
									leftSection={<IconHistory size={15} />}
								>
									History
								</Tabs.Tab>
								<Tabs.Tab
									value="danger"
									leftSection={<IconAlertTriangle size={15} />}
									color="red"
								>
									Danger Zone
								</Tabs.Tab>
							</Tabs.List>

							<Box px="xl" py="xl">
								<Tabs.Panel value="overview">
									<GodModeOverviewTab data={data} />
								</Tabs.Panel>
								<Tabs.Panel value="assets">
									<GodModeAssetsTab data={data} />
								</Tabs.Panel>
								<Tabs.Panel value="notifications">
									<GodModeNotificationsTab data={data} />
								</Tabs.Panel>
								<Tabs.Panel value="workflow">
									<GodModeWorkflowTab data={data} />
								</Tabs.Panel>
								<Tabs.Panel value="history">
									<GodModeHistoryTab data={data} />
								</Tabs.Panel>
								<Tabs.Panel value="danger">
									<GodModeDangerZoneTab
										data={data}
										onSelectionRemoved={onClose}
									/>
								</Tabs.Panel>
							</Box>
						</Tabs>
					)}
				</Box>
			</Stack>
		</Drawer>
	);
}
