import { useMemo, useState } from "react";
import {
	Avatar,
	Badge,
	Box,
	Card,
	Center,
	Container,
	Flex,
	Group,
	Loader,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { IconMessageCircle2, IconSearch, IconBuildings } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import {
	useCommentInboxGrouped,
	useMarkSelectionCommentsRead,
} from "@/hooks/comment.hooks";
import { CommentInboxGroup } from "@/models/comment.models";
import { useCommentDrawer } from "@/components/comments/CommentDeepLinkDrawer";

function relativeTime(s: string): string {
	try {
		return formatDistanceToNow(new Date(s), { addSuffix: true });
	} catch {
		return "";
	}
}

function excerpt(s: string, max = 200): string {
	const t = (s || "").trim().replace(/\s+/g, " ");
	return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export default function ConversationsCenter() {
	const T = useMantineTheme().colors;
	const { open: openCommentDrawer } = useCommentDrawer();
	const { mutate: markSelectionRead } = useMarkSelectionCommentsRead();

	// Full list (the bell shows 10; here we pull a generous page).
	const { data: inbox = [], isLoading } = useCommentInboxGrouped(100);
	const [query, setQuery] = useState("");

	const rows = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return inbox;
		return inbox.filter((r) =>
			[r.campaign_name, r.practice_name, r.last_author_name, r.last_body]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(q)
		);
	}, [inbox, query]);

	const unreadConvos = useMemo(
		() => inbox.filter((r) => r.unread_count > 0).length,
		[inbox]
	);

	const handleOpen = (row: CommentInboxGroup) => {
		if (row.unread_count > 0) markSelectionRead(row.selection_id);
		openCommentDrawer(row.selection_id);
	};

	return (
		<Container size={1280} mx="auto" pb={80}>
			<Stack gap={25} mt={25}>
				<Stack gap={0}>
					<Group gap={10} align="center">
						<IconMessageCircle2 size={28} color={T.violet[6]} />
						<Title order={1}>Conversations</Title>
						{unreadConvos > 0 && (
							<Badge color="red" variant="filled" size="lg">
								{unreadConvos} new
							</Badge>
						)}
					</Group>
					<Text c="gray.6">
						All your campaign conversations in one place — grouped by
						campaign, newest first.
					</Text>
				</Stack>

				<TextInput
					radius={10}
					size="md"
					placeholder="Search by campaign, practice, person, or message…"
					leftSection={<IconSearch size={18} />}
					value={query}
					onChange={(e) => setQuery(e.currentTarget.value)}
					maw={520}
				/>

				{isLoading && (
					<Center py={60}>
						<Loader size="sm" />
					</Center>
				)}

				{!isLoading && rows.length === 0 && (
					<Center py={60}>
						<Stack align="center" gap="xs">
							<ThemeIcon size="xl" radius="xl" color="gray" variant="light">
								<IconMessageCircle2 size={22} />
							</ThemeIcon>
							<Text c="gray.6" fw={500}>
								{query ? "No matching conversations" : "No conversations yet"}
							</Text>
							<Text c="gray.5" size="sm">
								{query
									? "Try a different search."
									: "Comments on your campaigns will appear here."}
							</Text>
						</Stack>
					</Center>
				)}

				{!isLoading &&
					rows.map((row) => (
						<ConversationCard key={row.selection_id} row={row} onClick={() => handleOpen(row)} />
					))}
			</Stack>
		</Container>
	);
}

function ConversationCard({
	row,
	onClick,
}: {
	row: CommentInboxGroup;
	onClick: () => void;
}) {
	const T = useMantineTheme().colors;
	const isUnread = row.unread_count > 0;
	const isAdminSide =
		row.last_author_role === "admin" || row.last_author_role === "super_admin";

	const initials = useMemo(() => {
		const parts = (row.last_author_name || "").trim().split(/\s+/);
		return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
	}, [row.last_author_name]);

	return (
		<Card
			radius={10}
			withBorder
			px="md"
			py="sm"
			shadow="xs"
			onClick={onClick}
			style={{
				cursor: "pointer",
				backgroundColor: isUnread ? T.violet[0] : "white",
				borderColor: isUnread ? T.violet[2] : T.gray[2],
				borderLeft: `4px solid ${isUnread ? T.violet[5] : T.gray[3]}`,
			}}
		>
			<Flex gap={12} align="flex-start" wrap="nowrap">
				<Avatar
					color={isAdminSide ? "violet" : "gray"}
					radius="xl"
					size="md"
					variant={isAdminSide ? "filled" : "light"}
					mt={2}
				>
					{initials}
				</Avatar>

				<Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
					<Flex justify="space-between" align="center" gap={8} wrap="nowrap">
						<Group gap={8} align="center" style={{ minWidth: 0 }}>
							<Text fw={700} size="sm" c="gray.9" lineClamp={1}>
								{row.campaign_name || "Campaign"}
							</Text>
							{row.comment_count > 1 && (
								<Badge color="gray.2" c="gray.7" variant="filled" size="xs">
									{row.comment_count}
								</Badge>
							)}
						</Group>
						<Group gap={8} align="center" style={{ flexShrink: 0 }}>
							{isUnread && (
								<Badge color="red" variant="filled" size="xs">
									{row.unread_count} new
								</Badge>
							)}
							<Text size="xs" c="gray.5">
								{relativeTime(row.last_created_at)}
							</Text>
						</Group>
					</Flex>

					{row.practice_name && (
						<Group gap={4} align="center">
							<IconBuildings size={12} color={T.blue[5]} />
							<Text size="xs" c="blue.6" fw={500} lineClamp={1}>
								{row.practice_name}
							</Text>
						</Group>
					)}

					<Text size="sm" c="gray.8" lineClamp={2} style={{ wordBreak: "break-word" }}>
						<Text span fw={600} c="gray.7">
							{(row.last_author_name || "Someone").split(/\s+/)[0]}:
						</Text>{" "}
						{excerpt(row.last_body)}
					</Text>
				</Stack>
			</Flex>
		</Card>
	);
}
