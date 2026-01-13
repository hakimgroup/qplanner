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

interface CampaignItem {
	selectionId: string;
	campaignName: string;
	campaignCategory: string;
	fromDate: string;
	toDate: string;
}

interface AssetsRequestedBulkEmailProps {
	practiceName: string;
	practiceId: string;
	campaigns: CampaignItem[];
	appUrl: string;
}

export const AssetsRequestedBulkEmail = ({
	practiceName,
	practiceId,
	campaigns,
	appUrl,
}: AssetsRequestedBulkEmailProps) => {
	const respondUrl = `${appUrl}/notifications-center`;

	return (
		<Html>
			<Head />
			<Preview>
				{`Action Required: ${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''} need your input`}
			</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								brand: "#7b2eda",
								offwhite: "#faf8fd",
								brandRed: "#f01879",
								orange: "#ff7f50",
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
							<span style={badge}>Action Required</span>
						</Section>

						<Heading className="text-center my-0 leading-8">
							Multiple Campaigns Need Your Input
						</Heading>

						<Section>
							<Text className="text-base">
								The marketing team has requested your input for{" "}
								<strong>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</strong>{" "}
								at <Link className="text-brand font-bold">{practiceName}</Link>.
							</Text>
							<Text className="text-base">
								Please review each campaign and select your preferred creatives and asset quantities.
							</Text>
						</Section>

						<Section>
							<Text style={sectionTitle}>Campaigns Requiring Action</Text>
							<ul style={{ padding: 0, listStyle: "none", margin: "16px 0" }}>
								{campaigns.map((campaign, index) => (
									<li key={index} style={campaignItem}>
										<Text style={campaignItemName}>{campaign.campaignName}</Text>
										<div style={campaignItemMeta}>
											<span style={categoryBadge}>{campaign.campaignCategory}</span>
											<span style={dateText}>
												{format(new Date(campaign.fromDate), "MMM d")} - {format(new Date(campaign.toDate), "MMM d")}
											</span>
										</div>
									</li>
								))}
							</ul>
						</Section>

						<Section style={summaryBox}>
							<Text style={summaryText}>
								<strong>{campaigns.length}</strong> campaign{campaigns.length !== 1 ? 's' : ''} awaiting your response
							</Text>
						</Section>

						<Section className="text-center">
							<Button
								href={respondUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								Respond to All
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={paragraph}>
								Please respond at your earliest convenience so the marketing team
								can proceed with production for all campaigns.
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

export default AssetsRequestedBulkEmail;

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
	backgroundColor: "#fff3e6",
	color: "#ff7f50",
	padding: "6px 12px",
	borderRadius: "16px",
	fontSize: "12px",
	fontWeight: "600" as const,
	textTransform: "uppercase" as const,
};

const sectionTitle = {
	fontSize: "14px",
	fontWeight: "600" as const,
	color: "#333",
	marginBottom: "8px",
	textTransform: "uppercase" as const,
	letterSpacing: "0.5px",
};

const campaignItem = {
	backgroundColor: "#f7f2fd",
	borderRadius: "8px",
	padding: "16px",
	marginBottom: "12px",
	borderLeft: "4px solid #7b2eda",
};

const campaignItemName = {
	fontSize: "16px",
	fontWeight: "600" as const,
	color: "#333",
	margin: "0 0 8px 0",
};

const campaignItemMeta = {
	display: "flex",
	alignItems: "center",
	gap: "12px",
};

const categoryBadge = {
	display: "inline-block",
	backgroundColor: "#e5d5f8",
	color: "#7b2eda",
	padding: "4px 10px",
	borderRadius: "12px",
	fontSize: "11px",
	fontWeight: "500" as const,
};

const dateText = {
	fontSize: "13px",
	color: "#666",
};

const summaryBox = {
	backgroundColor: "#fff3e6",
	borderRadius: "8px",
	padding: "16px",
	textAlign: "center" as const,
	margin: "24px 0",
};

const summaryText = {
	fontSize: "15px",
	color: "#ff7f50",
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
