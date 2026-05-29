import {
	ActionIcon,
	Avatar,
	Badge,
	Box,
	Flex,
	Indicator,
	Loader,
	Menu,
	ScrollArea,
	Stack,
	Text,
	ThemeIcon,
	UnstyledButton,
	useMantineTheme,
} from "@mantine/core";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { IconMessageCircle2 } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import {
	useCommentInbox,
	useMarkAllCommentsRead,
	useMarkCommentRead,
	useUnreadCommentCount,
} from "@/hooks/comment.hooks";
import { CommentInboxItem } from "@/models/comment.models";
import { useCommentDrawer } from "./CommentDeepLinkDrawer";

function relativeTime(s: string): string {
	try {
		return formatDistanceToNow(new Date(s), { addSuffix: true });
	} catch {
		return "";
	}
}

function excerpt(s: string, max = 120): string {
	const t = s.trim().replace(/\s+/g, " ");
	return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export default function CommentBell() {
	const T = useMantineTheme().colors;
	const { open: openCommentDrawer } = useCommentDrawer();

	const { data: count = 0 } = useUnreadCommentCount();
	const { data: inbox = [], isLoading } = useCommentInbox(10);
	const { mutate: markRead } = useMarkCommentRead();
	const { mutate: markAll, isPending: markingAll } = useMarkAllCommentsRead();

	const unread = useMemo(() => Number(count) || 0, [count]);

	const handleRowClick = (row: CommentInboxItem) => {
		if (!row.read_at) markRead(row.comment_id);
		openCommentDrawer(row.selection_id);
	};

	return (
		<Menu shadow="md" width={380} position="bottom-end" closeOnItemClick={false}>
			<Menu.Target>
				<Indicator
					inline
					disabled={unread === 0}
					label={unread > 9 ? "9+" : String(unread || "")}
					size={19}
					color="red"
					offset={5}
				>
					<ActionIcon variant="subtle" size="lg" radius={10} color="violet">
						<IconMessageCircle2 color={T.gray[9]} size={18} />
					</ActionIcon>
				</Indicator>
			</Menu.Target>

			<Menu.Dropdown p={0}>
				<Box p={15} pb={10}>
					<Flex align="center" justify="space-between">
						<Text fw={700} size="md" c="gray.9">
							Conversation
						</Text>
						{unread > 0 ? (
							<UnstyledButton
								onClick={() => markAll()}
								disabled={markingAll}
								style={{
									fontSize: 12,
									color: T.violet[6],
									fontWeight: 600,
								}}
							>
								Mark all read
							</UnstyledButton>
						) : (
							<Badge color="gray.4" variant="light">
								No new
							</Badge>
						)}
					</Flex>
				</Box>

				<GradientDivider />

				<ScrollArea.Autosize
					mah={420}
					type="auto"
					offsetScrollbars
					scrollbarSize={6}
				>
					{isLoading && (
						<Flex align="center" justify="center" p={20}>
							<Loader size="sm" />
						</Flex>
					)}

					{!isLoading && inbox.length === 0 && (
						<Flex
							align="center"
							justify="center"
							py="xl"
							direction="column"
							gap="xs"
						>
							<ThemeIcon size="xl" radius="xl" color="gray" variant="light">
								<IconMessageCircle2 size={20} />
							</ThemeIcon>
							<Text c="gray.6" size="sm" fw={500}>
								No comments
							</Text>
							<Text c="gray.5" size="xs">
								You're all caught up.
							</Text>
						</Flex>
					)}

					{!isLoading &&
						inbox.map((row) => (
							<CommentBellRow
								key={row.comment_id}
								row={row}
								onClick={() => handleRowClick(row)}
							/>
						))}
				</ScrollArea.Autosize>
			</Menu.Dropdown>
		</Menu>
	);
}

interface CommentBellRowProps {
	row: CommentInboxItem;
	onClick: () => void;
}

function CommentBellRow({ row, onClick }: CommentBellRowProps) {
	const T = useMantineTheme().colors;
	const isUnread = !row.read_at;
	const isAdminSide =
		row.author_role === "admin" || row.author_role === "super_admin";

	const initials = useMemo(() => {
		const parts = (row.author_name || "").trim().split(/\s+/);
		const first = parts[0]?.[0] ?? "";
		const last = parts[1]?.[0] ?? "";
		return (first + last).toUpperCase() || "?";
	}, [row.author_name]);

	return (
		<UnstyledButton
			onClick={onClick}
			style={{
				display: "block",
				width: "100%",
				padding: "10px 14px",
				borderBottom: `1px solid ${T.gray[1]}`,
				backgroundColor: isUnread ? T.violet[0] : "transparent",
				transition: "background-color 100ms",
			}}
		>
			<Flex gap={10} align="flex-start" wrap="nowrap">
				{isUnread && (
					<Box
						style={{
							width: 6,
							height: 6,
							marginTop: 10,
							borderRadius: "50%",
							backgroundColor: T.violet[6],
							flexShrink: 0,
						}}
					/>
				)}
				<Avatar
					color={isAdminSide ? "violet" : "gray"}
					radius="xl"
					size="sm"
					variant={isAdminSide ? "filled" : "light"}
				>
					{initials}
				</Avatar>
				<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
					<Flex gap={6} align="center" wrap="nowrap">
						<Text size="xs" fw={700} c="gray.9" truncate>
							{row.author_name || "Unknown"}
						</Text>
						<Badge
							size="xs"
							variant="light"
							color={isAdminSide ? "violet" : "gray"}
							radius="sm"
						>
							{isAdminSide ? "HG" : "Practice"}
						</Badge>
						<Text size="xs" c="gray.5" style={{ marginLeft: "auto" }}>
							{relativeTime(row.created_at)}
						</Text>
					</Flex>
					<Text size="xs" c="gray.6" truncate>
						{row.campaign_name || "Campaign"}
						{row.practice_name ? ` · ${row.practice_name}` : ""}
					</Text>
					<Text
						size="xs"
						c="gray.8"
						lineClamp={2}
						style={{ whiteSpace: "pre-wrap" }}
					>
						{excerpt(row.body)}
					</Text>
				</Stack>
			</Flex>
		</UnstyledButton>
	);
}
