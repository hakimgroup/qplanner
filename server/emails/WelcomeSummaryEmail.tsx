import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
	Tailwind,
	Hr,
} from "@react-email/components";
import { format } from "date-fns";
import * as React from "react";

interface SelectionItem {
	campaign_name: string;
	campaign_category: string;
	from_date: string;
	to_date: string;
	status: string;
}

interface WelcomeSummaryEmailProps {
	practiceName: string;
	practiceId: string;
	selections: SelectionItem[];
	appUrl: string;
}

export const WelcomeSummaryEmail = ({
	practiceName,
	practiceId,
	selections,
	appUrl,
}: WelcomeSummaryEmailProps) => {
	const planUrl = `${appUrl}/dashboard?practice=${practiceId}`;

	return (
		<Html>
			<Head />
			<Preview>
				Your marketing plan for {practiceName} is ready!
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
							<Text style={logoText}>HG</Text>
						</div>
					</Section>
					<Container className="bg-white p-45">
						<Heading className="text-center my-0 leading-8">
							Your Plan is Ready!
						</Heading>

						<Section>
							<Text className="text-base">
								Great news! Your team has started planning marketing
								campaigns for{" "}
								<Link className="text-brand font-bold">
									{practiceName}
								</Link>
								.
							</Text>

							<Text className="text-base">
								Here's a summary of what's currently on your plan:
							</Text>
						</Section>

						<ul style={{ padding: 0, listStyle: "none" }}>
							{selections.map((selection, i) => (
								<li key={i} style={listItem}>
									<strong style={{ fontSize: "15px" }}>
										{selection.campaign_name}
									</strong>
									<Text style={categoryBadge}>
										{selection.campaign_category}
									</Text>
									<Text style={{ marginTop: "4px", marginBottom: "0" }}>
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

						<Text style={summaryText}>
							<strong>{selections.length} campaign{selections.length !== 1 ? "s" : ""}</strong> planned
						</Text>

						<Section className="text-center">
							<Button
								href={planUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								View Your Plan
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={paragraph}>
								<strong>What happens next?</strong>
							</Text>
							<Text style={paragraph}>
								From now on, you'll receive notifications for any changes
								to this plan. When you're ready, you can request marketing
								assets through the planner.
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

export default WelcomeSummaryEmail;

const logoContainer = {
	textAlign: "center" as const,
	padding: "40px 0 20px 0",
};

const logoBox = {
	display: "inline-block",
	width: "64px",
	height: "64px",
	borderRadius: "10px",
	background: "linear-gradient(130deg, rgba(114, 100, 233, 1) 11%, rgba(214, 76, 168, 1) 85%)",
	backgroundColor: "#7264e9", // Fallback for email clients that don't support gradients
	textAlign: "center" as const,
	lineHeight: "64px",
};

const logoText = {
	color: "#ffffff",
	fontSize: "24px",
	fontWeight: 700,
	margin: 0,
	lineHeight: "64px",
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
	fontSize: "12px",
	color: "#666",
	marginTop: "4px",
	marginBottom: "0",
};

const summaryText = {
	fontSize: "16px",
	textAlign: "center" as const,
	color: "#484848",
	marginTop: "24px",
};

const paragraph = {
	fontSize: "15px",
	lineHeight: "1.5",
	color: "#484848",
};

const hr = {
	borderColor: "#e5d5f8",
	margin: "30px 0",
};
