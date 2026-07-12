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

interface FeedbackReminderEmailProps {
	practiceName: string;
	campaignName: string;
	markupOpenedAt: string;
	approveUrl: string;
	reviseUrl: string;
	markupUrl: string;
}

export const FeedbackReminderEmail = ({
	practiceName,
	campaignName,
	markupOpenedAt,
	approveUrl,
	reviseUrl,
	markupUrl,
}: FeedbackReminderEmailProps) => {
	let reviewedPhrase = "a few days ago";
	try {
		reviewedPhrase = `on ${format(parseISO(markupOpenedAt), "EEEE d MMM")}`;
	} catch {
		// fallback above
	}

	return (
		<Html>
			<Head />
			<Preview>
				Quick yes/no on the {campaignName} artwork
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
							<span style={badge}>Quick check-in</span>
						</Section>

						<Heading className="text-center my-0 leading-8">
							What did you think of the {campaignName} artwork?
						</Heading>

						<Section>
							<Text style={paragraph}>
								Hi {practiceName} team — you reviewed the review
								document for <strong>{campaignName}</strong>{" "}
								{reviewedPhrase}. We
								noticed the campaign hasn't been moved on yet, so a
								gentle nudge:
							</Text>
						</Section>

						<Section style={questionBox}>
							<Text style={questionText}>
								Did you leave changes on the review document, or are
								you happy with it as-is?
							</Text>
						</Section>

						{/* Primary actions */}
						<Section style={buttonContainer}>
							<table style={{ width: "100%", borderSpacing: 0 }}>
								<tr>
									<td style={{ paddingRight: 6 }}>
										<Button
											href={approveUrl}
											style={primaryButton}
										>
											✓&nbsp; Looks good — approve
										</Button>
									</td>
								</tr>
								<tr>
									<td style={{ paddingTop: 8 }}>
										<Button
											href={reviseUrl}
											style={secondaryButton}
										>
											✎&nbsp; I've left changes on the review document
										</Button>
									</td>
								</tr>
							</table>
						</Section>

						<Section style={helperContainer}>
							<Text style={helperText}>
								One click. No need to log back into the planner.
							</Text>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={paragraph}>
								If you'd like to take another look at the review
								document first:
							</Text>
							<table style={{ width: "100%" }}>
								<tr>
									<td>
										<Button
											href={markupUrl}
											style={tertiaryButton}
										>
											Open review document again
										</Button>
									</td>
								</tr>
							</table>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={footerNote}>
								This link works for 14 days. After that you can
								still act on the campaign from the planner. Reply to
								this email if anything's unclear.
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

export default FeedbackReminderEmail;

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
	backgroundColor: "#ede9fe",
	color: "#7b2eda",
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
const questionBox = {
	backgroundColor: "#faf8fd",
	border: "1px solid #e5d5f8",
	borderLeft: "4px solid #7b2eda",
	borderRadius: "8px",
	padding: "16px 20px",
	margin: "20px 0",
};
const questionText = {
	fontSize: "15px",
	fontWeight: "600" as const,
	color: "#1f2937",
	margin: "0",
	lineHeight: "1.5",
};
const buttonContainer = { margin: "24px 0 6px 0" };
const primaryButton = {
	display: "inline-block",
	width: "100%",
	textAlign: "center" as const,
	backgroundColor: "#0f9466",
	color: "#ffffff",
	padding: "12px 18px",
	borderRadius: "8px",
	fontSize: "14px",
	fontWeight: "600" as const,
	textDecoration: "none",
	boxSizing: "border-box" as const,
};
const secondaryButton = {
	display: "inline-block",
	width: "100%",
	textAlign: "center" as const,
	backgroundColor: "#f59e0b",
	color: "#ffffff",
	padding: "12px 18px",
	borderRadius: "8px",
	fontSize: "14px",
	fontWeight: "600" as const,
	textDecoration: "none",
	boxSizing: "border-box" as const,
};
const tertiaryButton = {
	display: "inline-block",
	width: "100%",
	textAlign: "center" as const,
	backgroundColor: "transparent",
	color: "#7b2eda",
	padding: "10px 18px",
	borderRadius: "8px",
	fontSize: "13px",
	fontWeight: "600" as const,
	textDecoration: "none",
	border: "1px solid #e5d5f8",
	boxSizing: "border-box" as const,
};
const helperContainer = { textAlign: "center" as const, margin: "0 0 8px 0" };
const helperText = { fontSize: "11px", color: "#9ca3af", margin: "0" };
const footerNote = {
	fontSize: "12px",
	color: "#9ca3af",
	textAlign: "center" as const,
	margin: "8px 0 0 0",
	lineHeight: "1.5",
};
const hr = { borderColor: "#e5d5f8", margin: "24px 0" };
