import api from "./express";

/**
 * Email API helpers for sending notification and actor emails
 * These are fire-and-forget - errors are logged but don't affect the main flow
 */

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
	try {
		await api.post("/send-notification-email", params);
	} catch (error) {
		console.error("[Email API] Failed to send notification email:", error);
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
	try {
		await api.post("/send-bulk-notification-email", params);
	} catch (error) {
		console.error("[Email API] Failed to send bulk notification email:", error);
		// Fire-and-forget - don't throw
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
	try {
		// Use test email override from environment if set
		const testEmailOverride = import.meta.env.VITE_TEST_EMAIL_OVERRIDE || params.testEmailOverride;
		await api.post("/send-actor-email", {
			...params,
			testEmailOverride,
		});
	} catch (error) {
		console.error("[Email API] Failed to send actor email:", error);
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
