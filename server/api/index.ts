import express, { Express, Request, NextFunction, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/render";
import { WelcomeSummaryEmail } from "../emails/WelcomeSummaryEmail";
import { EmptyPlannerEmail } from "../emails/EmptyPlannerEmail";
import { AssetsRequestedEmail } from "../emails/AssetsRequestedEmail";
import { AssetsRequestedBulkEmail } from "../emails/AssetsRequestedBulkEmail";
import { AssetsSubmittedEmail } from "../emails/AssetsSubmittedEmail";
import { AssetsConfirmedEmail } from "../emails/AssetsConfirmedEmail";
import { FeedbackRequestedEmail } from "../emails/FeedbackRequestedEmail";
import { AwaitingApprovalEmail } from "../emails/AwaitingApprovalEmail";
import { CampaignAddedEmail } from "../emails/CampaignAddedEmail";
import { CampaignUpdatedEmail } from "../emails/CampaignUpdatedEmail";
import { CampaignDeletedEmail } from "../emails/CampaignDeletedEmail";
import { PlannerOverviewEmail } from "../emails/PlannerOverviewEmail";
import CustomSimpleEmail from "../emails/CustomSimpleEmail";
import CustomActionEmail from "../emails/CustomActionEmail";
import CustomAnnouncementEmail from "../emails/CustomAnnouncementEmail";
import { CommentAddedEmail } from "../emails/CommentAddedEmail";
import { FeedbackReminderEmail } from "../emails/FeedbackReminderEmail";
import { FeedbackEscalationEmail } from "../emails/FeedbackEscalationEmail";
import {
	signFeedbackToken,
	verifyFeedbackToken,
} from "../lib/feedbackToken";

interface EmailBody {
	to: string;
	subject: string;
	html: string;
}

interface SelectionWithCampaign {
	id: string;
	from_date: string;
	to_date: string;
	status: string;
	bespoke: boolean;
	campaign_name: string;
	campaign_category: string;
}

interface PracticeUser {
	id: string;
	email: string;
	first_name: string | null;
}

interface QueuedPractice {
	id: string;
	practice_id: string;
	status: string;
	due_at: string;
}

interface CsvRow {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	practiceName: string;
	practiceBuddyName: string;
	campaignName: string;
	startDate: string;
	endDate: string;
	additionalNotes: string;
}

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

const port = process.env.PORT;
const pass = process.env.RESEND_API_KEY;
const resend = new Resend(pass);
const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sendMail({ to, subject, html }: EmailBody) {
	return resend.emails.send({
		from: "HG Planner <team@planner.hakimgroup.io>",
		to: [to],
		bcc: ["david.barker@hakimgroup.co.uk"],
		subject,
		html,
	});
}

app.post("/send_email", (req: Request, res: Response) => {
	sendMail(req.body)
		.then(({ message }: any) => res.send(message))
		.catch((error) => res.status(500).send(error.message));
});

app.post("/import-campaigns", async (req: Request, res: Response) => {
	const rows: CsvRow[] = req.body.rows;
	if (!rows || !Array.isArray(rows)) {
		return res.status(400).json({ error: "Invalid request format" });
	}

	const results: any[] = [];

	for (const row of rows) {
		const result: any = { email: row.email };

		// 1. Create user
		const { data: user, error: userError } =
			await supabase.auth.admin.createUser({
				email: row.email,
				password: row.password,
				user_metadata: {
					first_name: row.firstName,
					last_name: row.lastName,
				},
				email_confirm: true,
			});
		if (userError) {
			result.error = "User creation failed: " + userError.message;
			results.push(result);
			continue;
		}

		// 2. Add user to users table
		const { data: insertData, error: insertError } = await supabase
			.from("users")
			.insert({
				id: user.user.id,
				first_name: row.firstName,
				last_name: row.lastName,
				role: "user",
			});

		if (insertError) {
			result.error =
				"User addition in users table failed: " + insertError.message;
			results.push(result);
			continue;
		}

		// 3. Create initial campaign
		const { data: campaign, error: campaignError } = await supabase
			.from("campaigns")
			.insert({
				creator_id: user.user.id,
				personal_details: {
					name: `${row.firstName} ${row.lastName}`,
					email: row.email,
					practiceName: row.practiceName,
					strategyName: row.practiceBuddyName,
				},
			})
			.select()
			.single();

		if (campaignError) {
			result.error = "Campaign creation failed: " + campaignError.message;
			results.push(result);
			continue;
		}

		// 4. Update with date + notes
		const { error: updateError } = await supabase
			.from("campaigns")
			.update({
				...campaign,
				campaign_id: campaign.campaign_id,
				campaign_plans: [
					{
						campaign_name: row.campaignName,
						campaign_id: "8122b524-a7cd-489f-8ffc-6b7a6d3d4104",
						campaign_link: null,
						// campaign_period: [
						// 	`${format(new Date(row.startDate), "yyyy-MM-dd")}`,
						// 	`${format(new Date(row.endDate), "yyyy-MM-dd")}`,
						// ],
						campaign_period: [row.startDate, row.endDate],
						campaign_note: row.additionalNotes,
					},
				],
			})
			.eq("campaign_id", campaign.campaign_id);

		if (updateError) {
			result.error = "Campaign update failed: " + updateError.message;
		} else {
			result.success = true;
		}

		results.push(result);
	}

	return res.status(200).json({ results });
});

// ============================================================
// Process Practice Onboarding Emails (called by Vercel Cron)
// ============================================================
// Using app.all() to handle both GET (Vercel cron) and POST (manual trigger)
// Also handle /api/process-onboarding-emails path for Vercel cron compatibility
app.all(["/process-onboarding-emails", "/api/process-onboarding-emails"], async (req: Request, res: Response) => {
	const startTime = Date.now();

	// Debug logging - to verify the endpoint is being called
	console.log(`[Onboarding Emails] Endpoint called - Method: ${req.method}, Path: ${req.path}, URL: ${req.url}`);

	// Verify cron secret (for security)
	// Vercel sends CRON_SECRET as Bearer token in Authorization header
	const authHeader = req.headers.authorization;
	const cronSecretHeader = req.headers["x-cron-secret"];
	const expectedSecret = process.env.CRON_SECRET;

	// Check either Authorization: Bearer <secret> or x-cron-secret header
	const providedSecret =
		authHeader?.replace("Bearer ", "") || cronSecretHeader;

	// Log auth status (without revealing secrets)
	console.log(`[Onboarding Emails] Auth check - Has auth header: ${!!authHeader}, Has cron secret header: ${!!cronSecretHeader}, Has expected secret env: ${!!expectedSecret}`);

	if (expectedSecret && providedSecret !== expectedSecret) {
		console.error(
			"[Onboarding Emails] Unauthorized request - invalid cron secret"
		);
		return res.status(401).json({ error: "Unauthorized" });
	}

	const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";

	// Test mode: override recipient emails (for testing only)
	// Can be set via request body (POST), query param, or environment variable
	const testEmailOverride =
		req.body?.testEmailOverride ||
		req.query?.testEmail ||
		process.env.ONBOARDING_TEST_EMAIL;

	if (testEmailOverride) {
		console.log(`[Onboarding Emails] TEST MODE - sending to: ${testEmailOverride}`);
	}

	const results = {
		processed: 0,
		sent: 0,
		skipped: 0,
		errors: [] as string[],
	};

	try {
		// 1. Query all practices with queued onboarding emails that are due
		const { data: queuedPractices, error: queryError } = await supabase
			.from("practice_onboarding_emails")
			.select("id, practice_id, status, due_at")
			.eq("status", "queued")
			.lte("due_at", new Date().toISOString());

		if (queryError) {
			console.error("[Onboarding Emails] Query error:", queryError);
			return res.status(500).json({ error: queryError.message });
		}

		if (!queuedPractices || queuedPractices.length === 0) {
			console.log("[Onboarding Emails] No queued practices to process");
			return res
				.status(200)
				.json({ ...results, message: "No queued practices" });
		}

		console.log(
			`[Onboarding Emails] Processing ${queuedPractices.length} practices`
		);

		// 2. Process each practice
		for (const queued of queuedPractices as QueuedPractice[]) {
			results.processed++;

			try {
				// 2a. Get practice details
				const { data: practice, error: practiceError } = await supabase
					.from("practices")
					.select("id, name")
					.eq("id", queued.practice_id)
					.single();

				if (practiceError || !practice) {
					console.error(
						`[Onboarding Emails] Practice not found: ${queued.practice_id}`
					);
					results.errors.push(
						`Practice not found: ${queued.practice_id}`
					);
					continue;
				}

				// 2b. Get all users assigned to this practice
				const { data: practiceMembers, error: membersError } =
					await supabase
						.from("practice_members")
						.select("user_id, email")
						.eq("practice_id", queued.practice_id);

				if (membersError) {
					console.error(
						`[Onboarding Emails] Error fetching members for practice ${queued.practice_id}:`,
						membersError
					);
					results.errors.push(
						`Error fetching members: ${queued.practice_id}`
					);
					continue;
				}

				// Skip if no users assigned
				if (!practiceMembers || practiceMembers.length === 0) {
					console.log(
						`[Onboarding Emails] No users assigned to practice ${practice.name}, skipping`
					);
					results.skipped++;

					// Still mark as sent so we don't keep retrying
					await supabase
						.from("practice_onboarding_emails")
						.update({
							status: "sent",
							sent_at: new Date().toISOString(),
							email_template_used: "skipped_no_users",
							recipients_count: 0,
							selections_count: 0,
						})
						.eq("id", queued.id);

					continue;
				}

				// Get user details from allowed_users
				const userIds = practiceMembers
					.map((m) => m.user_id)
					.filter(Boolean);
				const { data: users, error: usersError } = await supabase
					.from("allowed_users")
					.select("id, email, first_name")
					.in("id", userIds);

				if (usersError || !users || users.length === 0) {
					console.log(
						`[Onboarding Emails] No valid users found for practice ${practice.name}, skipping`
					);
					results.skipped++;
					continue;
				}

				// 2c. Get current selections for this practice
				const { data: selections, error: selectionsError } =
					await supabase.rpc("get_practice_selections_for_email", {
						p_practice_id: queued.practice_id,
					});

				// If RPC doesn't exist, fall back to direct query
				let selectionsData: SelectionWithCampaign[] = [];

				if (selectionsError) {
					// Fallback: direct query with joins
					const { data: directSelections, error: directError } =
						await supabase
							.from("selections")
							.select(
								`
							id,
							from_date,
							to_date,
							status,
							bespoke,
							campaign_id,
							bespoke_campaign_id
						`
							)
							.eq("practice_id", queued.practice_id)
							.order("from_date", { ascending: true });

					if (!directError && directSelections) {
						// Fetch campaign names separately
						for (const sel of directSelections) {
							let campaignName = "Unknown Campaign";
							let campaignCategory = "Campaign";

							if (sel.bespoke && sel.bespoke_campaign_id) {
								const { data: bespoke } = await supabase
									.from("bespoke_campaigns")
									.select("name")
									.eq("id", sel.bespoke_campaign_id)
									.single();
								if (bespoke) {
									campaignName = bespoke.name;
									campaignCategory = "Bespoke";
								}
							} else if (sel.campaign_id) {
								const { data: catalog } = await supabase
									.from("campaigns_catalog")
									.select("name, category")
									.eq("id", sel.campaign_id)
									.single();
								if (catalog) {
									campaignName = catalog.name;
									campaignCategory =
										catalog.category || "Campaign";
								}
							}

							selectionsData.push({
								id: sel.id,
								from_date: sel.from_date,
								to_date: sel.to_date,
								status: sel.status,
								bespoke: sel.bespoke,
								campaign_name: campaignName,
								campaign_category: campaignCategory,
							});
						}
					}
				} else {
					selectionsData = selections || [];
				}

				// 2d. Determine email template
				const hasSelections = selectionsData.length > 0;
				const templateUsed = hasSelections
					? "welcome_summary"
					: "empty_planner";

				// 2e. Render email HTML
				let emailHtml: string;
				let emailSubject: string;

				if (hasSelections) {
					emailSubject = `Your marketing plan for ${practice.name} is ready!`;
					emailHtml = await render(
						WelcomeSummaryEmail({
							practiceName: practice.name,
							practiceId: practice.id,
							selections: selectionsData,
							appUrl,
						})
					);
				} else {
					emailSubject = `Your planner for ${practice.name} is ready`;
					emailHtml = await render(
						EmptyPlannerEmail({
							practiceName: practice.name,
							practiceId: practice.id,
							appUrl,
						})
					);
				}

				// 2f. Send email to all assigned users
				const recipientEmails = users
					.map((u: PracticeUser) => u.email)
					.filter(Boolean);

				if (recipientEmails.length === 0) {
					console.log(
						`[Onboarding Emails] No valid emails for practice ${practice.name}, skipping`
					);
					results.skipped++;
					continue;
				}

				// Use test email override if provided, otherwise send to actual recipients
				const finalRecipients = testEmailOverride || process.env.TEST_EMAIL_OVERRIDE ? [testEmailOverride || process.env.TEST_EMAIL_OVERRIDE] : recipientEmails;

				const { error: sendError } = await resend.emails.send({
					from: "HG Planner <noreply@planner.hakimgroup.io>",
					to: finalRecipients,
					subject: emailSubject,
					html: emailHtml,
				});

				if (sendError) {
					console.error(
						`[Onboarding Emails] Send error for practice ${practice.name}:`,
						sendError
					);
					results.errors.push(
						`Send error for ${practice.name}: ${sendError.message}`
					);
					continue;
				}

				// 2g. Update record as sent
				await supabase
					.from("practice_onboarding_emails")
					.update({
						status: "sent",
						sent_at: new Date().toISOString(),
						email_template_used: templateUsed,
						recipients_count: recipientEmails.length,
						selections_count: selectionsData.length,
					})
					.eq("id", queued.id);

				console.log(
					`[Onboarding Emails] Sent ${templateUsed} email to ${recipientEmails.length} users for practice ${practice.name}`
				);
				results.sent++;
			} catch (practiceError: any) {
				console.error(
					`[Onboarding Emails] Error processing practice ${queued.practice_id}:`,
					practiceError
				);
				results.errors.push(
					`Error processing ${queued.practice_id}: ${practiceError.message}`
				);
			}
		}

		const duration = Date.now() - startTime;
		console.log(`[Onboarding Emails] Completed in ${duration}ms:`, results);

		return res.status(200).json({
			...results,
			duration_ms: duration,
		});
	} catch (error: any) {
		console.error("[Onboarding Emails] Unexpected error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ============================================================
// Send Notification Email (immediate - for workflow notifications)
// Called by client after request_assets or submit_assets RPC
// ============================================================
app.post("/send-notification-email", async (req: Request, res: Response) => {
	const { notificationId, testEmailOverride, recipientEmailsOverride } = req.body;

	if (!notificationId) {
		return res.status(400).json({ error: "notificationId is required" });
	}

	const overrideEmails: string[] | null =
		Array.isArray(recipientEmailsOverride) && recipientEmailsOverride.length > 0
			? recipientEmailsOverride.map((e: any) => String(e).trim()).filter(Boolean)
			: null;

	const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";

	try {
		// 1. Fetch the notification with its targets
		const { data: notification, error: notifError } = await supabase
			.from("notifications")
			.select(`
				id,
				type,
				selection_id,
				campaign_id,
				practice_id,
				actor_user_id,
				audience,
				title,
				message,
				payload,
				created_at
			`)
			.eq("id", notificationId)
			.single();

		if (notifError || !notification) {
			console.error("[Notification Email] Notification not found:", notificationId);
			return res.status(404).json({ error: "Notification not found" });
		}

		// 2. Get practice details
		const { data: practice } = await supabase
			.from("practices")
			.select("id, name")
			.eq("id", notification.practice_id)
			.single();

		if (!practice) {
			return res.status(404).json({ error: "Practice not found" });
		}

		// 3. Determine recipients — either from God Mode override or from notification_targets
		let recipientEmails: string[] = [];
		let eligibleUsers: any[] = [];

		if (overrideEmails) {
			// God Mode resend: explicit recipient list, bypasses notification_targets
			recipientEmails = overrideEmails;
			console.log(
				`[Notification Email] Using God Mode override recipients: ${overrideEmails.length} addresses`
			);
		} else {
			const { data: targets, error: targetsError } = await supabase
				.from("notification_targets")
				.select("user_id")
				.eq("notification_id", notificationId);

			if (targetsError || !targets || targets.length === 0) {
				console.log("[Notification Email] No targets for notification:", notificationId);
				return res.status(200).json({ message: "No recipients", sent: 0 });
			}

			// 4. Get user emails from allowed_users
			const userIds = targets.map((t: any) => t.user_id).filter(Boolean);
			const { data: users, error: usersError } = await supabase
				.from("allowed_users")
				.select("id, email, first_name, email_notifications_enabled")
				.in("id", userIds);

			if (usersError || !users || users.length === 0) {
				console.log("[Notification Email] No valid users found");
				return res.status(200).json({ message: "No valid recipients", sent: 0 });
			}

			// Filter out admins who opted out of email notifications (practice users always receive)
			eligibleUsers = notification.audience === "admins"
				? users.filter((u: any) => u.email_notifications_enabled !== false)
				: users;

			recipientEmails = eligibleUsers.map((u: any) => u.email).filter(Boolean);
		}

		if (recipientEmails.length === 0) {
			return res.status(200).json({ message: "No valid emails", sent: 0 });
		}

		// 5. Determine email type and render template
		const payload = notification.payload || {};
		let emailHtml: string;
		let emailSubject: string;
		let emailType: string;

		if (notification.type === "requested") {
			// Assets Requested email
			emailType = "assets_requested";
			emailSubject = `Action Required: Choose creative for ${payload.name || "campaign"}`;
			emailHtml = await render(
				AssetsRequestedEmail({
					practiceName: practice.name,
					practiceId: practice.id,
					campaignName: payload.name || "Campaign",
					campaignCategory: payload.category || "Campaign",
					fromDate: payload.from_date,
					toDate: payload.to_date,
					creatives: payload.creatives || [],
					assets: payload.assets || {},
					note: payload.note,
					appUrl,
					selectionId: notification.selection_id,
				})
			);
		} else if (notification.type === "inProgress") {
			// Assets Submitted email
			emailType = "assets_submitted";
			emailSubject = `${practice.name} submitted choices for ${payload.name || "campaign"}`;
			emailHtml = await render(
				AssetsSubmittedEmail({
					practiceName: practice.name,
					practiceId: practice.id,
					campaignName: payload.name || "Campaign",
					campaignCategory: payload.category || "Campaign",
					fromDate: payload.from_date,
					toDate: payload.to_date,
					chosenCreative: payload.chosen_creative,
					assets: payload.assets || {},
					note: payload.note,
					appUrl,
					selectionId: notification.selection_id,
				})
			);
		} else if (notification.type === "confirmed") {
			// Assets Confirmed email
			emailType = "assets_confirmed";
			emailSubject = `${practice.name} confirmed assets for ${payload.name || "campaign"}`;
			emailHtml = await render(
				AssetsConfirmedEmail({
					practiceName: practice.name,
					practiceId: practice.id,
					campaignName: payload.name || "Campaign",
					campaignCategory: payload.category || "Campaign",
					fromDate: payload.from_date,
					toDate: payload.to_date,
					chosenCreative: payload.chosen_creative,
					note: payload.note,
					appUrl,
					selectionId: notification.selection_id,
				})
			);
		} else if (notification.type === "feedbackRequested") {
			// Feedback Requested email
			emailType = "feedback_requested";
			emailSubject = `${practice.name} requested changes for ${payload.name || "campaign"}`;
			emailHtml = await render(
				FeedbackRequestedEmail({
					practiceName: practice.name,
					practiceId: practice.id,
					campaignName: payload.name || "Campaign",
					campaignCategory: payload.category || "Campaign",
					fromDate: payload.from_date,
					toDate: payload.to_date,
					feedback: payload.feedback || "",
					appUrl,
					selectionId: notification.selection_id,
				})
			);
		} else if (notification.type === "awaitingApproval") {
			// Awaiting Approval email (sent to practice when artwork is ready)
			emailType = "awaiting_approval";
			emailSubject = `Action Required: Artwork ready for approval — ${payload.name || "campaign"}`;
			emailHtml = await render(
				AwaitingApprovalEmail({
					practiceName: practice.name,
					practiceId: practice.id,
					campaignName: payload.name || "Campaign",
					campaignCategory: payload.category || "Campaign",
					fromDate: payload.from_date,
					toDate: payload.to_date,
					markupLink: payload.markup_link,
					assetsLink: payload.assets_link,
					note: payload.note,
					appUrl,
					selectionId: notification.selection_id,
				})
			);
		} else {
			console.log("[Notification Email] Unsupported notification type:", notification.type);
			return res.status(200).json({ message: "Unsupported notification type", sent: 0 });
		}

		// 6. Send email
		const finalRecipients = testEmailOverride || process.env.TEST_EMAIL_OVERRIDE ? [testEmailOverride || process.env.TEST_EMAIL_OVERRIDE] : recipientEmails;

		const attemptedAt = new Date().toISOString();
		const { data: sendData, error: sendError } = await resend.emails.send({
			from: "HG Planner <noreply@planner.hakimgroup.io>",
			to: finalRecipients,
			subject: emailSubject,
			html: emailHtml,
		});

		// Build a unified log-recipient list that works in both modes:
		// - normal mode: use eligibleUsers (has user_id)
		// - override mode (god mode): just emails, no user_id
		const logRecipients: Array<{ email: string; id: string | null }> = overrideEmails
			? overrideEmails.map((e) => ({ email: e, id: null }))
			: eligibleUsers.map((u: any) => ({ email: u.email, id: u.id }));

		if (sendError) {
			console.error("[Notification Email] Send error:", sendError);
			// Log the failed attempt
			for (const user of logRecipients) {
				await supabase.from("notification_emails_log").insert({
					notification_id: notificationId,
					email_type: emailType,
					recipient_email: user.email,
					recipient_user_id: user.id,
					selection_id: notification.selection_id,
					practice_id: practice.id,
					practice_name: practice.name,
					campaign_name: payload.name,
					actor_user_id: notification.actor_user_id,
					status: "failed",
					error_message: sendError.message,
					payload,
					attempt_source: "server",
					attempted_at: attemptedAt,
					subject: emailSubject,
				});
			}
			return res.status(500).json({ error: sendError.message });
		}

		// 7. Log successful send
		const resendMessageId = (sendData as any)?.id ?? null;
		for (const user of logRecipients) {
			await supabase.from("notification_emails_log").insert({
				notification_id: notificationId,
				email_type: emailType,
				recipient_email: user.email,
				recipient_user_id: user.id,
				selection_id: notification.selection_id,
				practice_id: practice.id,
				practice_name: practice.name,
				campaign_name: payload.name,
				actor_user_id: notification.actor_user_id,
				status: "sent",
				payload,
				attempt_source: "server",
				attempted_at: attemptedAt,
				sent_at: new Date().toISOString(),
				resend_message_id: resendMessageId,
				subject: emailSubject,
			});
		}

		console.log(`[Notification Email] Sent ${emailType} to ${recipientEmails.length} recipients (resend_id=${resendMessageId})`);
		return res.status(200).json({ sent: recipientEmails.length, emailType, resend_message_id: resendMessageId });
	} catch (error: any) {
		console.error("[Notification Email] Unexpected error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ============================================================
// Send Bulk Notification Email (consolidated per practice)
// Called by client after request_assets_bulk RPC
// ============================================================
app.post("/send-bulk-notification-email", async (req: Request, res: Response) => {
	const { notificationIds, testEmailOverride } = req.body;

	if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
		return res.status(400).json({ error: "notificationIds array is required" });
	}

	const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";

	try {
		// 1. Fetch all notifications
		const { data: notifications, error: notifError } = await supabase
			.from("notifications")
			.select(`
				id,
				type,
				selection_id,
				campaign_id,
				practice_id,
				actor_user_id,
				payload
			`)
			.in("id", notificationIds);

		if (notifError || !notifications || notifications.length === 0) {
			console.error("[Bulk Notification Email] No notifications found");
			return res.status(404).json({ error: "Notifications not found" });
		}

		// 2. Group by practice_id
		const byPractice: Record<string, any[]> = {};
		for (const notif of notifications) {
			const pid = notif.practice_id;
			if (!byPractice[pid]) byPractice[pid] = [];
			byPractice[pid].push(notif);
		}

		// 3. Process practices in batches of 4 to stay under Resend's 5 req/sec limit
		const practiceEntries = Object.entries(byPractice);
		const BATCH_SIZE = 4;
		const results: any[] = [];

		const processPractice = async ([practiceId, practiceNotifs]: [string, any[]]) => {
			// Get practice details
			const { data: practice } = await supabase
				.from("practices")
				.select("id, name")
				.eq("id", practiceId)
				.single();

			if (!practice) {
				return { practiceId, error: "Practice not found" };
			}

			// Get unique recipients from all notification targets
			const allNotifIds = practiceNotifs.map((n: any) => n.id);
			const { data: targets } = await supabase
				.from("notification_targets")
				.select("user_id")
				.in("notification_id", allNotifIds);

			if (!targets || targets.length === 0) {
				return { practiceId, message: "No recipients" };
			}

			const uniqueUserIds = [...new Set(targets.map((t: any) => t.user_id))];
			const { data: users } = await supabase
				.from("allowed_users")
				.select("id, email, first_name")
				.in("id", uniqueUserIds);

			if (!users || users.length === 0) {
				return { practiceId, message: "No valid users" };
			}

			const recipientEmails = users.map((u: any) => u.email).filter(Boolean);
			if (recipientEmails.length === 0) {
				return { practiceId, message: "No valid emails" };
			}

			// Build campaigns list from notifications
			const campaigns = practiceNotifs.map((n: any) => ({
				selectionId: n.selection_id,
				campaignName: n.payload?.name || "Campaign",
				campaignCategory: n.payload?.category || "Campaign",
				fromDate: n.payload?.from_date,
				toDate: n.payload?.to_date,
			}));

			// Render consolidated email
			const emailHtml = await render(
				AssetsRequestedBulkEmail({
					practiceName: practice.name,
					practiceId: practice.id,
					campaigns,
					appUrl,
				})
			);

			const emailSubject = `Action Required: ${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""} need your input`;
			const finalRecipients = testEmailOverride || process.env.TEST_EMAIL_OVERRIDE ? [testEmailOverride || process.env.TEST_EMAIL_OVERRIDE] : recipientEmails;

			// Send email
			const attemptedAt = new Date().toISOString();
			const { data: sendData, error: sendError } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: finalRecipients,
				subject: emailSubject,
				html: emailHtml,
			});

			if (sendError) {
				console.error(`[Bulk Notification Email] Send error for practice ${practice.name}:`, sendError);
				// Log failed attempt for each notification × recipient
				const failedEntries = users.flatMap((user: any) =>
					practiceNotifs.map((notif: any) => ({
						notification_id: notif.id,
						email_type: "assets_requested_bulk",
						recipient_email: user.email,
						recipient_user_id: user.id,
						selection_id: notif.selection_id,
						practice_id: practice.id,
						practice_name: practice.name,
						campaign_name: notif.payload?.name,
						actor_user_id: notif.actor_user_id,
						status: "failed",
						error_message: sendError.message,
						payload: { campaigns_count: campaigns.length, all_campaigns: campaigns },
						attempt_source: "server",
						attempted_at: attemptedAt,
						subject: emailSubject,
					}))
				);
				await supabase.from("notification_emails_log").insert(failedEntries);
				return { practiceId, error: sendError.message };
			}

			// Batch insert all log entries at once
			const resendMessageId = (sendData as any)?.id ?? null;
			const sentAt = new Date().toISOString();
			const logEntries = users.flatMap((user: any) =>
				practiceNotifs.map((notif: any) => ({
					notification_id: notif.id,
					email_type: "assets_requested_bulk",
					recipient_email: user.email,
					recipient_user_id: user.id,
					selection_id: notif.selection_id,
					practice_id: practice.id,
					practice_name: practice.name,
					campaign_name: notif.payload?.name,
					actor_user_id: notif.actor_user_id,
					status: "sent",
					payload: { campaigns_count: campaigns.length, all_campaigns: campaigns },
					attempt_source: "server",
					attempted_at: attemptedAt,
					sent_at: sentAt,
					resend_message_id: resendMessageId,
					subject: emailSubject,
				}))
			);
			await supabase.from("notification_emails_log").insert(logEntries);

			console.log(`[Bulk Notification Email] Sent consolidated email for ${practice.name} (${campaigns.length} campaigns) to ${recipientEmails.length} recipients`);
			return { practiceId, practiceName: practice.name, sent: recipientEmails.length, campaignsCount: campaigns.length };
		};

		for (let i = 0; i < practiceEntries.length; i += BATCH_SIZE) {
			const batch = practiceEntries.slice(i, i + BATCH_SIZE);
			const settled = await Promise.allSettled(batch.map(processPractice));
			results.push(
				...settled.map((s) =>
					s.status === "fulfilled" ? s.value : { error: (s as PromiseRejectedResult).reason?.message ?? "Unknown error" }
				)
			);
			// Wait 300ms between batches to stay under Resend's 5 req/sec rate limit
			if (i + BATCH_SIZE < practiceEntries.length) {
				await new Promise((resolve) => setTimeout(resolve, 300));
			}
		}

		return res.status(200).json({ results });
	} catch (error: any) {
		console.error("[Bulk Notification Email] Unexpected error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ============================================================
// Send Actor Email (immediate - for campaign CRUD confirmations)
// Called by client after add/update/delete selection
// ============================================================
app.post("/send-actor-email", async (req: Request, res: Response) => {
	const {
		type, // 'added' | 'updated' | 'deleted' | 'bespoke_added' | 'bespoke_event_added' | 'bulk_added' | 'campaigns_copied'
		userId,
		practiceId,
		selectionId,
		campaignName,
		campaignCategory,
		fromDate,
		toDate,
		isBespoke,
		campaignsCount, // for bulk operations
		testEmailOverride,
	} = req.body;

	if (!type || !userId || !practiceId) {
		return res.status(400).json({ error: "type, userId, and practiceId are required" });
	}

	const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";

	try {
		// 1. Get user details
		const { data: user, error: userError } = await supabase
			.from("allowed_users")
			.select("id, email, first_name, last_name")
			.eq("id", userId)
			.single();

		if (userError || !user) {
			console.error("[Actor Email] User not found:", userId);
			return res.status(404).json({ error: "User not found" });
		}

		// 2. Get practice details
		const { data: practice, error: practiceError } = await supabase
			.from("practices")
			.select("id, name")
			.eq("id", practiceId)
			.single();

		if (practiceError || !practice) {
			console.error("[Actor Email] Practice not found:", practiceId);
			return res.status(404).json({ error: "Practice not found" });
		}

		const userName = user.first_name || user.email?.split("@")[0] || "there";
		let emailHtml: string;
		let emailSubject: string;
		let emailType: string;

		// 3. Render appropriate template
		switch (type) {
			case "added":
			case "bespoke_added":
			case "bespoke_event_added":
				emailType = type === "added" ? "campaign_added" : "bespoke_added";
				emailSubject = `Campaign added: ${campaignName} for ${practice.name}`;
				emailHtml = await render(
					CampaignAddedEmail({
						userName,
						practiceName: practice.name,
						practiceId: practice.id,
						campaignName: campaignName || "Campaign",
						campaignCategory: campaignCategory || "Campaign",
						fromDate,
						toDate,
						isBespoke: isBespoke || type.includes("bespoke"),
						appUrl,
					})
				);
				break;

			case "bulk_added":
				emailType = "campaign_added_bulk";
				emailSubject = `${campaignsCount} campaign${campaignsCount !== 1 ? "s" : ""} added for ${practice.name}`;
				emailHtml = await render(
					CampaignAddedEmail({
						userName,
						practiceName: practice.name,
						practiceId: practice.id,
						campaignName: `${campaignsCount} campaign${campaignsCount !== 1 ? "s" : ""}`,
						campaignCategory: "Bulk Add",
						fromDate,
						toDate,
						isBespoke: false,
						appUrl,
					})
				);
				break;

			case "campaigns_copied":
				emailType = "campaigns_copied";
				emailSubject = `Campaigns copied to ${practice.name}`;
				emailHtml = await render(
					CampaignAddedEmail({
						userName,
						practiceName: practice.name,
						practiceId: practice.id,
						campaignName: "Copied campaigns",
						campaignCategory: "Copy",
						fromDate: fromDate || new Date().toISOString(),
						toDate: toDate || new Date().toISOString(),
						isBespoke: false,
						appUrl,
					})
				);
				break;

			case "updated":
				emailType = "campaign_updated";
				emailSubject = `Campaign updated: ${campaignName} for ${practice.name}`;
				emailHtml = await render(
					CampaignUpdatedEmail({
						userName,
						practiceName: practice.name,
						practiceId: practice.id,
						campaignName: campaignName || "Campaign",
						campaignCategory: campaignCategory || "Campaign",
						fromDate,
						toDate,
						isBespoke: isBespoke || false,
						appUrl,
					})
				);
				break;

			case "deleted":
				emailType = "campaign_deleted";
				emailSubject = `Campaign removed: ${campaignName} from ${practice.name}`;
				emailHtml = await render(
					CampaignDeletedEmail({
						userName,
						practiceName: practice.name,
						practiceId: practice.id,
						campaignName: campaignName || "Campaign",
						campaignCategory: campaignCategory || "Campaign",
						isBespoke: isBespoke || false,
						appUrl,
					})
				);
				break;

			default:
				return res.status(400).json({ error: `Unknown email type: ${type}` });
		}

		// 4. Send email
		const recipientEmail = testEmailOverride || user.email;
		const attemptedAt = new Date().toISOString();

		const { data: sendData, error: sendError } = await resend.emails.send({
			from: "HG Planner <noreply@planner.hakimgroup.io>",
			to: [recipientEmail],
			subject: emailSubject,
			html: emailHtml,
		});

		if (sendError) {
			console.error("[Actor Email] Send error:", sendError);
			// Log failed attempt
			await supabase.from("notification_emails_log").insert({
				email_type: emailType,
				recipient_email: user.email,
				recipient_user_id: user.id,
				selection_id: selectionId,
				practice_id: practice.id,
				practice_name: practice.name,
				campaign_name: campaignName,
				actor_user_id: userId,
				status: "failed",
				error_message: sendError.message,
				payload: { type, campaignCategory, fromDate, toDate, isBespoke, campaignsCount },
				attempt_source: "server",
				attempted_at: attemptedAt,
			});
			return res.status(500).json({ error: sendError.message });
		}

		// 5. Log successful send
		const resendMessageId = (sendData as any)?.id ?? null;
		await supabase.from("notification_emails_log").insert({
			email_type: emailType,
			recipient_email: user.email,
			recipient_user_id: user.id,
			selection_id: selectionId,
			practice_id: practice.id,
			practice_name: practice.name,
			campaign_name: campaignName,
			actor_user_id: userId,
			status: "sent",
			payload: { type, campaignCategory, fromDate, toDate, isBespoke, campaignsCount },
			attempt_source: "server",
			attempted_at: attemptedAt,
			sent_at: new Date().toISOString(),
			resend_message_id: resendMessageId,
		});

		// 6. Create in-app notification for actor
		const notificationTypeMap: Record<string, string> = {
			added: "campaignAdded",
			updated: "campaignUpdated",
			deleted: "campaignDeleted",
			bespoke_added: "bespokeAdded",
			bespoke_event_added: "bespokeEventAdded",
			bulk_added: "bulkAdded",
			campaigns_copied: "campaignsCopied",
		};

		const notificationType = notificationTypeMap[type] || "campaignAdded";

		// Build notification title and message
		let notificationTitle: string;
		let notificationMessage: string;

		switch (type) {
			case "added":
				notificationTitle = "Campaign Added";
				notificationMessage = `You added "${campaignName || "a campaign"}" to your plan.`;
				break;
			case "updated":
				notificationTitle = "Campaign Updated";
				notificationMessage = `You updated "${campaignName || "a campaign"}".`;
				break;
			case "deleted":
				notificationTitle = "Campaign Removed";
				notificationMessage = `You removed "${campaignName || "a campaign"}" from your plan.`;
				break;
			case "bespoke_added":
				notificationTitle = "Bespoke Campaign Created";
				notificationMessage = `You created a bespoke campaign: "${campaignName || "Campaign"}".`;
				break;
			case "bespoke_event_added":
				notificationTitle = "Bespoke Event Created";
				notificationMessage = `You created a bespoke event: "${campaignName || "Event"}".`;
				break;
			case "bulk_added":
				notificationTitle = "Campaigns Added";
				notificationMessage = `You added ${campaignsCount || "multiple"} campaigns to your plan.`;
				break;
			case "campaigns_copied":
				notificationTitle = "Campaigns Copied";
				notificationMessage = `Campaigns have been copied to ${practice.name}.`;
				break;
			default:
				notificationTitle = "Campaign Action";
				notificationMessage = `Action performed on "${campaignName || "a campaign"}".`;
		}

		// Fetch reference_links, original_notes, requirements from DB for bespoke types
		let referenceLinks: any = null;
		let originalNotes: string | null = null;
		let requirements: string | null = null;

		if (selectionId && (type === "bespoke_added" || type === "bespoke_event_added")) {
			try {
				const { data: selData } = await supabase
					.from("selections")
					.select("notes, reference_links, bespoke_campaign_id")
					.eq("id", selectionId)
					.single();

				if (selData) {
					originalNotes = selData.notes;
					referenceLinks = selData.reference_links;

					if (selData.bespoke_campaign_id) {
						const { data: bcData } = await supabase
							.from("bespoke_campaigns")
							.select("reference_links, requirements")
							.eq("id", selData.bespoke_campaign_id)
							.single();
						if (bcData) {
							referenceLinks = bcData.reference_links || referenceLinks;
							requirements = bcData.requirements;
						}
					}
				}
			} catch (fetchErr: any) {
				console.error("[Actor Notification] Failed to fetch bespoke details:", fetchErr.message);
			}
		}

		// For deletions, in-app notifications are created inside the delete_selection RPC
		// (before the selection row is removed, so selection_id is preserved).
		// For all other types, create the in-app notification here.
		let notification: { id: string } | null = null;
		if (type !== "deleted") {
			const { data: notifData, error: notifError } = await supabase
				.from("notifications")
				.insert({
					type: notificationType,
					practice_id: practiceId,
					selection_id: selectionId || null,
					actor_user_id: userId,
					audience: "practice",
					title: notificationTitle,
					message: notificationMessage,
					payload: {
						name: campaignName || "Campaign",
						category: campaignCategory || "Campaign",
						from_date: fromDate,
						to_date: toDate,
						is_bespoke: isBespoke || false,
						actor_action: notificationType,
						reference_links: referenceLinks,
						original_notes: originalNotes,
						requirements: requirements,
					},
				})
				.select("id")
				.single();

			if (notifError) {
				console.error("[Actor Notification] Failed to create:", notifError.message);
			} else if (notifData) {
				notification = notifData;
				// Insert notification target for the actor
				const { error: targetError } = await supabase
					.from("notification_targets")
					.insert({
						notification_id: notifData.id,
						user_id: userId,
						practice_id: practiceId,
					});

				if (targetError) {
					console.error("[Actor Notification] Failed to create target:", targetError.message);
				} else {
					console.log(`[Actor Notification] Created notification ${notifData.id} for user ${userId}`);
				}
			}
		}

		console.log(`[Actor Email] Sent ${emailType} to ${recipientEmail}`);
		return res.status(200).json({ sent: 1, emailType, recipient: recipientEmail, notificationId: notification?.id });
	} catch (error: any) {
		console.error("[Actor Email] Unexpected error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ============================================================
// Send Comment Email — notify every comment_target recipient.
// Called by the client immediately after add_selection_comment RPC succeeds.
// ============================================================
app.post("/send-comment-email", async (req: Request, res: Response) => {
	const { commentId, testEmailOverride } = req.body;

	if (!commentId) {
		return res.status(400).json({ error: "commentId is required" });
	}

	const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";

	try {
		// 1. Comment + selection + practice + campaign context.
		const { data: comment, error: commentError } = await supabase
			.from("selection_comments")
			.select("id, selection_id, author_user_id, body, created_at")
			.eq("id", commentId)
			.single();

		if (commentError || !comment) {
			console.error("[Comment Email] Comment not found:", commentId);
			return res.status(404).json({ error: "Comment not found" });
		}

		const { data: selection, error: selectionError } = await supabase
			.from("selections")
			.select("id, practice_id, campaign_id, bespoke_campaign_id, bespoke")
			.eq("id", comment.selection_id)
			.single();

		if (selectionError || !selection) {
			console.error("[Comment Email] Selection not found:", comment.selection_id);
			return res.status(404).json({ error: "Selection not found" });
		}

		const { data: practice } = await supabase
			.from("practices")
			.select("id, name")
			.eq("id", selection.practice_id)
			.single();

		// Campaign name (catalog or bespoke).
		let campaignName = "Campaign";
		if (selection.campaign_id) {
			const { data: cc } = await supabase
				.from("campaigns_catalog")
				.select("name")
				.eq("id", selection.campaign_id)
				.single();
			campaignName = cc?.name ?? campaignName;
		} else if (selection.bespoke_campaign_id) {
			const { data: bc } = await supabase
				.from("bespoke_campaigns")
				.select("name")
				.eq("id", selection.bespoke_campaign_id)
				.single();
			campaignName = bc?.name ?? campaignName;
		}

		// Author display info.
		const { data: author } = await supabase
			.from("allowed_users")
			.select("first_name, last_name, role")
			.eq("id", comment.author_user_id)
			.single();
		const authorName = [author?.first_name, author?.last_name]
			.filter(Boolean)
			.join(" ")
			.trim() || "A teammate";
		const authorRole = author?.role ?? null;

		// 2. Recipients via comment_targets → allowed_users.
		const { data: targets, error: targetsError } = await supabase
			.from("comment_targets")
			.select("user_id")
			.eq("comment_id", commentId);

		if (targetsError || !targets || targets.length === 0) {
			console.log("[Comment Email] No targets for comment:", commentId);
			return res.status(200).json({ message: "No recipients", sent: 0 });
		}

		const userIds = targets.map((t: any) => t.user_id).filter(Boolean);
		const { data: users } = await supabase
			.from("allowed_users")
			.select("id, email, first_name, email_notifications_enabled, role")
			.in("id", userIds);

		if (!users || users.length === 0) {
			return res.status(200).json({ message: "No valid recipients", sent: 0 });
		}

		// Admin-side recipients honour the opt-out flag; practice users always receive.
		const eligibleUsers = users.filter((u: any) => {
			const isAdminSide = u.role === "admin" || u.role === "super_admin";
			return isAdminSide ? u.email_notifications_enabled !== false : true;
		});

		const recipientEmails = eligibleUsers.map((u: any) => u.email).filter(Boolean);

		if (recipientEmails.length === 0) {
			return res.status(200).json({ message: "No valid emails", sent: 0 });
		}

		// 3. Render template.
		const emailHtml = await render(
			CommentAddedEmail({
				authorName,
				authorRole,
				campaignName,
				practiceName: practice?.name ?? "",
				body: comment.body,
				appUrl,
				selectionId: selection.id,
			})
		);

		const subjectPrefix =
			authorRole === "admin" || authorRole === "super_admin"
				? "Hakim Group team"
				: practice?.name ?? "Practice";
		const emailSubject = `${subjectPrefix} commented on ${campaignName}`;

		// 4. Honour test override.
		const finalRecipients =
			testEmailOverride || process.env.TEST_EMAIL_OVERRIDE
				? [testEmailOverride || process.env.TEST_EMAIL_OVERRIDE]
				: recipientEmails;

		const attemptedAt = new Date().toISOString();
		const { data: sendData, error: sendError } = await resend.emails.send({
			from: "HG Planner <noreply@planner.hakimgroup.io>",
			to: finalRecipients,
			subject: emailSubject,
			html: emailHtml,
		});

		const logRecipients = eligibleUsers.map((u: any) => ({ email: u.email, id: u.id }));

		if (sendError) {
			console.error("[Comment Email] Send error:", sendError);
			for (const user of logRecipients) {
				await supabase.from("notification_emails_log").insert({
					email_type: "comment_added",
					recipient_email: user.email,
					recipient_user_id: user.id,
					selection_id: selection.id,
					practice_id: practice?.id,
					practice_name: practice?.name,
					campaign_name: campaignName,
					actor_user_id: comment.author_user_id,
					status: "failed",
					error_message: sendError.message,
					payload: { comment_id: commentId, body: comment.body },
					attempt_source: "server",
					attempted_at: attemptedAt,
					subject: emailSubject,
				});
			}
			return res.status(500).json({ error: sendError.message });
		}

		const resendMessageId = (sendData as any)?.id ?? null;
		for (const user of logRecipients) {
			await supabase.from("notification_emails_log").insert({
				email_type: "comment_added",
				recipient_email: user.email,
				recipient_user_id: user.id,
				selection_id: selection.id,
				practice_id: practice?.id,
				practice_name: practice?.name,
				campaign_name: campaignName,
				actor_user_id: comment.author_user_id,
				status: "sent",
				payload: { comment_id: commentId, body: comment.body },
				attempt_source: "server",
				attempted_at: attemptedAt,
				sent_at: new Date().toISOString(),
				resend_message_id: resendMessageId,
				subject: emailSubject,
			});
		}

		console.log(`[Comment Email] Sent to ${recipientEmails.length} recipients (resend_id=${resendMessageId})`);
		return res.status(200).json({ sent: recipientEmails.length, resend_message_id: resendMessageId });
	} catch (error: any) {
		console.error("[Comment Email] Unexpected error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ============================================================
// Magic-link feedback actions — the practice can approve or request revision
// directly from a reminder email without logging back into the planner.
// Tokens are signed with FEEDBACK_TOKEN_SECRET (HMAC-SHA256) and carry
// (selection_id, action, recipient_user_id, exp). Replay safety is enforced
// by checking the selection is still at awaitingApproval before acting.
// ============================================================
function renderFeedbackResponsePage(opts: {
	heading: string;
	subheading: string;
	tone: "success" | "info" | "error";
	appUrl: string;
}): string {
	const colors = {
		success: { bg: "#ecfdf5", border: "#6ee7b7", accent: "#059669", icon: "✓" },
		info:    { bg: "#fef3c7", border: "#fcd34d", accent: "#b45309", icon: "ℹ" },
		error:   { bg: "#fee2e2", border: "#fecaca", accent: "#b91c1c", icon: "✗" },
	}[opts.tone];

	return `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${opts.heading}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    background: #faf8fd; color: #1f2937; margin: 0; padding: 32px 16px; min-height: 100vh;
    display: flex; align-items: center; justify-content: center; }
  .card { max-width: 480px; width: 100%; background: #fff; border-radius: 16px;
    padding: 36px 28px; box-shadow: 0 10px 40px rgba(45, 25, 95, 0.10);
    border: 1px solid #e5d5f8; text-align: center; }
  .icon { display: inline-flex; align-items: center; justify-content: center;
    width: 64px; height: 64px; border-radius: 50%;
    background: ${colors.bg}; border: 2px solid ${colors.border};
    color: ${colors.accent}; font-size: 30px; font-weight: 700; margin-bottom: 16px; }
  h1 { font-size: 22px; margin: 0 0 8px 0; color: #111827; }
  p  { font-size: 14px; color: #6b7280; line-height: 1.55; margin: 0 0 24px 0; }
  a.cta { display: inline-block; background: linear-gradient(135deg, #7264e9, #d64ca8);
    color: #fff; padding: 12px 22px; border-radius: 10px; font-weight: 600;
    text-decoration: none; font-size: 14px; }
  .brand { margin-top: 28px; font-size: 11px; color: #9ca3af; letter-spacing: 0.6px;
    text-transform: uppercase; font-weight: 600; }
</style></head><body>
<div class="card">
  <div class="icon">${colors.icon}</div>
  <h1>${opts.heading}</h1>
  <p>${opts.subheading}</p>
  <a class="cta" href="${opts.appUrl}/dashboard">Open the planner</a>
  <div class="brand">Hakim Group · Planner</div>
</div></body></html>`;
}

const feedbackActionHandler = (action: "approve" | "revise") =>
	async (req: Request, res: Response): Promise<any> => {
		const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";
		const token = req.params.token;

		if (!token) {
			return res
				.status(400)
				.send(renderFeedbackResponsePage({
					heading: "Link is missing",
					subheading: "We couldn't find a token on this link. Open the planner to action the campaign there.",
					tone: "error",
					appUrl,
				}));
		}

		const verified = verifyFeedbackToken(token);
		if (!verified.ok) {
			const msg = verified.reason === "expired"
				? "This link has expired. The 14-day window is up — please open the planner to action the campaign."
				: "This link is no longer valid. If you typed it manually, double-check the URL.";
			return res
				.status(verified.reason === "expired" ? 410 : 400)
				.send(renderFeedbackResponsePage({
					heading: verified.reason === "expired" ? "Link expired" : "Invalid link",
					subheading: msg,
					tone: "error",
					appUrl,
				}));
		}

		const { sub: selectionId, uid: actorUserId } = verified.payload;
		if (verified.payload.action !== action) {
			return res.status(400).send(renderFeedbackResponsePage({
				heading: "Link mismatch",
				subheading: "This link's action doesn't match the URL. Try the original email button again.",
				tone: "error",
				appUrl,
			}));
		}

		try {
			// Confirm the selection is still in a state where the action applies.
			const { data: sel, error: selErr } = await supabase
				.from("selections")
				.select("id, status, practice_id")
				.eq("id", selectionId)
				.single();

			if (selErr || !sel) {
				return res.status(404).send(renderFeedbackResponsePage({
					heading: "Campaign not found",
					subheading: "We couldn't find the campaign this link refers to. It may have been removed.",
					tone: "error",
					appUrl,
				}));
			}

			if (sel.status !== "awaitingApproval") {
				return res.status(200).send(renderFeedbackResponsePage({
					heading: "Already actioned",
					subheading: `This campaign is currently at "${sel.status}" — someone has already moved it on. No further action needed.`,
					tone: "info",
					appUrl,
				}));
			}

			// Call the existing RPC with the actor override.
			const REVISION_NOTE =
				"Decision made via reminder email — practice indicated changes were left on the markup file. See markup for details.";

			const rpcArgs = action === "approve"
				? {
					p_selection_id: selectionId,
					p_note: null,
					p_self_print: false,
					p_actor_user_id: actorUserId,
				}
				: {
					p_selection_id: selectionId,
					p_feedback: REVISION_NOTE,
					p_actor_user_id: actorUserId,
				};

			const { data: rpcData, error: rpcErr } = await supabase.rpc(
				action === "approve" ? "confirm_assets" : "request_revision",
				rpcArgs,
			);

			if (rpcErr || (rpcData && rpcData.success === false)) {
				console.error("[Feedback Magic Link] RPC error:", rpcErr ?? rpcData);
				return res.status(500).send(renderFeedbackResponsePage({
					heading: "Something went wrong",
					subheading: "We hit a snag recording your decision. Please open the planner to action it directly.",
					tone: "error",
					appUrl,
				}));
			}

			// Fire the admin-notification email by calling our own
			// /send-notification-email endpoint. Vercel's VERCEL_URL points at the
			// current deploy (preview or prod). SERVER_BASE_URL overrides for local
			// dev. If neither is set we skip the email — the in-app notification is
			// already created by the RPC, so the admin will still see it on next bell
			// refresh.
			const notificationId = rpcData?.id ?? rpcData?.notification_id ?? null;
			const serverBase =
				process.env.SERVER_BASE_URL ||
				(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
			if (notificationId && serverBase) {
				fetch(`${serverBase}/send-notification-email`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ notificationId }),
				}).catch((e) =>
					console.warn(
						"[Feedback Magic Link] notification email send failed:",
						e,
					),
				);
			}

			const heading = action === "approve"
				? "Thanks — campaign approved"
				: "Got it — changes requested";
			const subheading = action === "approve"
				? "We've moved the campaign to confirmed and notified the design team. The artwork will go live on the start date you originally set."
				: "We've moved the campaign back to in-progress and notified the design team. They'll work on the changes you've left on the markup file.";

			return res.status(200).send(renderFeedbackResponsePage({
				heading,
				subheading,
				tone: "success",
				appUrl,
			}));
		} catch (err: any) {
			console.error("[Feedback Magic Link] unexpected:", err);
			return res.status(500).send(renderFeedbackResponsePage({
				heading: "Unexpected error",
				subheading: "Something went wrong on our end. Please open the planner to action the campaign there.",
				tone: "error",
				appUrl,
			}));
		}
	};

app.get("/feedback/approve/:token", feedbackActionHandler("approve"));
app.get("/feedback/revise/:token", feedbackActionHandler("revise"));

// ============================================================
// Send Planner Overview Emails (batch send to all users with selections)
// Called by admin to send overview emails to all practices with selections
// Uses Resend batch API for efficient sending
// ============================================================
app.post("/send-planner-overview-emails", async (req: Request, res: Response) => {
	const startTime = Date.now();
	const { testEmailOverride } = req.body;

	const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";
	const BATCH_SIZE = 100; // Resend allows up to 100 emails per batch

	// Debug logging
	console.log(`[Planner Overview Emails] Request body:`, req.body);
	console.log(`[Planner Overview Emails] testEmailOverride:`, testEmailOverride);

	if (testEmailOverride) {
		console.log(`[Planner Overview Emails] TEST MODE - sending to: ${testEmailOverride}`);
	} else {
		console.log(`[Planner Overview Emails] WARNING: No test email override - will send to real users!`);
	}

	const results = {
		processed: 0,
		sent: 0,
		skipped: 0,
		errors: [] as string[],
		practices: [] as { practiceId: string; practiceName: string; recipientCount: number; selectionsCount: number }[],
	};

	// Collect all emails to send
	interface EmailToSend {
		from: string;
		to: string[];
		subject: string;
		html: string;
		// Metadata for logging
		_meta: {
			userId: string;
			userEmail: string;
			practiceId: string;
			practiceName: string;
			selectionsCount: number;
		};
	}
	const emailsToSend: EmailToSend[] = [];

	try {
		// 1. Get all practices that have at least one selection
		const { data: practicesWithSelections, error: practicesError } = await supabase
			.from("selections")
			.select("practice_id")
			.not("practice_id", "is", null);

		if (practicesError) {
			console.error("[Planner Overview Emails] Error fetching selections:", practicesError);
			return res.status(500).json({ error: practicesError.message });
		}

		// Get unique practice IDs
		const uniquePracticeIds = [...new Set(practicesWithSelections?.map((s) => s.practice_id) || [])];

		if (uniquePracticeIds.length === 0) {
			console.log("[Planner Overview Emails] No practices with selections found");
			return res.status(200).json({ ...results, message: "No practices with selections" });
		}

		console.log(`[Planner Overview Emails] Processing ${uniquePracticeIds.length} practices`);

		// 2. Collect all emails from all practices
		for (const practiceId of uniquePracticeIds) {
			results.processed++;

			try {
				// Get practice details
				const { data: practice, error: practiceError } = await supabase
					.from("practices")
					.select("id, name")
					.eq("id", practiceId)
					.single();

				if (practiceError || !practice) {
					console.error(`[Planner Overview Emails] Practice not found: ${practiceId}`);
					results.errors.push(`Practice not found: ${practiceId}`);
					continue;
				}

				// Get practice members
				const { data: practiceMembers, error: membersError } = await supabase
					.from("practice_members")
					.select("user_id, email")
					.eq("practice_id", practiceId);

				if (membersError || !practiceMembers || practiceMembers.length === 0) {
					console.log(`[Planner Overview Emails] No users for practice ${practice.name}, skipping`);
					results.skipped++;
					continue;
				}

				// Get user details
				const userIds = practiceMembers.map((m) => m.user_id).filter(Boolean);
				const { data: users, error: usersError } = await supabase
					.from("allowed_users")
					.select("id, email, first_name")
					.in("id", userIds);

				if (usersError || !users || users.length === 0) {
					console.log(`[Planner Overview Emails] No valid users for practice ${practice.name}, skipping`);
					results.skipped++;
					continue;
				}

				// Get selections for this practice
				const { data: directSelections, error: selectionsError } = await supabase
					.from("selections")
					.select(`id, from_date, to_date, status, bespoke, campaign_id, bespoke_campaign_id`)
					.eq("practice_id", practiceId)
					.order("from_date", { ascending: true });

				if (selectionsError || !directSelections || directSelections.length === 0) {
					console.log(`[Planner Overview Emails] No selections for practice ${practice.name}, skipping`);
					results.skipped++;
					continue;
				}

				// Build selection data with campaign names
				const selectionsData: SelectionWithCampaign[] = [];
				for (const sel of directSelections) {
					let campaignName = "Unknown Campaign";
					let campaignCategory = "Campaign";

					if (sel.bespoke && sel.bespoke_campaign_id) {
						const { data: bespoke } = await supabase
							.from("bespoke_campaigns")
							.select("name")
							.eq("id", sel.bespoke_campaign_id)
							.single();
						if (bespoke) {
							campaignName = bespoke.name;
							campaignCategory = "Bespoke";
						}
					} else if (sel.campaign_id) {
						const { data: catalog } = await supabase
							.from("campaigns_catalog")
							.select("name, category")
							.eq("id", sel.campaign_id)
							.single();
						if (catalog) {
							campaignName = catalog.name;
							campaignCategory = catalog.category || "Campaign";
						}
					}

					selectionsData.push({
						id: sel.id,
						from_date: sel.from_date,
						to_date: sel.to_date,
						status: sel.status,
						bespoke: sel.bespoke,
						campaign_name: campaignName,
						campaign_category: campaignCategory,
					});
				}

				// Track practice stats
				let practiceRecipientCount = 0;

				// Prepare emails for each user
				for (const user of users as PracticeUser[]) {
					const firstName = user.first_name || user.email?.split("@")[0] || "there";
					const recipientEmail = testEmailOverride || user.email;

					if (!recipientEmail) continue;

					const emailHtml = await render(
						PlannerOverviewEmail({
							firstName,
							practiceName: practice.name,
							practiceId: practice.id,
							selections: selectionsData,
							appUrl,
						})
					);

					const emailSubject = `HG Marketing Planner: your 2026 planned activity + next steps`;

					emailsToSend.push({
						from: "HG Planner <noreply@planner.hakimgroup.io>",
						to: [recipientEmail],
						subject: emailSubject,
						html: emailHtml,
						_meta: {
							userId: user.id,
							userEmail: user.email,
							practiceId: practice.id,
							practiceName: practice.name,
							selectionsCount: selectionsData.length,
						},
					});

					practiceRecipientCount++;

					// If in test mode, only prepare one email per practice
					if (testEmailOverride) break;
				}

				if (practiceRecipientCount > 0) {
					results.practices.push({
						practiceId: practice.id,
						practiceName: practice.name,
						recipientCount: practiceRecipientCount,
						selectionsCount: selectionsData.length,
					});
				}
			} catch (practiceError: any) {
				console.error(`[Planner Overview Emails] Error processing practice ${practiceId}:`, practiceError);
				results.errors.push(`Error processing ${practiceId}: ${practiceError.message}`);
			}
		}

		// 3. Batch send all collected emails
		console.log(`[Planner Overview Emails] Prepared ${emailsToSend.length} emails, sending in batches of ${BATCH_SIZE}`);

		for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
			const batch = emailsToSend.slice(i, i + BATCH_SIZE);
			const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
			const totalBatches = Math.ceil(emailsToSend.length / BATCH_SIZE);

			console.log(`[Planner Overview Emails] Sending batch ${batchNumber}/${totalBatches} (${batch.length} emails)`);

			// Prepare batch payload (strip _meta for Resend)
			const batchPayload = batch.map(({ _meta, ...email }) => email);

			try {
				const { data: batchResult, error: batchError } = await resend.batch.send(batchPayload);

				if (batchError) {
					console.error(`[Planner Overview Emails] Batch ${batchNumber} error:`, batchError);
					results.errors.push(`Batch ${batchNumber} error: ${batchError.message}`);
					// Log failures
					for (const email of batch) {
						await supabase.from("notification_emails_log").insert({
							email_type: "planner_overview",
							recipient_email: email._meta.userEmail,
							recipient_user_id: email._meta.userId,
							practice_id: email._meta.practiceId,
							practice_name: email._meta.practiceName,
							status: "failed",
							error_message: batchError.message,
							payload: { selections_count: email._meta.selectionsCount },
						});
					}
				} else {
					results.sent += batch.length;
					console.log(`[Planner Overview Emails] Batch ${batchNumber} sent successfully (${batch.length} emails)`);

					// Log successes
					for (const email of batch) {
						await supabase.from("notification_emails_log").insert({
							email_type: "planner_overview",
							recipient_email: email._meta.userEmail,
							recipient_user_id: email._meta.userId,
							practice_id: email._meta.practiceId,
							practice_name: email._meta.practiceName,
							status: "sent",
							payload: { selections_count: email._meta.selectionsCount },
						});
					}
				}
			} catch (batchSendError: any) {
				console.error(`[Planner Overview Emails] Batch ${batchNumber} send exception:`, batchSendError);
				results.errors.push(`Batch ${batchNumber} exception: ${batchSendError.message}`);
			}
		}

		const duration = Date.now() - startTime;
		console.log(`[Planner Overview Emails] Completed in ${duration}ms:`, results);

		return res.status(200).json({
			...results,
			duration_ms: duration,
		});
	} catch (error: any) {
		console.error("[Planner Overview Emails] Unexpected error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ============================================================
// Send Sample Emails (for testing all email templates)
// ============================================================
app.post("/send-sample-emails", async (req: Request, res: Response) => {
	const { testEmail, practiceId, templates, appUrl: customAppUrl } = req.body;

	if (!testEmail) {
		return res.status(400).json({ error: "testEmail is required" });
	}

	const appUrl = customAppUrl || process.env.APP_URL || "https://planner.hakimgroup.co.uk";

	// Helper to delay between sends to avoid rate limiting
	const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	// Check if a specific template should be sent
	const shouldSend = (templateName: string) => {
		if (!templates || !Array.isArray(templates) || templates.length === 0) {
			return true; // Send all if no filter specified
		}
		return templates.includes(templateName);
	};

	// Mock data for templates (use provided practiceId if available)
	const mockPracticeId = practiceId || "test-practice-123";
	const mockPracticeName = "Sample Opticians";
	const mockSelectionId = "test-selection-456";
	const mockFromDate = "2026-02-01";
	const mockToDate = "2026-02-28";
	const mockCampaignName = "Spring Eye Health Campaign";
	const mockCampaignCategory = "Evergreen";
	const mockUserName = "David";

	const mockSelections = [
		{ campaign_name: "Spring Eye Health Campaign", campaign_category: "Evergreen", from_date: "2026-02-01", to_date: "2026-02-28", status: "onPlan" },
		{ campaign_name: "Children's Vision Week", campaign_category: "Event", from_date: "2026-03-15", to_date: "2026-03-22", status: "onPlan" },
		{ campaign_name: "Custom Practice Launch", campaign_category: "Bespoke", from_date: "2026-04-01", to_date: "2026-04-30", status: "onPlan" },
	];

	const mockCreatives = [
		{ url: "https://example.com/creative1.jpg", label: "Option A - Blue Theme" },
		{ url: "https://example.com/creative2.jpg", label: "Option B - Green Theme" },
	];

	const mockAssets = {
		digitalAssets: [
			{ name: "social_posts", label: "Social Media Posts", quantity: 5 },
			{ name: "email_banner", label: "Email Banner", quantity: 1 },
		],
		printedAssets: [
			{ name: "a2_poster", label: "A2 Poster", quantity: 2 },
			{ name: "leaflet", label: "A5 Leaflet", quantity: 100 },
		],
		externalPlacements: [
			{ name: "bus_stop", label: "Bus Stop Ad", quantity: 1 },
		],
	};

	const mockCampaigns = [
		{ selectionId: "sel-1", campaignName: "Spring Eye Health", campaignCategory: "Evergreen", fromDate: "2026-02-01", toDate: "2026-02-28" },
		{ selectionId: "sel-2", campaignName: "Children's Vision Week", campaignCategory: "Event", fromDate: "2026-03-15", toDate: "2026-03-22" },
	];

	const results: { template: string; success: boolean; error?: string; resendId?: string }[] = [];

	console.log(`[Sample Emails] Sending sample emails to: ${testEmail}`);

	try {
		// 1. WelcomeSummaryEmail
		if (shouldSend("WelcomeSummaryEmail")) try {
			console.log(`[Sample Emails] Sending WelcomeSummaryEmail...`);
			const html = await render(WelcomeSummaryEmail({
				practiceName: mockPracticeName,
				practiceId: mockPracticeId,
				selections: mockSelections,
				appUrl,
			}));
			const { data, error } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: [testEmail],
				subject: "[SAMPLE] Welcome Summary Email",
				html,
			});
			if (error) {
				console.log(`[Sample Emails] WelcomeSummaryEmail error:`, error);
				results.push({ template: "WelcomeSummaryEmail", success: false, error: error.message });
			} else {
				console.log(`[Sample Emails] WelcomeSummaryEmail sent, id:`, data?.id);
				results.push({ template: "WelcomeSummaryEmail", success: true, resendId: data?.id });
			}
		} catch (e: any) {
			console.log(`[Sample Emails] WelcomeSummaryEmail exception:`, e.message);
			results.push({ template: "WelcomeSummaryEmail", success: false, error: e.message });
		}

		await delay(1000); // 1 second delay

		// 2. EmptyPlannerEmail
		if (shouldSend("EmptyPlannerEmail")) try {
			console.log(`[Sample Emails] Sending EmptyPlannerEmail...`);
			const html = await render(EmptyPlannerEmail({
				practiceName: mockPracticeName,
				practiceId: mockPracticeId,
				appUrl,
			}));
			const { data, error } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: [testEmail],
				subject: "[SAMPLE] Empty Planner Email",
				html,
			});
			if (error) {
				console.log(`[Sample Emails] EmptyPlannerEmail error:`, error);
				results.push({ template: "EmptyPlannerEmail", success: false, error: error.message });
			} else {
				console.log(`[Sample Emails] EmptyPlannerEmail sent, id:`, data?.id);
				results.push({ template: "EmptyPlannerEmail", success: true, resendId: data?.id });
			}
		} catch (e: any) {
			console.log(`[Sample Emails] EmptyPlannerEmail exception:`, e.message);
			results.push({ template: "EmptyPlannerEmail", success: false, error: e.message });
		}

		await delay(1000);

		// 3. AssetsRequestedEmail
		if (shouldSend("AssetsRequestedEmail")) try {
			console.log(`[Sample Emails] Sending AssetsRequestedEmail...`);
			const html = await render(AssetsRequestedEmail({
				practiceName: mockPracticeName,
				practiceId: mockPracticeId,
				campaignName: mockCampaignName,
				campaignCategory: mockCampaignCategory,
				fromDate: mockFromDate,
				toDate: mockToDate,
				creatives: mockCreatives,
				assets: mockAssets,
				note: "Please select your preferred creative option and the assets you need for this campaign.",
				appUrl,
				selectionId: mockSelectionId,
			}));
			const { data, error } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: [testEmail],
				subject: "[SAMPLE] Assets Requested Email",
				html,
			});
			if (error) {
				console.log(`[Sample Emails] AssetsRequestedEmail error:`, error);
				results.push({ template: "AssetsRequestedEmail", success: false, error: error.message });
			} else {
				console.log(`[Sample Emails] AssetsRequestedEmail sent, id:`, data?.id);
				results.push({ template: "AssetsRequestedEmail", success: true, resendId: data?.id });
			}
		} catch (e: any) {
			console.log(`[Sample Emails] AssetsRequestedEmail exception:`, e.message);
			results.push({ template: "AssetsRequestedEmail", success: false, error: e.message });
		}

		await delay(1000);

		// 4. AssetsRequestedBulkEmail
		if (shouldSend("AssetsRequestedBulkEmail")) try {
			console.log(`[Sample Emails] Sending AssetsRequestedBulkEmail...`);
			const html = await render(AssetsRequestedBulkEmail({
				practiceName: mockPracticeName,
				practiceId: mockPracticeId,
				campaigns: mockCampaigns,
				appUrl,
			}));
			const { data, error } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: [testEmail],
				subject: "[SAMPLE] Assets Requested Bulk Email",
				html,
			});
			if (error) {
				console.log(`[Sample Emails] AssetsRequestedBulkEmail error:`, error);
				results.push({ template: "AssetsRequestedBulkEmail", success: false, error: error.message });
			} else {
				console.log(`[Sample Emails] AssetsRequestedBulkEmail sent, id:`, data?.id);
				results.push({ template: "AssetsRequestedBulkEmail", success: true, resendId: data?.id });
			}
		} catch (e: any) {
			console.log(`[Sample Emails] AssetsRequestedBulkEmail exception:`, e.message);
			results.push({ template: "AssetsRequestedBulkEmail", success: false, error: e.message });
		}

		await delay(1000);

		// 5. AssetsSubmittedEmail
		if (shouldSend("AssetsSubmittedEmail")) try {
			console.log(`[Sample Emails] Sending AssetsSubmittedEmail...`);
			const html = await render(AssetsSubmittedEmail({
				practiceName: mockPracticeName,
				practiceId: mockPracticeId,
				campaignName: mockCampaignName,
				campaignCategory: mockCampaignCategory,
				fromDate: mockFromDate,
				toDate: mockToDate,
				chosenCreative: "Option A - Blue Theme",
				assets: mockAssets,
				note: "We would like to focus on digital marketing for this campaign.",
				appUrl,
				selectionId: mockSelectionId,
			}));
			const { data, error } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: [testEmail],
				subject: "[SAMPLE] Assets Submitted Email",
				html,
			});
			if (error) {
				console.log(`[Sample Emails] AssetsSubmittedEmail error:`, error);
				results.push({ template: "AssetsSubmittedEmail", success: false, error: error.message });
			} else {
				console.log(`[Sample Emails] AssetsSubmittedEmail sent, id:`, data?.id);
				results.push({ template: "AssetsSubmittedEmail", success: true, resendId: data?.id });
			}
		} catch (e: any) {
			console.log(`[Sample Emails] AssetsSubmittedEmail exception:`, e.message);
			results.push({ template: "AssetsSubmittedEmail", success: false, error: e.message });
		}

		await delay(1000);

		// 6. CampaignAddedEmail
		if (shouldSend("CampaignAddedEmail")) try {
			console.log(`[Sample Emails] Sending CampaignAddedEmail...`);
			const html = await render(CampaignAddedEmail({
				userName: mockUserName,
				practiceName: mockPracticeName,
				practiceId: mockPracticeId,
				campaignName: mockCampaignName,
				campaignCategory: mockCampaignCategory,
				fromDate: mockFromDate,
				toDate: mockToDate,
				isBespoke: false,
				appUrl,
			}));
			const { data, error } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: [testEmail],
				subject: "[SAMPLE] Campaign Added Email",
				html,
			});
			if (error) {
				console.log(`[Sample Emails] CampaignAddedEmail error:`, error);
				results.push({ template: "CampaignAddedEmail", success: false, error: error.message });
			} else {
				console.log(`[Sample Emails] CampaignAddedEmail sent, id:`, data?.id);
				results.push({ template: "CampaignAddedEmail", success: true, resendId: data?.id });
			}
		} catch (e: any) {
			console.log(`[Sample Emails] CampaignAddedEmail exception:`, e.message);
			results.push({ template: "CampaignAddedEmail", success: false, error: e.message });
		}

		await delay(1000);

		// 7. CampaignUpdatedEmail
		if (shouldSend("CampaignUpdatedEmail")) try {
			console.log(`[Sample Emails] Sending CampaignUpdatedEmail...`);
			const html = await render(CampaignUpdatedEmail({
				userName: mockUserName,
				practiceName: mockPracticeName,
				practiceId: mockPracticeId,
				campaignName: mockCampaignName,
				campaignCategory: mockCampaignCategory,
				fromDate: mockFromDate,
				toDate: mockToDate,
				isBespoke: false,
				appUrl,
			}));
			const { data, error } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: [testEmail],
				subject: "[SAMPLE] Campaign Updated Email",
				html,
			});
			if (error) {
				console.log(`[Sample Emails] CampaignUpdatedEmail error:`, error);
				results.push({ template: "CampaignUpdatedEmail", success: false, error: error.message });
			} else {
				console.log(`[Sample Emails] CampaignUpdatedEmail sent, id:`, data?.id);
				results.push({ template: "CampaignUpdatedEmail", success: true, resendId: data?.id });
			}
		} catch (e: any) {
			console.log(`[Sample Emails] CampaignUpdatedEmail exception:`, e.message);
			results.push({ template: "CampaignUpdatedEmail", success: false, error: e.message });
		}

		await delay(1000);

		// 8. CampaignDeletedEmail
		if (shouldSend("CampaignDeletedEmail")) try {
			console.log(`[Sample Emails] Sending CampaignDeletedEmail...`);
			const html = await render(CampaignDeletedEmail({
				userName: mockUserName,
				practiceName: mockPracticeName,
				practiceId: mockPracticeId,
				campaignName: mockCampaignName,
				campaignCategory: mockCampaignCategory,
				isBespoke: false,
				appUrl,
			}));
			const { data, error } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: [testEmail],
				subject: "[SAMPLE] Campaign Deleted Email",
				html,
			});
			if (error) {
				console.log(`[Sample Emails] CampaignDeletedEmail error:`, error);
				results.push({ template: "CampaignDeletedEmail", success: false, error: error.message });
			} else {
				console.log(`[Sample Emails] CampaignDeletedEmail sent, id:`, data?.id);
				results.push({ template: "CampaignDeletedEmail", success: true, resendId: data?.id });
			}
		} catch (e: any) {
			console.log(`[Sample Emails] CampaignDeletedEmail exception:`, e.message);
			results.push({ template: "CampaignDeletedEmail", success: false, error: e.message });
		}

		await delay(1000);

		// 9. PlannerOverviewEmail
		if (shouldSend("PlannerOverviewEmail")) try {
			console.log(`[Sample Emails] Sending PlannerOverviewEmail...`);
			const html = await render(PlannerOverviewEmail({
				firstName: mockUserName,
				practiceName: mockPracticeName,
				practiceId: mockPracticeId,
				selections: mockSelections,
				appUrl,
			}));
			const { data, error } = await resend.emails.send({
				from: "HG Planner <noreply@planner.hakimgroup.io>",
				to: [testEmail],
				subject: "[SAMPLE] Planner Overview Email",
				html,
			});
			if (error) {
				console.log(`[Sample Emails] PlannerOverviewEmail error:`, error);
				results.push({ template: "PlannerOverviewEmail", success: false, error: error.message });
			} else {
				console.log(`[Sample Emails] PlannerOverviewEmail sent, id:`, data?.id);
				results.push({ template: "PlannerOverviewEmail", success: true, resendId: data?.id });
			}
		} catch (e: any) {
			console.log(`[Sample Emails] PlannerOverviewEmail exception:`, e.message);
			results.push({ template: "PlannerOverviewEmail", success: false, error: e.message });
		}

		const successCount = results.filter(r => r.success).length;
		console.log(`[Sample Emails] Sent ${successCount}/${results.length} sample emails`);

		return res.status(200).json({
			sent: successCount,
			total: results.length,
			results,
		});
	} catch (error: any) {
		console.error("[Sample Emails] Unexpected error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ============================================================================
// CRON: Activate Live Campaigns
// Runs daily at 8am UK time to update confirmed selections to live status
// ============================================================================
app.all(["/activate-live-campaigns", "/api/activate-live-campaigns"], async (req: Request, res: Response) => {
	const startTime = Date.now();

	console.log(`[Activate Live] Endpoint called - Method: ${req.method}, Path: ${req.path}`);

	// Verify cron secret (for security)
	const authHeader = req.headers.authorization;
	const cronSecretHeader = req.headers["x-cron-secret"];
	const expectedSecret = process.env.CRON_SECRET;

	const providedSecret = authHeader?.replace("Bearer ", "") || cronSecretHeader;

	console.log(`[Activate Live] Auth check - Has auth header: ${!!authHeader}, Has cron secret header: ${!!cronSecretHeader}, Has expected secret env: ${!!expectedSecret}`);

	if (expectedSecret && providedSecret !== expectedSecret) {
		console.error("[Activate Live] Unauthorized request - invalid cron secret");
		return res.status(401).json({ error: "Unauthorized" });
	}

	const results = {
		processed: 0,
		activated: 0,
		completed: 0,
		skipped: 0,
		errors: [] as string[],
	};

	try {
		// Get today's date in UK timezone (Europe/London)
		const ukDate = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
		console.log(`[Activate Live] Today's UK date: ${ukDate}`);

		// Query all selections with status='confirmed' and from_date = today
		const { data: selections, error: queryError } = await supabase
			.from("selections")
			.select("id, practice_id, campaign_id, bespoke_campaign_id, from_date, status")
			.eq("status", "confirmed")
			.eq("from_date", ukDate);

		if (queryError) {
			console.error("[Activate Live] Query error:", queryError);
			return res.status(500).json({ error: queryError.message });
		}

		if (!selections || selections.length === 0) {
			console.log("[Activate Live] No confirmed selections to activate today");
			return res.status(200).json({
				...results,
				message: "No confirmed selections to activate",
				ukDate,
				durationMs: Date.now() - startTime
			});
		}

		console.log(`[Activate Live] Found ${selections.length} selections to activate`);

		// Process each selection
		for (const selection of selections) {
			results.processed++;

			try {
				// Update selection status to 'live'
				const { error: updateError } = await supabase
					.from("selections")
					.update({ status: "live" })
					.eq("id", selection.id);

				if (updateError) {
					console.error(`[Activate Live] Failed to update selection ${selection.id}:`, updateError);
					results.errors.push(`Selection ${selection.id}: ${updateError.message}`);
					continue;
				}

				// Log to selection_status_history
				const { error: historyError } = await supabase
					.from("selection_status_history")
					.insert({
						selection_id: selection.id,
						from_status: "confirmed",
						to_status: "live",
						actor_user_id: "00000000-0000-0000-0000-000000000000",
						note: "Campaign has gone live.",
					});

				if (historyError) {
					console.warn(`[Activate Live] Failed to log history for selection ${selection.id}:`, historyError);
					// Don't fail the whole process for history logging failures
				}

				results.activated++;
				console.log(`[Activate Live] Activated selection ${selection.id}`);

			} catch (selectionError: any) {
				console.error(`[Activate Live] Error processing selection ${selection.id}:`, selectionError);
				results.errors.push(`Selection ${selection.id}: ${selectionError.message}`);
			}
		}

		// === Phase 2: Complete expired live campaigns (to_date < today) ===
		const { data: expiredSelections, error: expiredError } = await supabase
			.from("selections")
			.select("id, practice_id, campaign_id, bespoke_campaign_id, to_date, status")
			.eq("status", "live")
			.lt("to_date", ukDate);

		if (expiredError) {
			console.error("[Activate Live] Expired query error:", expiredError);
			results.errors.push(`Expired query: ${expiredError.message}`);
		} else if (expiredSelections && expiredSelections.length > 0) {
			console.log(`[Activate Live] Found ${expiredSelections.length} expired live selections to complete`);

			for (const selection of expiredSelections) {
				results.processed++;

				try {
					const { error: updateError } = await supabase
						.from("selections")
						.update({ status: "completed" })
						.eq("id", selection.id);

					if (updateError) {
						console.error(`[Activate Live] Failed to complete selection ${selection.id}:`, updateError);
						results.errors.push(`Selection ${selection.id}: ${updateError.message}`);
						continue;
					}

					const { error: historyError } = await supabase
						.from("selection_status_history")
						.insert({
							selection_id: selection.id,
							from_status: "live",
							to_status: "completed",
							actor_user_id: "00000000-0000-0000-0000-000000000000",
							note: "Campaign has completed (past end date).",
						});

					if (historyError) {
						console.warn(`[Activate Live] Failed to log history for selection ${selection.id}:`, historyError);
					}

					results.completed++;
					console.log(`[Activate Live] Completed selection ${selection.id}`);

				} catch (selectionError: any) {
					console.error(`[Activate Live] Error completing selection ${selection.id}:`, selectionError);
					results.errors.push(`Selection ${selection.id}: ${selectionError.message}`);
				}
			}
		} else {
			console.log("[Activate Live] No expired live selections to complete");
		}

		const durationMs = Date.now() - startTime;
		console.log(`[Activate Live] Done - Activated ${results.activated}, Completed ${results.completed} in ${durationMs}ms`);

		return res.status(200).json({
			...results,
			ukDate,
			durationMs,
			message: `Activated ${results.activated}, completed ${results.completed} selections`
		});

	} catch (error: any) {
		console.error("[Activate Live] Unexpected error:", error);
		return res.status(500).json({
			error: error.message,
			durationMs: Date.now() - startTime
		});
	}
});

// Health check endpoint for cron debugging
// ============================================================
// Feedback Reminder + Admin Escalation Cron
//
// Runs daily. Two passes:
//   1. Reminder pass — selections at awaitingApproval with markup_opened_at
//      between 3 and 10 days old AND no reminder yet. Sends the magic-link
//      reminder email to the practice's user-role members.
//   2. Escalation pass — selections still at awaitingApproval where the
//      reminder was sent 7+ days ago AND no escalation yet. Sends the
//      escalation email to the practice's admin-role members + super admins.
//
// Auth: same Bearer CRON_SECRET pattern as /activate-live-campaigns.
// ============================================================
const feedbackRemindersHandler = async (
	req: Request,
	res: Response,
): Promise<any> => {
	const startTime = Date.now();
	const authHeader = req.headers.authorization;
	const cronSecretHeader = req.headers["x-cron-secret"];
	const expectedSecret = process.env.CRON_SECRET;
	const providedSecret =
		authHeader?.replace("Bearer ", "") || cronSecretHeader;

	if (expectedSecret && providedSecret !== expectedSecret) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";
	const serverBase =
		process.env.SERVER_BASE_URL ||
		(process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: null);

	const results = {
		reminders_sent: 0,
		escalations_sent: 0,
		errors: [] as string[],
	};

	try {
		// =================
		// 1. Reminder pass
		// =================
		const { data: reminderCandidates, error: reminderQueryError } =
			await supabase
				.from("selections")
				.select(
					"id, practice_id, campaign_id, bespoke_campaign_id, markup_opened_at, markup_link, from_date, to_date",
				)
				.eq("status", "awaitingApproval")
				.not("markup_opened_at", "is", null)
				.is("feedback_reminder_sent_at", null)
				.lt(
					"markup_opened_at",
					new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
				);

		if (reminderQueryError) {
			results.errors.push(`reminder query: ${reminderQueryError.message}`);
		}

		for (const sel of reminderCandidates ?? []) {
			try {
				// Look up practice + campaign + recipients
				const { data: practice } = await supabase
					.from("practices")
					.select("id, name")
					.eq("id", sel.practice_id)
					.single();
				if (!practice) continue;

				let campaignName = "Campaign";
				if (sel.campaign_id) {
					const { data: cc } = await supabase
						.from("campaigns_catalog")
						.select("name")
						.eq("id", sel.campaign_id)
						.single();
					campaignName = cc?.name ?? campaignName;
				} else if (sel.bespoke_campaign_id) {
					const { data: bc } = await supabase
						.from("bespoke_campaigns")
						.select("name")
						.eq("id", sel.bespoke_campaign_id)
						.single();
					campaignName = bc?.name ?? campaignName;
				}

				// Recipients: user-role practice members
				const { data: members } = await supabase
					.from("practice_members")
					.select("user_id, email, role")
					.eq("practice_id", sel.practice_id)
					.eq("role", "user");

				const recipients = (members ?? []).filter(
					(m: any) => m.user_id && m.email,
				);
				if (recipients.length === 0) {
					console.log(
						`[Feedback Reminder] skipping ${sel.id} — no user-role members`,
					);
					continue;
				}

				// Build per-recipient magic links + send
				const finalRecipientList: string[] = process.env
					.TEST_EMAIL_OVERRIDE
					? [process.env.TEST_EMAIL_OVERRIDE]
					: recipients.map((r: any) => r.email);

				const firstRecipient = recipients[0];
				const approveToken = signFeedbackToken(
					sel.id,
					"approve",
					firstRecipient.user_id,
				);
				const reviseToken = signFeedbackToken(
					sel.id,
					"revise",
					firstRecipient.user_id,
				);
				const serverForLinks = serverBase ?? appUrl;
				const approveUrl = `${serverForLinks}/feedback/approve/${approveToken}`;
				const reviseUrl = `${serverForLinks}/feedback/revise/${reviseToken}`;
				const markupUrl = sel.markup_link ?? `${appUrl}/dashboard`;

				const html = await render(
					FeedbackReminderEmail({
						practiceName: practice.name,
						campaignName,
						markupOpenedAt: sel.markup_opened_at!,
						approveUrl,
						reviseUrl,
						markupUrl,
					}),
				);

				const { data: sendData, error: sendErr } =
					await resend.emails.send({
						from: "HG Planner <noreply@planner.hakimgroup.io>",
						to: finalRecipientList,
						subject: `Quick yes/no on the ${campaignName} artwork`,
						html,
					});

				if (sendErr) {
					results.errors.push(`reminder ${sel.id}: ${sendErr.message}`);
					continue;
				}

				// Mark sent
				await supabase
					.from("selections")
					.update({
						feedback_reminder_sent_at: new Date().toISOString(),
					})
					.eq("id", sel.id);

				// Log the send
				await supabase.from("notification_emails_log").insert({
					email_type: "feedback_reminder",
					recipient_email: finalRecipientList[0],
					selection_id: sel.id,
					practice_id: practice.id,
					practice_name: practice.name,
					campaign_name: campaignName,
					status: "sent",
					attempt_source: "cron",
					attempted_at: new Date().toISOString(),
					sent_at: new Date().toISOString(),
					resend_message_id: (sendData as any)?.id ?? null,
					subject: `Quick yes/no on the ${campaignName} artwork`,
				});

				results.reminders_sent++;
			} catch (e: any) {
				results.errors.push(
					`reminder ${sel.id}: ${e?.message ?? String(e)}`,
				);
			}
		}

		// =================
		// 2. Escalation pass
		// =================
		const { data: escalationCandidates } = await supabase
			.from("selections")
			.select(
				"id, practice_id, campaign_id, bespoke_campaign_id, markup_opened_at, feedback_reminder_sent_at",
			)
			.eq("status", "awaitingApproval")
			.not("feedback_reminder_sent_at", "is", null)
			.is("feedback_admin_escalated_at", null)
			.lt(
				"feedback_reminder_sent_at",
				new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
			);

		for (const sel of escalationCandidates ?? []) {
			try {
				const { data: practice } = await supabase
					.from("practices")
					.select("id, name")
					.eq("id", sel.practice_id)
					.single();
				if (!practice) continue;

				let campaignName = "Campaign";
				if (sel.campaign_id) {
					const { data: cc } = await supabase
						.from("campaigns_catalog")
						.select("name")
						.eq("id", sel.campaign_id)
						.single();
					campaignName = cc?.name ?? campaignName;
				} else if (sel.bespoke_campaign_id) {
					const { data: bc } = await supabase
						.from("bespoke_campaigns")
						.select("name")
						.eq("id", sel.bespoke_campaign_id)
						.single();
					campaignName = bc?.name ?? campaignName;
				}

				// Recipients: admin-role members of this practice + global super_admins
				const { data: practiceAdmins } = await supabase
					.from("practice_members")
					.select("user_id, email, role")
					.eq("practice_id", sel.practice_id)
					.eq("role", "admin");

				const { data: superAdmins } = await supabase
					.from("allowed_users")
					.select("id, email, role, email_notifications_enabled")
					.eq("role", "super_admin");

				const adminEmails = [
					...(practiceAdmins ?? []).map((m: any) => m.email),
					...(superAdmins ?? [])
						.filter(
							(u: any) => u.email_notifications_enabled !== false,
						)
						.map((u: any) => u.email),
				].filter(Boolean);

				if (adminEmails.length === 0) continue;

				const finalRecipientList: string[] = process.env
					.TEST_EMAIL_OVERRIDE
					? [process.env.TEST_EMAIL_OVERRIDE]
					: Array.from(new Set(adminEmails));

				const html = await render(
					FeedbackEscalationEmail({
						practiceName: practice.name,
						campaignName,
						markupOpenedAt: sel.markup_opened_at!,
						reminderSentAt: sel.feedback_reminder_sent_at!,
						appUrl,
						selectionId: sel.id,
					}),
				);

				const { data: sendData, error: sendErr } =
					await resend.emails.send({
						from: "HG Planner <noreply@planner.hakimgroup.io>",
						to: finalRecipientList,
						subject: `${practice.name} unresponsive on ${campaignName} artwork`,
						html,
					});

				if (sendErr) {
					results.errors.push(
						`escalation ${sel.id}: ${sendErr.message}`,
					);
					continue;
				}

				await supabase
					.from("selections")
					.update({
						feedback_admin_escalated_at: new Date().toISOString(),
					})
					.eq("id", sel.id);

				await supabase.from("notification_emails_log").insert({
					email_type: "feedback_escalation",
					recipient_email: finalRecipientList[0],
					selection_id: sel.id,
					practice_id: practice.id,
					practice_name: practice.name,
					campaign_name: campaignName,
					status: "sent",
					attempt_source: "cron",
					attempted_at: new Date().toISOString(),
					sent_at: new Date().toISOString(),
					resend_message_id: (sendData as any)?.id ?? null,
					subject: `${practice.name} unresponsive on ${campaignName} artwork`,
				});

				results.escalations_sent++;
			} catch (e: any) {
				results.errors.push(
					`escalation ${sel.id}: ${e?.message ?? String(e)}`,
				);
			}
		}

		const durationMs = Date.now() - startTime;
		console.log(
			`[Feedback Reminders] Done - reminders=${results.reminders_sent}, escalations=${results.escalations_sent}, errors=${results.errors.length}, ${durationMs}ms`,
		);

		return res.status(200).json({ ...results, durationMs });
	} catch (err: any) {
		console.error("[Feedback Reminders] unexpected:", err);
		return res.status(500).json({ error: err.message, partial: results });
	}
};

app.all(
	["/send-feedback-reminders", "/api/send-feedback-reminders"],
	feedbackRemindersHandler,
);

app.get(["/cron-health", "/api/cron-health"], (req, res) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		hasCronSecret: !!process.env.CRON_SECRET,
		hasTestEmailOverride: !!process.env.TEST_EMAIL_OVERRIDE,
		testEmailOverride: process.env.TEST_EMAIL_OVERRIDE || null,
		hasOnboardingTestEmail: !!process.env.ONBOARDING_TEST_EMAIL,
		appUrl: process.env.APP_URL || null,
	});
});

// ============================================================================
// Send Custom Email (super admin feature)
// ============================================================================
app.post("/send-custom-email", async (req: Request, res: Response) => {
	const {
		template,
		subject,
		body,
		practiceName,
		senderName,
		ctaText,
		ctaUrl,
		recipientEmails,
	} = req.body;

	if (!template || !subject || !body || !recipientEmails?.length) {
		return res.status(400).json({
			error: "template, subject, body, and recipientEmails are required",
		});
	}

	const testOverride = process.env.TEST_EMAIL_OVERRIDE;
	const fromEmail = process.env.FROM_EMAIL || "Team@planner.hakimgroup.io";
	const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";

	try {
		const templateProps = {
			subject,
			body,
			practiceName: practiceName || "Practice",
			senderName: senderName || undefined,
			ctaText: ctaText || "Open QPlanner",
			ctaUrl: ctaUrl || appUrl,
		};

		let emailHtml: string;
		if (template === "action") {
			emailHtml = await render(CustomActionEmail(templateProps));
		} else if (template === "announcement") {
			emailHtml = await render(CustomAnnouncementEmail(templateProps));
		} else {
			emailHtml = await render(CustomSimpleEmail(templateProps));
		}

		const finalRecipients = testOverride
			? [testOverride]
			: (recipientEmails as string[]).filter(Boolean);

		const { error: sendError } = await resend.emails.send({
			from: fromEmail,
			to: finalRecipients,
			subject,
			html: emailHtml,
		});

		if (sendError) {
			console.error("[Custom Email] Send error:", sendError);
			return res.status(500).json({ error: sendError.message });
		}

		console.log(
			`[Custom Email] Sent "${template}" template to ${finalRecipients.length} recipients`
		);
		return res.status(200).json({
			sent: finalRecipients.length,
			template,
		});
	} catch (error: any) {
		console.error("[Custom Email] Error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ============================================================
// Reconcile email log against Resend
// ============================================================
// For every notification_emails_log row in the recent window with a
// resend_message_id, fetch Resend's current status and update our row if
// Resend reports a terminal state (bounced/complaint/failed) that differs
// from what we stored.
//
// Also reports "stuck attempts" — rows still status='attempted' after a
// grace window (we never heard back from the server after the pre-flight log).
//
// Accepts both POST (admin button) and GET (cron-job.org). Cron auth via
// Authorization: Bearer <CRON_SECRET> header.
const reconcileHandler = async (req: Request, res: Response): Promise<any> => {
	// Optional auth for cron callers
	const cronSecret = process.env.CRON_SECRET;
	const authHeader = req.headers.authorization ?? "";
	const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

	const hoursBack = Math.min(
		Math.max(parseInt(String(req.query.hoursBack ?? req.body?.hoursBack ?? "48"), 10) || 48, 1),
		168 // cap at 7 days
	);
	const dryRun = Boolean(req.query.dryRun ?? req.body?.dryRun);

	try {
		const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

		// 1. Pull recent rows with a Resend id to reconcile
		const { data: rows, error: queryError } = await supabase
			.from("notification_emails_log")
			.select("id, status, resend_message_id, recipient_email, created_at")
			.gte("created_at", since)
			.not("resend_message_id", "is", null)
			.in("status", ["sent", "dispatched"]);

		if (queryError) {
			console.error("[Reconcile] query error:", queryError);
			return res.status(500).json({ error: queryError.message });
		}

		const candidates = rows ?? [];
		const updates: Array<{ id: string; old: string; new: string }> = [];
		const errors: Array<{ id: string; error: string }> = [];

		// 2. Walk each candidate. Resend's free tier rate limit is generous
		// but we still pace gently to avoid 429s.
		for (const row of candidates) {
			try {
				const { data, error } = await resend.emails.get(row.resend_message_id);
				if (error || !data) {
					errors.push({ id: row.id, error: error?.message ?? "no data" });
					continue;
				}

				// Resend last_event values we care about
				const lastEvent = (data as any).last_event as string | undefined;
				let newStatus: string | null = null;
				if (lastEvent === "bounced") newStatus = "bounced";
				else if (lastEvent === "complained") newStatus = "complaint";
				else if (lastEvent === "failed") newStatus = "failed";
				// delivered/delivered_to_inbox/sent/opened/clicked → leave as 'sent'

				if (newStatus && newStatus !== row.status) {
					updates.push({ id: row.id, old: row.status, new: newStatus });
					if (!dryRun) {
						await supabase
							.from("notification_emails_log")
							.update({ status: newStatus })
							.eq("id", row.id);
					}
				}
			} catch (err: any) {
				errors.push({ id: row.id, error: err?.message ?? String(err) });
			}
		}

		// 3. Find stuck attempts (status='attempted' beyond a grace window)
		const stuckGraceMinutes = 5;
		const stuckCutoff = new Date(
			Date.now() - stuckGraceMinutes * 60 * 1000
		).toISOString();
		const { data: stuck, error: stuckError } = await supabase
			.from("notification_emails_log")
			.select("id, attempt_source, email_type, attempted_at, notification_id")
			.eq("status", "attempted")
			.lt("attempted_at", stuckCutoff)
			.gte("created_at", since);

		if (stuckError) {
			console.error("[Reconcile] stuck query error:", stuckError);
		}

		console.log(
			`[Reconcile] window=${hoursBack}h candidates=${candidates.length} updates=${updates.length} errors=${errors.length} stuck=${(stuck ?? []).length}`
		);

		return res.status(200).json({
			window_hours: hoursBack,
			candidates: candidates.length,
			updated: updates.length,
			update_summary: updates,
			errors,
			stuck_attempts: stuck ?? [],
			dry_run: dryRun,
			auth_mode: isCron ? "cron" : "manual",
		});
	} catch (error: any) {
		console.error("[Reconcile] unexpected error:", error);
		return res.status(500).json({ error: error.message });
	}
};

app.post("/reconcile-resend-emails", reconcileHandler);
app.get("/reconcile-resend-emails", reconcileHandler);

// ============================================================
// Preview an email from a notification_emails_log row
// ============================================================
// Re-renders the email template using the payload stored at send time so an
// admin can inspect the exact email contents from the Email Health page.
//
// Returns { metadata, html, subject } — metadata for the modal header, html
// rendered into an iframe.
app.get("/preview-email/:logId", async (req: Request, res: Response): Promise<any> => {
	const { logId } = req.params;
	if (!logId) {
		return res.status(400).json({ error: "logId is required" });
	}

	try {
		const { data: row, error } = await supabase
			.from("notification_emails_log")
			.select("id, notification_id, email_type, recipient_email, status, attempt_source, attempted_at, sent_at, created_at, error_message, practice_name, campaign_name, payload, subject, resend_message_id")
			.eq("id", logId)
			.single();

		if (error || !row) {
			return res.status(404).json({ error: "Email log row not found" });
		}

		const payload = (row.payload as any) ?? {};
		const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";
		const practiceName = row.practice_name ?? payload.practice_name ?? "";

		let html: string | null = null;
		try {
			switch (row.email_type) {
				case "assets_requested":
					html = await render(
						AssetsRequestedEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaignName: payload.name ?? "Campaign",
							campaignCategory: payload.category ?? "Campaign",
							fromDate: payload.from_date,
							toDate: payload.to_date,
							creatives: payload.creatives ?? [],
							assets: payload.assets ?? null,
							appUrl,
							selectionId: row.notification_id ? null : null,
						} as any)
					);
					break;
				case "assets_requested_bulk":
					html = await render(
						AssetsRequestedBulkEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaigns: payload.all_campaigns ?? payload.campaigns ?? [],
							appUrl,
						} as any)
					);
					break;
				case "assets_submitted":
					html = await render(
						AssetsSubmittedEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaignName: payload.name ?? "Campaign",
							campaignCategory: payload.category ?? "Campaign",
							fromDate: payload.from_date,
							toDate: payload.to_date,
							chosenCreative: payload.chosen_creative,
							assets: payload.assets ?? null,
							note: payload.note,
							appUrl,
							selectionId: payload.selection_id ?? null,
						} as any)
					);
					break;
				case "assets_confirmed":
					html = await render(
						AssetsConfirmedEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaignName: payload.name ?? "Campaign",
							campaignCategory: payload.category ?? "Campaign",
							fromDate: payload.from_date,
							toDate: payload.to_date,
							chosenCreative: payload.chosen_creative,
							note: payload.note,
							appUrl,
							selectionId: payload.selection_id ?? null,
						} as any)
					);
					break;
				case "feedback_requested":
					html = await render(
						FeedbackRequestedEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaignName: payload.name ?? "Campaign",
							campaignCategory: payload.category ?? "Campaign",
							fromDate: payload.from_date,
							toDate: payload.to_date,
							feedback: payload.feedback ?? "",
							appUrl,
							selectionId: payload.selection_id ?? null,
						} as any)
					);
					break;
				case "awaiting_approval":
					html = await render(
						AwaitingApprovalEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaignName: payload.name ?? "Campaign",
							campaignCategory: payload.category ?? "Campaign",
							fromDate: payload.from_date,
							toDate: payload.to_date,
							markupLink: payload.markup_link,
							assetsLink: payload.assets_link,
							note: payload.note,
							appUrl,
							selectionId: payload.selection_id ?? null,
						} as any)
					);
					break;
				case "campaign_added":
				case "bespoke_added":
				case "bespoke_event_added":
					html = await render(
						CampaignAddedEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaignName: row.campaign_name ?? payload.name ?? "Campaign",
							campaignCategory: payload.campaignCategory ?? payload.category ?? "Campaign",
							fromDate: payload.fromDate ?? payload.from_date,
							toDate: payload.toDate ?? payload.to_date,
							isBespoke: Boolean(payload.isBespoke ?? payload.is_bespoke),
							appUrl,
						} as any)
					);
					break;
				case "campaign_updated":
					html = await render(
						CampaignUpdatedEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaignName: row.campaign_name ?? payload.name ?? "Campaign",
							appUrl,
						} as any)
					);
					break;
				case "campaign_deleted":
					html = await render(
						CampaignDeletedEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaignName: row.campaign_name ?? payload.name ?? "Campaign",
							appUrl,
						} as any)
					);
					break;
				case "campaign_added_bulk":
				case "campaigns_copied":
					html = await render(
						CampaignAddedEmail({
							practiceName,
							practiceId: payload.practice_id ?? "",
							campaignName: `${payload.campaignsCount ?? "Several"} campaigns`,
							campaignCategory: "Bulk",
							fromDate: payload.fromDate ?? payload.from_date,
							toDate: payload.toDate ?? payload.to_date,
							isBespoke: false,
							appUrl,
						} as any)
					);
					break;
				default:
					html = `<pre style="font-family:monospace;padding:16px;color:#444;">Preview not supported for email_type: ${row.email_type}\n\nPayload:\n${JSON.stringify(payload, null, 2)}</pre>`;
			}
		} catch (renderErr: any) {
			console.error("[Preview Email] render error:", renderErr);
			html = `<pre style="color:#b00;padding:16px;">Failed to render preview: ${String(renderErr?.message ?? renderErr)}</pre>`;
		}

		return res.status(200).json({
			metadata: {
				id: row.id,
				notification_id: row.notification_id,
				email_type: row.email_type,
				recipient_email: row.recipient_email,
				status: row.status,
				attempt_source: row.attempt_source,
				attempted_at: row.attempted_at,
				sent_at: row.sent_at,
				created_at: row.created_at,
				error_message: row.error_message,
				practice_name: row.practice_name,
				campaign_name: row.campaign_name,
				subject: row.subject,
				resend_message_id: row.resend_message_id,
				payload,
			},
			html,
		});
	} catch (error: any) {
		console.error("[Preview Email] unexpected error:", error);
		return res.status(500).json({ error: error.message });
	}
});

app.use("/", (req, res) => {
	res.send("Server is running.");
});

// On Vercel, the platform invokes the default-exported Express app as a
// serverless handler — no app.listen() needed and calling it would crash the
// function. We only call listen() when this module is run directly (local dev).
if (require.main === module) {
	app.listen(port, () => {
		console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
	});
}

export default app;
