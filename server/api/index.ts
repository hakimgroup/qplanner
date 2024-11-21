import express, { Express, Request, NextFunction, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Resend } from "resend";
// import { EmailBody } from "./models";

interface EmailBody {
	to: string;
	subject: string;
	html: string;
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

app.use("/", (req, res) => {
	res.send("Server is running.");
});

//Serve

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
