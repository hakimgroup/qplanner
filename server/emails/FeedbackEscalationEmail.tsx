import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Preview,
	Section,
	Text,
	Tailwind,
	Hr,
} from "@react-email/components";
import * as React from "react";
import { format, parseISO } from "date-fns";

interface FeedbackEscalationEmailProps {
	practiceName: string;
	campaignName: string;
	markupOpenedAt: string;
	reminderSentAt: string;
	appUrl: string;
	selectionId: string;
}

export const FeedbackEscalationEmail = ({
	practiceName,
	campaignName,
	markupOpenedAt,
	reminderSentAt,
	appUrl,
	selectionId,
}: FeedbackEscalationEmailProps) => {
	const fmt = (s: string) => {
		try {
			return format(parseISO(s), "d MMM yyyy");
		} catch {
			return s;
		}
	};

	const planUrl = `${appUrl}/admin/plans?selectionId=${selectionId}`;

	return (
		<Html>
			<Head />
			<Preview>
				{practiceName} hasn't responded on {campaignName} after the reminder
			</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								brand: "#7b2eda",
								offwhite: "#faf8fd",
							},
							spacing: { 0: "0px", 20: "20px", 45: "45px" },
						},
					},
				} as any}
			>
				<Body className="bg-offwhite text-base font-sans">
					<Section style={logoContainer}>
						<div style={logoBox}>
							<Img
								src="https://i.postimg.cc/0Q5wP963/hg-icon-white-rgb.png"
								alt="HG"
								width="36"
								height="36"
								style={logoImg}
							/>
						</div>
					</Section>

					<Container className="bg-white p-45">
						<Section style={badgeContainer}>
							<span style={badge}>Stuck campaign</span>
						</Section>

						<Heading className="text-center my-0 leading-8" style={{ color: "#7b2eda" }}>
							Practice unresponsive on artwork approval
						</Heading>

						<Section>
							<Text style={paragraph}>
								<strong>{practiceName}</strong> reviewed the markup
								for <strong>{campaignName}</strong> but hasn't
								confirmed or requested changes. We sent them a
								reminder email a week ago and they still haven't
								acted.
							</Text>
						</Section>

						<Section style={detailsBox}>
							<Text style={detailRow}>
								<span style={detailLabel}>Practice</span>
								<br />
								<strong>{practiceName}</strong>
							</Text>
							<Text style={detailRow}>
								<span style={detailLabel}>Campaign</span>
								<br />
								<strong>{campaignName}</strong>
							</Text>
							<Text style={detailRow}>
								<span style={detailLabel}>Reviewed markup</span>
								<br />
								{fmt(markupOpenedAt)}
							</Text>
							<Text style={detailRow}>
								<span style={detailLabel}>Reminder sent</span>
								<br />
								{fmt(reminderSentAt)}
							</Text>
						</Section>

						<Section>
							<Text style={paragraph}>
								Worth a quick personal follow-up — either pick up
								the phone or check whether their feedback on the
								markup file just needs to be acted on by the design
								team.
							</Text>
						</Section>

						<Section className="text-center">
							<Button
								href={planUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								Open in planner
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={footerNote}>
								You're getting this because you're an admin on the
								{" "}{practiceName} practice. Future reminders for
								this selection won't be sent — this is the only
								escalation.
							</Text>
						</Section>
					</Container>

					<Container className="mt-20">
						<Text className="text-center text-gray-400 mb-45">
							Unit 317, India Mill Business Centre, Bolton Rd, Darwen BB3 1AE
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default FeedbackEscalationEmail;

const logoContainer = { textAlign: "center" as const, padding: "40px 0 20px 0" };
const logoBox = {
	display: "inline-block",
	borderRadius: "10px",
	background:
		"linear-gradient(130deg, rgba(114, 100, 233, 1) 11%, rgba(214, 76, 168, 1) 85%)",
	backgroundColor: "#7264e9",
	textAlign: "center" as const,
	padding: "14px",
};
const logoImg = { display: "block", margin: "0 auto" };
const badgeContainer = { textAlign: "center" as const, marginBottom: "16px" };
const badge = {
	display: "inline-block",
	backgroundColor: "#fef3c7",
	color: "#b45309",
	padding: "6px 12px",
	borderRadius: "16px",
	fontSize: "12px",
	fontWeight: "600" as const,
	textTransform: "uppercase" as const,
};
const paragraph = {
	fontSize: "14px",
	lineHeight: "1.6",
	color: "#374151",
	margin: "20px 0 12px 0",
};
const detailsBox = {
	backgroundColor: "#faf8fd",
	border: "1px solid #e5d5f8",
	borderRadius: "8px",
	padding: "16px 20px",
	margin: "20px 0",
};
const detailRow = {
	fontSize: "13px",
	color: "#1f2937",
	margin: "6px 0",
	lineHeight: "1.5",
};
const detailLabel = {
	fontSize: "10px",
	color: "#7b2eda",
	fontWeight: 700,
	textTransform: "uppercase" as const,
	letterSpacing: "0.6px",
};
const footerNote = {
	fontSize: "12px",
	color: "#9ca3af",
	textAlign: "center" as const,
	margin: "0",
	lineHeight: "1.5",
};
const hr = { borderColor: "#e5d5f8", margin: "30px 0" };
