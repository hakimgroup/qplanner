import {
	ActionIcon,
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Group,
	Menu,
	Stack,
	Text,
	Textarea,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import {
	IconDots,
	IconEdit,
	IconMessageCircle2,
	IconSend,
	IconTrash,
	IconX,
	IconCheck,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
	useAddComment,
	useDeleteComment,
	useEditComment,
	useSelectionCommentsThread,
} from "@/hooks/comment.hooks";
import { SelectionComment } from "@/models/comment.models";
import { SelectionStatus } from "@/shared/shared.models";

const MAX_COMMENT_LENGTH = 2000;

interface CommentsSectionProps {
	selectionId: string | null | undefined;
	status?: string | null;
	/** When this changes to true, the section scrolls itself into view. */
	scrollIntoView?: boolean;
}

export default function CommentsSection({
	selectionId,
	status,
	scrollIntoView,
}: CommentsSectionProps) {
	const T = useMantineTheme().colors;
	const sectionRef = useRef<HTMLDivElement>(null);
	const composerRef = useRef<HTMLTextAreaElement>(null);
	const [body, setBody] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editBody, setEditBody] = useState("");

	const isDraft = status === SelectionStatus.Draft;

	const { data: thread = [], isLoading } = useSelectionCommentsThread(
		isDraft ? null : selectionId,
	);
	const { mutate: addComment, isPending: posting } = useAddComment();
	const { mutate: editComment, isPending: editing } = useEditComment(
		selectionId ?? null,
	);
	const { mutate: deleteComment, isPending: deleting } = useDeleteComment(
		selectionId ?? null,
	);

	useEffect(() => {
		if (scrollIntoView && sectionRef.current) {
			sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [scrollIntoView, thread.length]);

	const counted = useMemo(() => thread.length, [thread]);

	if (!selectionId) return null;
	if (isDraft) return null;

	const trimmed = body.trim();
	const canPost = !!trimmed && trimmed.length <= MAX_COMMENT_LENGTH && !posting;

	const handlePost = () => {
		if (!canPost || !selectionId) return;
		addComment(
			{ selectionId, body: trimmed },
			{ onSuccess: () => setBody("") },
		);
	};

	const startEdit = (c: SelectionComment) => {
		setEditingId(c.id);
		setEditBody(c.body);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditBody("");
	};

	const saveEdit = () => {
		const t = editBody.trim();
		if (!editingId || !t) return;
		editComment(
			{ commentId: editingId, body: t },
			{ onSuccess: () => cancelEdit() },
		);
	};

	return (
		<Box ref={sectionRef} id="comments-section">
			<Card
				radius={10}
				p="md"
				style={{
					border: `1px solid ${T.gray[2]}`,
					backgroundColor: T.gray[0],
				}}
			>
				<Stack gap="sm">
					<Group justify="space-between" align="center" wrap="nowrap">
						<Group gap={8} align="center">
							<IconMessageCircle2 size={18} color={T.violet[6]} />
							<Text fw={700} size="sm" c="gray.9">
								Conversation
							</Text>
							{counted > 0 && (
								<Badge
									size="sm"
									variant="light"
									color="violet"
									radius="xl"
								>
									{counted}
								</Badge>
							)}
						</Group>
					</Group>

					{/* Thread */}
					{isLoading ? (
						<Text size="xs" c="gray.5">
							Loading conversation…
						</Text>
					) : thread.length === 0 ? (
						<Card
							radius={10}
							p="md"
							bg="white"
							style={{ border: `1px dashed ${T.gray[3]}` }}
						>
							<Text size="xs" c="gray.6" ta="center">
								No conversation yet. Start a comment to discuss the campaign.
							</Text>
						</Card>
					) : (
						<Stack gap={8}>
							{thread.map((c) => (
								<CommentRow
									key={c.id}
									comment={c}
									isEditing={editingId === c.id}
									editBody={editBody}
									setEditBody={setEditBody}
									onStartEdit={() => startEdit(c)}
									onCancelEdit={cancelEdit}
									onSaveEdit={saveEdit}
									onDelete={() =>
										deleteComment(c.id)
									}
									saving={editing}
									deleting={deleting}
								/>
							))}
						</Stack>
					)}

					{/* Composer */}
					<Card
						radius={10}
						p="xs"
						bg="white"
						style={{ border: `1px solid ${T.gray[2]}` }}
					>
						<Stack gap={6}>
							<Textarea
								ref={composerRef}
								value={body}
								onChange={(e) => setBody(e.currentTarget.value)}
								placeholder="Write a comment…"
								autosize
								minRows={2}
								maxRows={6}
								variant="unstyled"
								styles={{
									input: { padding: "6px 8px", fontSize: 13 },
								}}
								onKeyDown={(e) => {
									if (
										(e.metaKey || e.ctrlKey) &&
										e.key === "Enter"
									) {
										e.preventDefault();
										handlePost();
									}
								}}
								disabled={posting}
								maxLength={MAX_COMMENT_LENGTH}
							/>
							<Flex justify="space-between" align="center">
								<Text size="xs" c="gray.5">
									{trimmed.length}/{MAX_COMMENT_LENGTH}
								</Text>
								<Button
									size="compact-xs"
									radius={8}
									color="violet"
									leftSection={<IconSend size={13} />}
									disabled={!canPost}
									loading={posting}
									onClick={handlePost}
								>
									Post
								</Button>
							</Flex>
						</Stack>
					</Card>
				</Stack>
			</Card>
		</Box>
	);
}

interface CommentRowProps {
	comment: SelectionComment;
	isEditing: boolean;
	editBody: string;
	setEditBody: (s: string) => void;
	onStartEdit: () => void;
	onCancelEdit: () => void;
	onSaveEdit: () => void;
	onDelete: () => void;
	saving: boolean;
	deleting: boolean;
}

function CommentRow({
	comment,
	isEditing,
	editBody,
	setEditBody,
	onStartEdit,
	onCancelEdit,
	onSaveEdit,
	onDelete,
	saving,
	deleting,
}: CommentRowProps) {
	const T = useMantineTheme().colors;
	const isAdminSide =
		comment.author_role === "admin" || comment.author_role === "super_admin";

	const initials = useMemo(() => {
		const parts = (comment.author_name || "").trim().split(/\s+/);
		const first = parts[0]?.[0] ?? "";
		const last = parts[1]?.[0] ?? "";
		return (first + last).toUpperCase() || "?";
	}, [comment.author_name]);

	const when = useMemo(() => {
		try {
			return formatDistanceToNow(new Date(comment.created_at), {
				addSuffix: true,
			});
		} catch {
			return "";
		}
	}, [comment.created_at]);

	return (
		<Card
			radius={10}
			p="sm"
			bg="white"
			style={{ border: `1px solid ${T.gray[2]}` }}
		>
			<Group align="flex-start" wrap="nowrap" gap={10}>
				<Avatar
					color={isAdminSide ? "violet" : "gray"}
					radius="xl"
					size="sm"
					variant={isAdminSide ? "filled" : "light"}
				>
					{initials}
				</Avatar>

				<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
					<Group gap={6} wrap="nowrap" align="center">
						<Text size="xs" fw={700} c="gray.9" truncate>
							{comment.author_name || "Unknown"}
						</Text>
						<Badge
							size="xs"
							variant="light"
							color={isAdminSide ? "violet" : "gray"}
							radius="sm"
						>
							{isAdminSide ? "Hakim Group" : "Practice"}
						</Badge>
						<Text size="xs" c="gray.5">
							·
						</Text>
						<Tooltip label={new Date(comment.created_at).toLocaleString()}>
							<Text size="xs" c="gray.5">
								{when}
							</Text>
						</Tooltip>
						{comment.edited_at && (
							<Text size="xs" c="gray.4" fs="italic">
								(edited)
							</Text>
						)}
					</Group>

					{isEditing ? (
						<Stack gap={6} mt={4}>
							<Textarea
								value={editBody}
								onChange={(e) => setEditBody(e.currentTarget.value)}
								autosize
								minRows={2}
								maxRows={6}
								styles={{ input: { fontSize: 13 } }}
								maxLength={MAX_COMMENT_LENGTH}
							/>
							<Group gap={6} justify="flex-end">
								<Button
									size="compact-xs"
									variant="subtle"
									color="gray"
									leftSection={<IconX size={12} />}
									onClick={onCancelEdit}
									disabled={saving}
								>
									Cancel
								</Button>
								<Button
									size="compact-xs"
									color="violet"
									leftSection={<IconCheck size={12} />}
									onClick={onSaveEdit}
									loading={saving}
									disabled={!editBody.trim()}
								>
									Save
								</Button>
							</Group>
						</Stack>
					) : (
						<Text
							size="sm"
							c="gray.8"
							style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
						>
							{comment.body}
						</Text>
					)}
				</Stack>

				{comment.is_mine && !isEditing && (
					<Menu position="bottom-end" shadow="md" withArrow>
						<Menu.Target>
							<ActionIcon
								variant="subtle"
								color="gray"
								size="sm"
								radius={8}
								loading={deleting}
							>
								<IconDots size={14} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconEdit size={13} />}
								onClick={onStartEdit}
							>
								Edit
							</Menu.Item>
							<Menu.Item
								color="red"
								leftSection={<IconTrash size={13} />}
								onClick={onDelete}
							>
								Delete
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				)}
			</Group>
		</Card>
	);
}
