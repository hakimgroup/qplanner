import {
	Anchor,
	Badge,
	Box,
	Button,
	Card,
	Drawer,
	Flex,
	Group,
	Image,
	Loader,
	Stack,
	Text,
	Textarea,
	useMantineTheme,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconBug,
	IconCalendarEvent,
	IconCircleCheck,
	IconDownload,
	IconFile,
	IconPhoto,
	IconRotateClockwise,
	IconTrash,
	IconUser,
	IconVideo,
} from "@tabler/icons-react";
import { useEffect, useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import {
	signBugAttachment,
	useCloseBugReport,
	useDeleteBugReport,
	useReopenBugReport,
} from "@/hooks/bugReport.hooks";
import { BugAttachment, BugReport, SEVERITY_META } from "@/models/bug.models";
import { useIsMobile } from "@/shared/shared.hooks";

interface Props {
	bug: BugReport | null;
	opened: boolean;
	onClose: () => void;
}

function humanSize(bytes: number): string {
	if (!bytes) return "";
	const units = ["B", "KB", "MB", "GB"];
	let n = bytes;
	let i = 0;
	while (n >= 1024 && i < units.length - 1) {
		n /= 1024;
		i++;
	}
	return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function fmt(s?: string | null) {
	if (!s) return "—";
	try {
		return format(parseISO(s), "d MMM yyyy, HH:mm");
	} catch {
		return s;
	}
}

export default function BugReportDetailDrawer({ bug, opened, onClose }: Props) {
	const T = useMantineTheme().colors;
	const isMobile = useIsMobile();
	const [urls, setUrls] = useState<Record<string, string | null>>({});
	const [signing, setSigning] = useState(false);
	const [resolution, setResolution] = useState("");
	const [confirmingDelete, setConfirmingDelete] = useState(false);

	const { mutate: closeBug, isPending: closing } = useCloseBugReport();
	const { mutate: reopenBug, isPending: reopening } = useReopenBugReport();
	const { mutate: deleteBug, isPending: deleting } = useDeleteBugReport();

	const subtleScroll = {
		scrollbarWidth: "thin" as const,
		scrollbarColor: `${T.gray[2]} transparent`,
	};

	// Mint signed URLs whenever a bug with attachments opens.
	useEffect(() => {
		let cancelled = false;
		setResolution("");
		setConfirmingDelete(false);
		setUrls({});
		const atts = (bug?.attachments ?? []) as BugAttachment[];
		if (!bug || atts.length === 0) return;
		setSigning(true);
		(async () => {
			const entries = await Promise.all(
				atts.map(
					async (a) => [a.path, await signBugAttachment(a.path)] as const,
				),
			);
			if (cancelled) return;
			setUrls(Object.fromEntries(entries));
			setSigning(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [bug]);

	const sev = bug ? SEVERITY_META[bug.severity] : SEVERITY_META.medium;
	const sevPalette = (T as any)[sev.color] ?? T.blue;
	const isOpen = bug?.status === "open";
	const atts = (bug?.attachments ?? []) as BugAttachment[];

	const handleClose = () => {
		if (!bug) return;
		closeBug(
			{ id: bug.id, resolutionNote: resolution.trim() || null },
			{ onSuccess: () => onClose() },
		);
	};

	const handleReopen = () => {
		if (!bug) return;
		reopenBug(bug.id, { onSuccess: () => onClose() });
	};

	const handleDelete = () => {
		if (!bug) return;
		deleteBug(bug, { onSuccess: () => onClose() });
	};

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position="right"
			size={isMobile ? "100%" : "40rem"}
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
							background: `linear-gradient(135deg, ${T.red[0]}, ${T.violet[0]})`,
						}}
					>
						<IconBug size={18} color={T.red[6]} />
					</Box>
					<Stack gap={0}>
						<Text fw={700} size="md" c="gray.9">
							Bug Ticket
						</Text>
						<Text size="xs" c="gray.6">
							Report details & resolution
						</Text>
					</Stack>
				</Group>
			}
			styles={{ body: { ...subtleScroll, paddingTop: 8 } }}
		>
			{!bug ? null : (
				<Stack gap={18}>
					{/* Hero — gradient keyed to severity */}
					<Card
						radius={12}
						p="lg"
						shadow="xs"
						style={{
							background: `linear-gradient(135deg, ${sevPalette[0]} 0%, ${T.violet[0]} 100%)`,
							border: `1px solid ${sevPalette[1]}`,
						}}
					>
						<Stack gap={12}>
							<Group justify="space-between" align="center">
								<Text
									size="xs"
									fw={700}
									tt="uppercase"
									lts={0.5}
									c={`${sev.color}.7`}
								>
									Bug report
								</Text>
								<Badge
									color={isOpen ? "green" : "gray"}
									variant={isOpen ? "filled" : "light"}
									radius="sm"
									size="sm"
									fw={700}
								>
									{isOpen ? "Open" : "Closed"}
								</Badge>
							</Group>

							<Text fw={700} size="xl" c="gray.9" lh={1.25}>
								{bug.title}
							</Text>

							<Group gap={8}>
								<Badge
									color={sev.color}
									variant="filled"
									radius="sm"
									size="sm"
									fw={700}
								>
									{sev.label} severity
								</Badge>
							</Group>

							<Group gap={18} mt={2}>
								<Group gap={6}>
									<IconUser size={14} color={T.gray[6]} />
									<Text size="xs" c="gray.7" fw={500}>
										{bug.created_by_name || "Unknown"}
									</Text>
								</Group>
								<Group gap={6}>
									<IconCalendarEvent size={14} color={T.gray[6]} />
									<Text size="xs" c="gray.7" fw={500}>
										{fmt(bug.created_at)}
									</Text>
								</Group>
							</Group>
						</Stack>
					</Card>

					{/* Description */}
					<Stack gap={8}>
						<SectionLabel>Description</SectionLabel>
						<Card
							radius={10}
							p="md"
							style={{
								border: `1px solid ${T.gray[2]}`,
								backgroundColor: T.gray[0],
							}}
						>
							<Text
								size="sm"
								c="gray.8"
								style={{
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
									lineHeight: 1.6,
								}}
							>
								{bug.description}
							</Text>
						</Card>
					</Stack>

					{/* Attachments */}
					{atts.length > 0 && (
						<Stack gap={8}>
							<Flex justify="space-between" align="center">
								<SectionLabel>Attachments</SectionLabel>
								<Badge
									variant="light"
									color="violet"
									radius="sm"
									size="sm"
								>
									{atts.length}
								</Badge>
							</Flex>
							{signing && (
								<Group gap={6} py={4}>
									<Loader size="xs" />
									<Text size="xs" c="gray.5">
										Preparing preview links…
									</Text>
								</Group>
							)}
							<Stack gap={10}>
								{atts.map((a) => (
									<AttachmentCard
										key={a.path}
										att={a}
										url={urls[a.path]}
									/>
								))}
							</Stack>
						</Stack>
					)}

					{/* Resolution / actions */}
					{isOpen ? (
						<Card
							radius={12}
							p="md"
							style={{ border: `1px solid ${T.gray[2]}` }}
						>
							<Stack gap={10}>
								<SectionLabel>Resolve this ticket</SectionLabel>
								<Textarea
									placeholder="Resolution note (optional) — what was the fix or outcome?"
									value={resolution}
									onChange={(e) => setResolution(e.currentTarget.value)}
									minRows={2}
									maxRows={5}
									autosize
									radius={10}
									disabled={closing}
								/>
								<Button
									color="green"
									radius={10}
									leftSection={<IconCircleCheck size={16} />}
									onClick={handleClose}
									loading={closing}
								>
									Close ticket
								</Button>
							</Stack>
						</Card>
					) : (
						<Card
							radius={12}
							p="md"
							style={{
								border: `1px solid ${T.green[1]}`,
								background: `linear-gradient(135deg, ${T.green[0]} 0%, ${T.gray[0]} 100%)`,
							}}
						>
							<Stack gap={10}>
								<Group gap={8} align="center">
									<IconCircleCheck size={18} color={T.green[6]} />
									<Text fw={700} size="sm" c="green.8">
										Resolved
									</Text>
								</Group>
								<Text size="sm" c="gray.8" style={{ lineHeight: 1.55 }}>
									{bug.resolution_note || "No resolution note was added."}
								</Text>
								<Text size="xs" c="gray.5">
									Closed by {bug.closed_by_name || "—"} · {fmt(bug.closed_at)}
								</Text>
								<Button
									variant="light"
									color="orange"
									radius={10}
									leftSection={<IconRotateClockwise size={16} />}
									onClick={handleReopen}
									loading={reopening}
									w="fit-content"
								>
									Reopen ticket
								</Button>
							</Stack>
						</Card>
					)}

					{/* Delete — destructive, admin-wide, inline confirm */}
					{confirmingDelete ? (
						<Card
							radius={12}
							p="md"
							style={{
								border: `1px solid ${T.red[2]}`,
								backgroundColor: T.red[0],
							}}
						>
							<Stack gap={10}>
								<Group gap={8} align="center">
									<IconAlertTriangle size={18} color={T.red[6]} />
									<Text fw={700} size="sm" c="red.8">
										Delete this ticket permanently?
									</Text>
								</Group>
								<Text size="xs" c="gray.7">
									The report and its attachments will be removed. This
									can't be undone.
								</Text>
								<Group gap="xs">
									<Button
										color="red"
										radius={10}
										leftSection={<IconTrash size={16} />}
										onClick={handleDelete}
										loading={deleting}
									>
										Delete permanently
									</Button>
									<Button
										variant="default"
										radius={10}
										onClick={() => setConfirmingDelete(false)}
										disabled={deleting}
									>
										Cancel
									</Button>
								</Group>
							</Stack>
						</Card>
					) : (
						<Flex justify="flex-end">
							<Button
								variant="subtle"
								color="red"
								size="xs"
								leftSection={<IconTrash size={14} />}
								onClick={() => setConfirmingDelete(true)}
							>
								Delete this ticket
							</Button>
						</Flex>
					)}
				</Stack>
			)}
		</Drawer>
	);
}

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<Text size="xs" fw={700} c="violet.7" tt="uppercase" lts={0.5}>
			{children}
		</Text>
	);
}

