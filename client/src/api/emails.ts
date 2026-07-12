import api from "./express";
import { supabase } from "./supabase";
import { RPCFunctions } from "@/shared/shared.models";

/**
 * Email API helpers for sending notification and actor emails
 * These are fire-and-forget - errors are logged but don't affect the main flow
 *
 * Every send wraps the network call in pre-flight + post-flight attempt logging
 * so a failure to even REACH the Express server (network error, 4xx/5xx from
 * Vercel routing, etc.) leaves a visible trail in notification_emails_log.
 */

/** Log an attempt before any network call; returns the row id (or null on
 *  failure — logging must never block the underlying send). */
async function logAttempt(params: {
	notificationId?: string | null;
	emailType?: string | null;
	practiceId?: string | null;
	selectionId?: string | null;
	recipientEmail?: string | null;
}): Promise<string | null> {
	try {
		const { data, error } = await supabase.rpc(RPCFunctions.LogEmailAttempt, {
			p_notification_id: params.notificationId ?? null,
			p_email_type: params.emailType ?? null,
			p_attempt_source: "client",
			p_recipient_email: params.recipientEmail ?? null,
			p_practice_id: params.practiceId ?? null,
			p_selection_id: params.selectionId ?? null,
		});
		if (error) {
			console.warn("[Email Attempt] log_email_attempt error:", error.message);
			return null;
		}
		return (data as string) ?? null;
	} catch (err) {
		console.warn("[Email Attempt] log_email_attempt threw:", err);
		return null;
	}
}

/** Update an attempt row to terminal status. Idempotent server-side. */
async function finaliseAttempt(
	attemptId: string | null,
	status: "dispatched" | "failed",
	errorMessage?: string | null,
): Promise<void> {
	if (!attemptId) return;
	try {
		await supabase.rpc(RPCFunctions.FinaliseEmailAttempt, {
			p_attempt_id: attemptId,
			p_status: status,
			p_error_message: errorMessage ?? null,
			p_resend_message_id: null,
		});
	} catch (err) {
		console.warn("[Email Attempt] finalise_email_attempt threw:", err);
	}
}

interface SendNotificationEmailParams {
	notificationId: string;
	testEmailOverride?: string;
}

interface SendBulkNotificationEmailParams {
	notificationIds: string[];
	testEmailOverride?: string;
}

interface SendPlannerOverviewEmailsParams {
	testEmailOverride?: string;
}

interface SendPlannerOverviewEmailsResponse {
	processed: number;
	sent: number;
	skipped: number;
	errors: string[];
	practices: {
		practiceId: string;
		practiceName: string;
		recipientCount: number;
		selectionsCount: number;
	}[];
	duration_ms: number;
}

interface SendCommentEmailParams {
	commentId: string;
	testEmailOverride?: string;
}

interface SendActorEmailParams {
	type:
		| "added"
		| "updated"
		| "deleted"
		| "bespoke_added"
		| "bespoke_event_added"
		| "bulk_added"
		| "campaigns_copied";
	userId: string;
	practiceId: string;
	selectionId?: string;
	campaignName?: string;
	campaignCategory?: string;
	fromDate?: string;
	toDate?: string;
	isBespoke?: boolean;
	campaignsCount?: number;
	testEmailOverride?: string;
}

/**
 * Send notification email for workflow notifications (Assets Requested/Submitted)
 * Called after request_assets or submit_assets RPC
 */
export async function sendNotificationEmail(
	params: SendNotificationEmailParams
): Promise<void> {
	const attemptId = await logAttempt({
		notificationId: params.notificationId,
	});
	try {
		await api.post("/send-notification-email", params);
		await finaliseAttempt(attemptId, "dispatched");
	} catch (error: any) {
		const msg =
			error?.response?.status
				? `${error.response.status} ${error.message}`
				: error?.message ?? String(error);
		console.error("[Email API] Failed to send notification email:", error);
		await finaliseAttempt(attemptId, "failed", msg);
		// Fire-and-forget - don't throw
	}
}

/**
 * Send consolidated bulk notification email (one per practice)
 * Called after request_assets_bulk RPC
 */
