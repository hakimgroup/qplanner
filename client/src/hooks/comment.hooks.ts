import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { RPCFunctions } from "@/shared/shared.models";
import {
	AddCommentArgs,
	CommentInboxGroup,
	CommentInboxItem,
	EditCommentArgs,
	SelectionComment,
} from "@/models/comment.models";
import { sendCommentEmail } from "@/api/emails";
import { toast } from "sonner";

// React Query key roots so we can invalidate predictably.
export const COMMENT_KEYS = {
	thread: (selectionId: string) => ["comments:thread", selectionId] as const,
	inbox: ["comments:inbox"] as const,
	inboxGrouped: ["comments:inbox:grouped"] as const,
	unread: ["comments:unread"] as const,
	unreadConversations: ["comments:unread:conversations"] as const,
};

/** Thread for a given selection. Ordered ASC (oldest → newest). */
export function useSelectionCommentsThread(selectionId: string | null | undefined) {
	return useQuery({
		queryKey: COMMENT_KEYS.thread(selectionId ?? "none"),
		enabled: !!selectionId,
		queryFn: async (): Promise<SelectionComment[]> => {
			const { data, error } = await supabase.rpc(
				RPCFunctions.ListSelectionComments,
				{ p_selection_id: selectionId },
			);
			if (error) throw error;
			return (data as SelectionComment[]) ?? [];
		},
		staleTime: 15_000,
	});
}

/** Latest N comments targeted at the caller — drives the chat-icon dropdown. */
export function useCommentInbox(limit = 10) {
	return useQuery({
		queryKey: COMMENT_KEYS.inbox,
		queryFn: async (): Promise<CommentInboxItem[]> => {
			const { data, error } = await supabase.rpc(
				RPCFunctions.ListMyCommentInbox,
				{ p_limit: limit },
			);
			if (error) throw error;
			return (data as CommentInboxItem[]) ?? [];
		},
		staleTime: 15_000,
		refetchOnWindowFocus: true,
	});
}

/**
 * Grouped inbox: one row per conversation (selection). Drives the chat-icon
 * dropdown — all comments for a campaign collapse into a single row.
 */
export function useCommentInboxGrouped(limit = 10) {
	return useQuery({
		queryKey: COMMENT_KEYS.inboxGrouped,
		queryFn: async (): Promise<CommentInboxGroup[]> => {
			const { data, error } = await supabase.rpc(
				RPCFunctions.ListMyCommentInboxGrouped,
				{ p_limit: limit },
			);
			if (error) throw error;
			return (data as CommentInboxGroup[]) ?? [];
		},
		staleTime: 15_000,
		refetchOnWindowFocus: true,
	});
}

/** Count of conversations (selections) with unread comments — badge. */
export function useUnreadCommentConversationsCount() {
	return useQuery({
		queryKey: COMMENT_KEYS.unreadConversations,
		queryFn: async (): Promise<number> => {
			const { data, error } = await supabase.rpc(
				RPCFunctions.UnreadCommentConversationsCount,
			);
			if (error) throw error;
			return Number(data) || 0;
		},
		staleTime: 15_000,
		refetchOnWindowFocus: true,
		refetchInterval: 30_000,
	});
}

/** Unread count for the badge on the chat icon. */
export function useUnreadCommentCount() {
	return useQuery({
		queryKey: COMMENT_KEYS.unread,
		queryFn: async (): Promise<number> => {
			const { data, error } = await supabase.rpc(
				RPCFunctions.UnreadCommentCount,
			);
			if (error) throw error;
			return Number(data) || 0;
		},
		staleTime: 15_000,
		refetchOnWindowFocus: true,
		refetchInterval: 30_000,
	});
}

export function useAddComment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ selectionId, body }: AddCommentArgs) => {
			const { data, error } = await supabase.rpc(RPCFunctions.AddSelectionComment, {
				p_selection_id: selectionId,
				p_body: body,
			});
			if (error) throw error;
			if (data && !data.success) throw new Error(data.error || "Failed to post comment");
			return data as { comment_id: string; targets_count: number; author_role: string };
		},
		onSuccess: (data, vars) => {
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.thread(vars.selectionId) });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inbox });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inboxGrouped });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unread });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unreadConversations });
			if (data?.comment_id && data?.targets_count > 0) {
				sendCommentEmail({ commentId: data.comment_id });
			}
		},
		onError: (err: any) => {
			toast.error(err?.message || "Failed to post comment");
		},
	});
}

export function useEditComment(selectionId: string | null) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ commentId, body }: EditCommentArgs) => {
			const { data, error } = await supabase.rpc(RPCFunctions.EditSelectionComment, {
				p_comment_id: commentId,
				p_body: body,
			});
			if (error) throw error;
			if (data && !data.success) throw new Error(data.error || "Failed to edit comment");
			return data;
		},
		onSuccess: () => {
			if (selectionId) {
				qc.invalidateQueries({ queryKey: COMMENT_KEYS.thread(selectionId) });
			}
		},
		onError: (err: any) => {
			toast.error(err?.message || "Failed to edit comment");
		},
	});
}

export function useDeleteComment(selectionId: string | null) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (commentId: string) => {
			const { data, error } = await supabase.rpc(RPCFunctions.DeleteSelectionComment, {
				p_comment_id: commentId,
			});
			if (error) throw error;
			if (data && !data.success) throw new Error(data.error || "Failed to delete comment");
			return data;
		},
		onSuccess: () => {
			if (selectionId) {
				qc.invalidateQueries({ queryKey: COMMENT_KEYS.thread(selectionId) });
			}
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inbox });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inboxGrouped });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unread });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unreadConversations });
		},
		onError: (err: any) => {
			toast.error(err?.message || "Failed to delete comment");
		},
	});
}

export function useMarkCommentRead() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (commentId: string) => {
			const { error } = await supabase.rpc(RPCFunctions.MarkCommentRead, {
				p_comment_id: commentId,
			});
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inbox });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inboxGrouped });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unread });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unreadConversations });
		},
	});
}

/**
 * Marks EVERY comment for a selection read for the caller — used when a
 * grouped conversation row is opened from the bell.
 */
export function useMarkSelectionCommentsRead() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (selectionId: string) => {
			const { data, error } = await supabase.rpc(
				RPCFunctions.MarkSelectionCommentsRead,
				{ p_selection_id: selectionId },
			);
			if (error) throw error;
			if (data && !data.success)
				throw new Error(data.error || "Failed to mark read");
			return data;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inbox });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inboxGrouped });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unread });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unreadConversations });
		},
	});
}

export function useMarkAllCommentsRead() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const { error } = await supabase.rpc(RPCFunctions.MarkAllCommentsRead);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inbox });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.inboxGrouped });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unread });
			qc.invalidateQueries({ queryKey: COMMENT_KEYS.unreadConversations });
		},
	});
}