function AttachmentCard({
	att,
	url,
}: {
	att: BugAttachment;
	url: string | null | undefined;
}) {
	const T = useMantineTheme().colors;
	const isImage = att.type.startsWith("image/");
	const isVideo = att.type.startsWith("video/");
	const Icon = isImage ? IconPhoto : isVideo ? IconVideo : IconFile;

	return (
		<Card
			radius={12}
			p={0}
			style={{ border: `1px solid ${T.gray[2]}`, overflow: "hidden" }}
		>
			{url && isImage && (
				<Image src={url} alt={att.name} fit="cover" mah={280} />
			)}
			{url && isVideo && (
				<video
					src={url}
					controls
					style={{
						width: "100%",
						maxHeight: 300,
						display: "block",
						background: "#000",
					}}
				/>
			)}

			<Flex
				align="center"
				justify="space-between"
				gap="sm"
				px="md"
				py="sm"
				style={
					url && (isImage || isVideo)
						? { borderTop: `1px solid ${T.gray[1]}` }
						: undefined
				}
			>
				<Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
					<Box
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 32,
							height: 32,
							borderRadius: 8,
							background: T.violet[0],
							color: T.violet[6],
							flexShrink: 0,
						}}
					>
						<Icon size={16} />
					</Box>
					<Stack gap={0} style={{ minWidth: 0 }}>
						<Text size="xs" fw={600} c="gray.8" truncate>
							{att.name}
						</Text>
						<Text size="xs" c="gray.5">
							{humanSize(att.size)}
						</Text>
					</Stack>
				</Group>
				{url ? (
					<Anchor
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						download={att.name}
						c="violet.6"
						style={{ flexShrink: 0, display: "flex" }}
					>
						<IconDownload size={18} />
					</Anchor>
				) : (
					<Text size="xs" c="red.6" style={{ flexShrink: 0 }}>
						unavailable
					</Text>
				)}
			</Flex>
		</Card>
	);
}
