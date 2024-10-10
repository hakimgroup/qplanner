import express, { Express, Request, NextFunction, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Mail from "nodemailer/lib/mailer";
import cors from "cors";
// import { EmailBody } from "./models";

interface EmailBody {
	from: string;
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
const from = process.env.FROM_EMAIL;
const pass = process.env.RESEND_API_KEY;

function sendMail({ to, subject, html }: EmailBody) {
	return new Promise((resolve, reject) => {
		const transporter = nodemailer.createTransport({
			host: "smtp.resend.com",
			port: 465,
			auth: {
				user: "resend",
				pass,
			},
		});

		const mail_configs: Mail.Options = {
			from,
			to,
			subject,
			html,
		};

		transporter.sendMail(mail_configs, function (error, info) {
			if (error) {
				console.log(error);
				return reject({ message: `An error has occured` });
			}

			return resolve({ message: `Email sent successfully` });
		});
	});
}

app.post("/send_email", (req: Request, res: Response) => {
	sendMail(req.body)
		.then(({ message }: any) => res.send(message))
		.catch((error) => res.status(500).send(error.message));
});

//Serve

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
