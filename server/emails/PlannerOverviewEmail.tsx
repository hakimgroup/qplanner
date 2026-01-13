import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
	Tailwind,
	Hr,
} from "@react-email/components";
import { format } from "date-fns";
import * as React from "react";

// Category colors matching the client
const categoryColors: Record<string, { bg: string; text: string }> = {
	event: { bg: "#f3e8ff", text: "#7b2eda" },
	"brand activation": { bg: "#ffece8", text: "#ff6348" },
	campaign: { bg: "#e8f4ff", text: "#1e90ff" },
	evergreen: { bg: "#e8fff0", text: "#10ac84" },
	bespoke: { bg: "#ffe8f3", text: "#f01879" },
};

const getCategoryStyle = (category: string) => {
	const key = category.toLowerCase();
	return categoryColors[key] || categoryColors.campaign;
};

interface SelectionItem {
	campaign_name: string;
	campaign_category: string;
	from_date: string;
	to_date: string;
	status: string;
}

interface PlannerOverviewEmailProps {
	firstName: string;
	practiceName: string;
	practiceId: string;
	selections: SelectionItem[];
	appUrl: string;
}

// Helper to capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const MAX_VISIBLE_CAMPAIGNS = 3;

export const PlannerOverviewEmail = ({
	firstName,
	practiceName,
	practiceId,
	selections,
	appUrl,
}: PlannerOverviewEmailProps) => {
	const planUrl = `${appUrl}/dashboard?practice=${practiceId}&tab=selected`;
	const visibleSelections = selections.slice(0, MAX_VISIBLE_CAMPAIGNS);
	const remainingCount = selections.length - MAX_VISIBLE_CAMPAIGNS;

	return (
		<Html>
			<Head />
			<Preview>
				HG Marketing Planner: your 2026 planned activity + next steps
			</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								brand: "#7b2eda",
								offwhite: "#faf8fd",
								brandRed: "#f01879",
							},
							spacing: {
								0: "0px",
								20: "20px",
								45: "45px",
							},
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
						<Heading className="text-center my-0 leading-8">
							HG Marketing Planner
						</Heading>

						<Section>
							<Text className="text-base">
								Hi {firstName},
							</Text>

							<Text className="text-base">
								Thank you for submitting your 2026 HG Marketing Planner. This is the first of our planner email notifications, sharing a clear overview of the activity you've selected for the year ahead for your practice. If you'd like to make any tweaks, add new campaigns, or update timings, use the button at the bottom of this email to jump straight into your planner.
							</Text>
						</Section>

						<Hr style={hr} />

						<Section>
							<Heading as="h3" style={sectionHeading}>
								Your 2026 planned activity overview
							</Heading>

							<Text className="text-base">
								Please find below your current planned activity for{" "}
								<Link className="text-brand font-bold">
									{practiceName}
								</Link>
								. This is sent per practice, so everyone linked to that practice will see the same overview.
							</Text>
						</Section>

						{selections.length > 0 ? (
							<>
								<ul style={{ padding: 0, listStyle: "none" }}>
									{visibleSelections.map((selection, i) => (
										<li key={i} style={listItem}>
											<strong style={{ fontSize: "15px", display: "block" }}>
												{selection.campaign_name}
											</strong>
											<Text style={{
												...categoryBadge,
												backgroundColor: getCategoryStyle(selection.campaign_category).bg,
												color: getCategoryStyle(selection.campaign_category).text,
											}}>
												{capitalize(selection.campaign_category)}
											</Text>
											<Text style={{ marginTop: "8px", marginBottom: "0" }}>
												<Link className="text-brand">
													{format(new Date(selection.from_date), "MMM d")}
												</Link>
												{" - "}
												<Link className="text-brand">
													{format(new Date(selection.to_date), "MMM d, yyyy")}
												</Link>
											</Text>
										</li>
									))}
								</ul>
								{remainingCount > 0 && (
									<div style={moreItemsBox}>
										<Text style={moreItemsText}>
											+{remainingCount} more campaign{remainingCount !== 1 ? "s" : ""} in your planner
										</Text>
									</div>
								)}
							</>
						) : (
							<Text style={noSelectionsText}>
								No campaigns have been planned yet. Use the button below to get started!
							</Text>
						)}

						<Text style={summaryText}>
							<strong>{selections.length} campaign{selections.length !== 1 ? "s" : ""}</strong> planned for {practiceName}
						</Text>

						<Hr style={hr} />

						<Section>
							<Heading as="h3" style={sectionHeading}>
								What happens next
							</Heading>

							<ul style={bulletList}>
								<li style={bulletItem}>
									<strong>Email notifications:</strong> You'll receive an email when activity is added, updated, or removed, plus key status updates as work progresses (e.g. artwork ready, revisions needed, approved/sent).
								</li>
								<li style={bulletItem}>
									<strong>Content/asset request forms:</strong> We'll email short forms for upcoming activity so you can choose the assets you need (posters, social, email, etc.) and share any details. We'll start with items coming up in Q1, then continue on a rolling basis aligned to campaign dates.
								</li>
								<li style={bulletItem}>
									<strong>Artwork + approvals:</strong> Once forms are submitted, we'll move items into production and send "ready to review" links for sign-off, with reminders to keep everything on track.
								</li>
							</ul>
						</Section>

						<Hr style={hr} />

						<Section>
							<Heading as="h3" style={sectionHeading}>
								How to make changes
							</Heading>

							<Text style={paragraph}>
								You can update your planner at any time (add/edit/remove campaigns). If you need something bespoke, select the bespoke option in the form and we'll guide you from there.
							</Text>
						</Section>

						<Hr style={hr} />

						<Section>
							<Heading as="h3" style={sectionHeading}>
								What we need from you
							</Heading>

							<ol style={numberedList}>
								<li style={numberedItem}>Review your overview</li>
								<li style={numberedItem}>Complete any content forms when they land</li>
								<li style={numberedItem}>Keep updates in the planner so everything stays visible and tracked</li>
							</ol>
						</Section>

						<Section className="text-center">
							<Button
								href={planUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								Open Your Planner
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={paragraph}>
								If anything looks off or you've got questions, drop us a message at{" "}
								<Link href="mailto:marketing@hakimgroup.co.uk" className="text-brand">
									marketing@hakimgroup.co.uk
								</Link>{" "}
								or contact your marketing executive directly.
							</Text>
						</Section>

						<Text style={signOff}>
							Best regards,
							<br />
							<strong>HG Marketing</strong>
						</Text>
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

export default PlannerOverviewEmail;

const logoContainer = {
	textAlign: "center" as const,
	padding: "40px 0 20px 0",
};

const logoBox = {
	display: "inline-block",
	borderRadius: "10px",
	background: "linear-gradient(130deg, rgba(114, 100, 233, 1) 11%, rgba(214, 76, 168, 1) 85%)",
	backgroundColor: "#7264e9",
	textAlign: "center" as const,
	padding: "14px",
};

const logoImg = {
	display: "block",
	margin: "0 auto",
};

const sectionHeading = {
	fontSize: "18px",
	fontWeight: 600,
	color: "#1a1a1a",
	marginBottom: "12px",
	marginTop: "0",
};

const listItem = {
	padding: "12px 14px",
	borderRadius: "6px",
	backgroundColor: "#f7f2fd",
	marginBottom: "12px",
	borderLeft: "4px solid #7b2eda",
};

const categoryBadge = {
	display: "inline-block",
	fontSize: "11px",
	fontWeight: 600,
	color: "#7b2eda",
	backgroundColor: "#ede9fe",
	padding: "4px 10px",
	borderRadius: "12px",
	marginTop: "10px",
	marginBottom: "0",
	textTransform: "uppercase" as const,
	letterSpacing: "0.5px",
};

const moreItemsBox = {
	textAlign: "center" as const,
	padding: "16px 20px",
	backgroundColor: "#f7f2fd",
	borderRadius: "8px",
	border: "2px dashed #d4c4f0",
	marginTop: "4px",
};

const moreItemsText = {
	margin: "0",
	fontSize: "14px",
	fontWeight: 600,
	color: "#7b2eda",
};

const summaryText = {
	fontSize: "16px",
	textAlign: "center" as const,
	color: "#484848",
	marginTop: "24px",
};

const noSelectionsText = {
	fontSize: "15px",
	color: "#666",
	textAlign: "center" as const,
	padding: "20px",
	backgroundColor: "#f7f2fd",
	borderRadius: "6px",
};

const paragraph = {
	fontSize: "15px",
	lineHeight: "1.5",
	color: "#484848",
};

const bulletList = {
	paddingLeft: "20px",
	margin: "16px 0",
};

const bulletItem = {
	fontSize: "15px",
	lineHeight: "1.6",
	color: "#484848",
	marginBottom: "12px",
};

const numberedList = {
	paddingLeft: "20px",
	margin: "16px 0",
};

const numberedItem = {
	fontSize: "15px",
	lineHeight: "1.6",
	color: "#484848",
	marginBottom: "8px",
};

const signOff = {
	fontSize: "15px",
	lineHeight: "1.5",
	color: "#484848",
	marginTop: "24px",
};

const hr = {
	borderColor: "#e5d5f8",
	margin: "30px 0",
};
