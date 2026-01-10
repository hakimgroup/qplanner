import express, { Express, Request, NextFunction, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/render";
import { WelcomeSummaryEmail } from "../emails/WelcomeSummaryEmail";
import { EmptyPlannerEmail } from "../emails/EmptyPlannerEmail";

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
		from: "QPlanner Team <team@planner.hakimgroup.io>",
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
app.post("/process-onboarding-emails", async (req: Request, res: Response) => {
	const startTime = Date.now();

	// Verify cron secret (for security)
	// Vercel sends CRON_SECRET as Bearer token in Authorization header
	const authHeader = req.headers.authorization;
	const cronSecretHeader = req.headers["x-cron-secret"];
	const expectedSecret = process.env.CRON_SECRET;

	// Check either Authorization: Bearer <secret> or x-cron-secret header
	const providedSecret =
		authHeader?.replace("Bearer ", "") || cronSecretHeader;

	if (expectedSecret && providedSecret !== expectedSecret) {
		console.error(
			"[Onboarding Emails] Unauthorized request - invalid cron secret"
		);
		return res.status(401).json({ error: "Unauthorized" });
	}

	const appUrl = process.env.APP_URL || "https://planner.hakimgroup.co.uk";

	// Test mode: override recipient emails (for testing only)
	const testEmailOverride = req.body?.testEmailOverride as string | undefined;
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
				const finalRecipients = testEmailOverride ? [testEmailOverride] : recipientEmails;

				const { error: sendError } = await resend.emails.send({
					from: "QPlanner <noreply@planner.hakimgroup.io>",
					to: finalRecipients,
					subject: testEmailOverride ? `[TEST] ${emailSubject}` : emailSubject,
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

app.use("/", (req, res) => {
	res.send("Server is running.");
});

//Serve

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
