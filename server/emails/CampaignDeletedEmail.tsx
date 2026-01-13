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
import * as React from "react";

interface CampaignDeletedEmailProps {
	userName: string;
	practiceName: string;
	practiceId: string;
	campaignName: string;
	campaignCategory?: string;
	isBespoke?: boolean;
	appUrl: string;
}

export const CampaignDeletedEmail = ({
	userName,
	practiceName,
	practiceId,
	campaignName,
	campaignCategory = "Campaign",
	isBespoke = false,
	appUrl,
}: CampaignDeletedEmailProps) => {
	const planUrl = `${appUrl}/dashboard?practice=${practiceId}&tab=selected`;

	return (
		<Html>
			<Head />
			<Preview>
				Campaign removed: {campaignName} from {practiceName}
			</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								brand: "#7b2eda",
								offwhite: "#faf8fd",
								red: "#e74c3c",
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
							<span style={badge}>Campaign Removed</span>
						</Section>

						<Heading className="text-center my-0 leading-8">
							Campaign Removed from Plan
						</Heading>

						<Section>
							<Text className="text-base">
								Hi {userName || "there"},
							</Text>
							<Text className="text-base">
								You've removed a {isBespoke ? "bespoke " : ""}campaign from the marketing plan for{" "}
								<Link className="text-brand font-bold">{practiceName}</Link>.
							</Text>
						</Section>

						<Section style={campaignBox}>
							<Text style={campaignName_style}>{campaignName}</Text>
							<div style={badgeRow}>
								<span style={categoryBadge}>{campaignCategory}</span>
								{isBespoke && <span style={bespokeBadge}>Bespoke</span>}
							</div>
							<Text style={removedText}>This campaign is no longer on the plan</Text>
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
								This email confirms the campaign has been removed from the plan.
								If this was a mistake, you can add it back from the campaign catalog.
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

export default CampaignDeletedEmail;

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
	backgroundColor: "#ffe6e6",
	color: "#e74c3c",
	padding: "6px 12px",
	borderRadius: "16px",
	fontSize: "12px",
	fontWeight: "600" as const,
	textTransform: "uppercase" as const,
};

const campaignBox = {
	backgroundColor: "#fef5f5",
	borderRadius: "8px",
	padding: "20px",
	textAlign: "center" as const,
	margin: "24px 0",
	borderLeft: "4px solid #e74c3c",
};

const campaignName_style = {
	fontSize: "18px",
	fontWeight: "600" as const,
	color: "#333",
	margin: "0 0 8px 0",
	textDecoration: "line-through",
	opacity: 0.7,
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
	opacity: 0.7,
};

const bespokeBadge = {
	display: "inline-block",
	backgroundColor: "#fff3e6",
	color: "#ff7f50",
	padding: "4px 10px",
	borderRadius: "12px",
	fontSize: "12px",
	fontWeight: "500" as const,
	opacity: 0.7,
};

const removedText = {
	fontSize: "13px",
	color: "#e74c3c",
	margin: "8px 0 0 0",
	fontStyle: "italic" as const,
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
