import express, { Express, Request, NextFunction, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
interface EmailBody {
	to: string;
	subject: string;
	html: string;
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
app.use(express.urlencoded({ limit: "25mb" }));
app.use((_req: Request, res: Response, next: NextFunction) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});

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

app.use("/", (req, res) => {
	res.send("Server is running.");
});

//Serve

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
