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

interface CampaignAddedEmailProps {
	userName: string;
	practiceName: string;
	practiceId: string;
	campaignName: string;
	campaignCategory?: string;
	fromDate: string;
	toDate: string;
	isBespoke?: boolean;
	appUrl: string;
}

export const CampaignAddedEmail = ({
	userName,
	practiceName,
	practiceId,
	campaignName,
	campaignCategory = "Campaign",
	fromDate,
	toDate,
	isBespoke = false,
	appUrl,
}: CampaignAddedEmailProps) => {
	const planUrl = `${appUrl}/dashboard?practice=${practiceId}&tab=selected`;

	return (
		<Html>
			<Head />
			<Preview>
				Campaign added: {campaignName} for {practiceName}
			</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								brand: "#7b2eda",
								offwhite: "#faf8fd",
								green: "#10ac84",
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
						<Section style={badgeContainer}>
							<span style={badge}>Campaign Added</span>
						</Section>

						<Heading className="text-center my-0 leading-8">
							{isBespoke ? "Bespoke Campaign Created" : "Campaign Added to Plan"}
						</Heading>

						<Section>
							<Text className="text-base">
								Hi {userName || "there"},
							</Text>
							<Text className="text-base">
								You've successfully added a {isBespoke ? "bespoke " : ""}campaign to the marketing plan for{" "}
								<Link className="text-brand font-bold">{practiceName}</Link>.
							</Text>
						</Section>

						<Section style={campaignBox}>
							<Text style={campaignName_style}>{campaignName}</Text>
							<div style={badgeRow}>
								<span style={categoryBadge}>{campaignCategory}</span>
								{isBespoke && <span style={bespokeBadge}>Bespoke</span>}
							</div>
							<Text style={dateRange}>
								{format(new Date(fromDate), "MMM d")} - {format(new Date(toDate), "MMM d, yyyy")}
							</Text>
						</Section>

						<Section className="text-center">
							<Button
								href={planUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								View Plan
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={paragraph}>
								This email confirms your action. You can view and manage this campaign
								in the planner at any time.
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

export default CampaignAddedEmail;

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

const badgeContainer = {
	textAlign: "center" as const,
	marginBottom: "16px",
};

const badge = {
	display: "inline-block",
	backgroundColor: "#e6fff5",
	color: "#10ac84",
	padding: "6px 12px",
	borderRadius: "16px",
	fontSize: "12px",
	fontWeight: "600" as const,
	textTransform: "uppercase" as const,
};

const campaignBox = {
	backgroundColor: "#f7f2fd",
	borderRadius: "8px",
	padding: "20px",
	textAlign: "center" as const,
	margin: "24px 0",
	borderLeft: "4px solid #10ac84",
};

const campaignName_style = {
	fontSize: "18px",
	fontWeight: "600" as const,
	color: "#333",
	margin: "0 0 8px 0",
};

const badgeRow = {
	marginBottom: "8px",
};

const categoryBadge = {
	display: "inline-block",
	backgroundColor: "#e5d5f8",
	color: "#7b2eda",
	padding: "4px 10px",
	borderRadius: "12px",
	fontSize: "12px",
	fontWeight: "500" as const,
	marginRight: "8px",
};

const bespokeBadge = {
	display: "inline-block",
	backgroundColor: "#fff3e6",
	color: "#ff7f50",
	padding: "4px 10px",
	borderRadius: "12px",
	fontSize: "12px",
	fontWeight: "500" as const,
};

const dateRange = {
	fontSize: "14px",
	color: "#666",
	margin: "0",
};

const paragraph = {
	fontSize: "14px",
	lineHeight: "1.5",
	color: "#666",
	textAlign: "center" as const,
};

const hr = {
	borderColor: "#e5d5f8",
	margin: "30px 0",
};
