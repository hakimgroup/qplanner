import {
	ActionIcon,
	Avatar,
	Badge,
	Box,
	Flex,
	Indicator,
	Loader,
	Menu,
	Stack,
	Text,
	ThemeIcon,
	UnstyledButton,
	useMantineTheme,
} from "@mantine/core";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { IconMessageCircle2 } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import {
	useCommentInboxGrouped,
	useMarkAllCommentsRead,
	useMarkSelectionCommentsRead,
	useUnreadCommentConversationsCount,
} from "@/hooks/comment.hooks";
import { CommentInboxGroup } from "@/models/comment.models";
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
	const [opened, setOpened] = useState(false);

	const { data: count = 0 } = useUnreadCommentConversationsCount();
	const { data: inbox = [], isLoading } = useCommentInboxGrouped(10);
	const { mutate: markSelectionRead } = useMarkSelectionCommentsRead();
	const { mutate: markAll, isPending: markingAll } = useMarkAllCommentsRead();

	const unread = useMemo(() => Number(count) || 0, [count]);

	const handleRowClick = (row: CommentInboxGroup) => {
		if (row.unread_count > 0) markSelectionRead(row.selection_id);
		setOpened(false);
		openCommentDrawer(row.selection_id);
	};

	return (
		<Menu
			shadow="md"
			width={380}
			position="bottom-end"
			opened={opened}
			onChange={setOpened}
			closeOnItemClick={false}
		>
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

			<Menu.Dropdown p={0} style={{ overflowX: "hidden" }}>
				<Box p={15} pb={10}>
					<Flex align="center" justify="space-between">
						<Text fw={700} size="md" c="gray.9">
							Conversations
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

				<Box
					style={{
						maxHeight: 420,
						overflowY: "auto",
						overflowX: "hidden",
						scrollbarWidth: "thin",
						scrollbarColor: `${T.gray[2]} transparent`,
					}}
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
								key={row.selection_id}
								row={row}
								onClick={() => handleRowClick(row)}
							/>
						))}
				</Box>
			</Menu.Dropdown>
		</Menu>
	);
}

interface CommentBellRowProps {
	row: CommentInboxGroup;
	onClick: () => void;
}

function CommentBellRow({ row, onClick }: CommentBellRowProps) {
	const T = useMantineTheme().colors;
	const isUnread = row.unread_count > 0;
	const isAdminSide =
		row.last_author_role === "admin" || row.last_author_role === "super_admin";

	const initials = useMemo(() => {
		const parts = (row.last_author_name || "").trim().split(/\s+/);
		const first = parts[0]?.[0] ?? "";
		const last = parts[1]?.[0] ?? "";
		return (first + last).toUpperCase() || "?";
	}, [row.last_author_name]);

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
				<Stack
					gap={2}
					style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflow: "hidden" }}
				>
					<Flex gap={6} align="center" wrap="nowrap" style={{ minWidth: 0 }}>
						<Text
							size="xs"
							fw={700}
							c="gray.9"
							truncate
							style={{ flex: 1, minWidth: 0 }}
						>
							{row.campaign_name || "Campaign"}
						</Text>
						{isUnread && (
							<Badge color="red" size="xs" variant="filled" style={{ flexShrink: 0 }}>
								{row.unread_count} new
							</Badge>
						)}
						<Text size="xs" c="gray.5" style={{ flexShrink: 0 }}>
							{relativeTime(row.last_created_at)}
						</Text>
					</Flex>
					<Text size="xs" c="gray.6" truncate>
						{row.practice_name || "Practice"}
						{row.comment_count > 1
							? ` · ${row.comment_count} comments`
							: ""}
					</Text>
					<Text
						size="xs"
						c="gray.8"
						lineClamp={2}
						style={{
							wordBreak: "break-word",
							overflowWrap: "anywhere",
						}}
					>
						<Text span fw={600} c="gray.7">
							{(row.last_author_name || "Someone").split(/\s+/)[0]}:
						</Text>{" "}
						{excerpt(row.last_body)}
					</Text>
				</Stack>
			</Flex>
		</UnstyledButton>
	);
}