export async function sendBulkNotificationEmail(
	params: SendBulkNotificationEmailParams
): Promise<void> {
	// Bulk endpoint covers many notifications; log one attempt per id so the
	// admin UI shows accurate per-notification trails.
	const attemptIds = await Promise.all(
		params.notificationIds.map((id) =>
			logAttempt({ notificationId: id }),
		),
	);
	try {
		await api.post("/send-bulk-notification-email", params);
		await Promise.all(
			attemptIds.map((id) => finaliseAttempt(id, "dispatched")),
		);
	} catch (error: any) {
		const msg =
			error?.response?.status
				? `${error.response.status} ${error.message}`
				: error?.message ?? String(error);
		console.error("[Email API] Failed to send bulk notification email:", error);
		await Promise.all(
			attemptIds.map((id) => finaliseAttempt(id, "failed", msg)),
		);
	}
}

/**
 * Send comment notification email to all targets of a comment.
 * Called after add_selection_comment RPC succeeds.
 */
export async function sendCommentEmail(
	params: SendCommentEmailParams
): Promise<void> {
	const attemptId = await logAttempt({
		emailType: "comment_added",
	});
	try {
		await api.post("/send-comment-email", params);
		await finaliseAttempt(attemptId, "dispatched");
	} catch (error: any) {
		const msg = error?.response?.status
			? `${error.response.status} ${error.message}`
			: error?.message ?? String(error);
		console.error("[Email API] Failed to send comment email:", error);
		await finaliseAttempt(attemptId, "failed", msg);
	}
}

/**
 * Send actor email for campaign CRUD confirmations
 * Called after add/update/delete selection
 * Automatically uses VITE_TEST_EMAIL_OVERRIDE if set
 */
export async function sendActorEmail(
	params: SendActorEmailParams
): Promise<void> {
	// Actor emails don't have a parent notification yet — the server creates
	// the actor notification + sends the email in one shot. Map the client-side
	// `type` to the email_type values the schema's CHECK constraint accepts.
	const actorTypeToEmailType: Record<string, string> = {
		added: "campaign_added",
		updated: "campaign_updated",
		deleted: "campaign_deleted",
		bespoke_added: "bespoke_added",
		bespoke_event_added: "bespoke_event_added",
		bulk_added: "campaign_added_bulk",
		campaigns_copied: "campaigns_copied",
	};
	const attemptId = await logAttempt({
		notificationId: null,
		emailType: actorTypeToEmailType[params.type] ?? null,
		practiceId: params.practiceId,
		selectionId: params.selectionId ?? null,
	});
	try {
		// Use test email override from environment if set
		const testEmailOverride = import.meta.env.VITE_TEST_EMAIL_OVERRIDE || params.testEmailOverride;
		await api.post("/send-actor-email", {
			...params,
			testEmailOverride,
		});
		await finaliseAttempt(attemptId, "dispatched");
	} catch (error: any) {
		const msg =
			error?.response?.status
				? `${error.response.status} ${error.message}`
				: error?.message ?? String(error);
		console.error("[Email API] Failed to send actor email:", error);
		await finaliseAttempt(attemptId, "failed", msg);
		// Fire-and-forget - don't throw
	}
}

/**
 * Send planner overview emails to all users who have selections in their assigned practices
 * This is a batch operation that sends personalized emails to each user
 * Returns detailed results for admin visibility
 */
export async function sendPlannerOverviewEmails(
	params?: SendPlannerOverviewEmailsParams
): Promise<SendPlannerOverviewEmailsResponse> {
	// Use test email override from environment if set
	const testEmailOverride = import.meta.env.VITE_TEST_EMAIL_OVERRIDE || params?.testEmailOverride;
	const response = await api.post("/send-planner-overview-emails", {
		testEmailOverride,
	});
	return response.data;
}

/**
 * Notify the dev inbox that a new bug report was created. The server fetches
 * the report, mints signed URLs for any attachments, renders the email and
 * sends it (honouring TEST_EMAIL_OVERRIDE on staging). Fire-and-forget.
 */
export async function sendBugReportEmail(params: {
	bugReportId: string;
}): Promise<void> {
	try {
		await api.post("/send-bug-report-email", params);
	} catch (error) {
		console.error("[Email API] Failed to send bug report email:", error);
	}
}
