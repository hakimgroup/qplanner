export interface SelectionComment {
	id: string;
	selection_id: string;
	author_user_id: string | null;
	author_name: string;
	author_email: string | null;
	author_role: "user" | "admin" | "super_admin" | null;
	body: string;
	edited_at: string | null;
	created_at: string;
	is_mine: boolean;
}

export interface CommentInboxItem {
	target_id: string;
	comment_id: string;
	selection_id: string;
	practice_id: string;
	practice_name: string | null;
	campaign_name: string | null;
	is_bespoke: boolean;
	author_user_id: string | null;
	author_name: string;
	author_role: "user" | "admin" | "super_admin" | null;
	body: string;
	read_at: string | null;
	created_at: string;
}

/** One conversation (selection) in the grouped comment inbox. */
export interface CommentInboxGroup {
	selection_id: string;
	practice_id: string | null;
	practice_name: string | null;
	campaign_name: string | null;
	is_bespoke: boolean;
	comment_count: number;
	unread_count: number;
	last_comment_id: string;
	last_author_user_id: string | null;
	last_author_name: string;
	last_author_role: "user" | "admin" | "super_admin" | null;
	last_body: string;
	last_created_at: string;
	last_read_at: string | null;
}

export interface AddCommentArgs {
	selectionId: string;
	body: string;
}

export interface EditCommentArgs {
	commentId: string;
	body: string;
}
