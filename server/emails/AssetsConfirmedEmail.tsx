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

interface AssetsConfirmedEmailProps {
	practiceName: string;
	practiceId: string;
	campaignName: string;
	campaignCategory: string;
	fromDate: string;
	toDate: string;
	chosenCreative?: string | null;
	note?: string | null;
	appUrl: string;
	selectionId: string;
}

export const AssetsConfirmedEmail = ({
	practiceName,
	practiceId,
	campaignName,
	campaignCategory,
	fromDate,
	toDate,
	chosenCreative,
	note,
	appUrl,
	selectionId,
}: AssetsConfirmedEmailProps) => {
	const reviewUrl = `${appUrl}/admin/plans?selection=${selectionId}`;

	return (
		<Html>
			<Head />
			<Preview>
				{practiceName} confirmed assets for {campaignName}
			</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								brand: "#7b2eda",
								offwhite: "#faf8fd",
								brandRed: "#f01879",
								blue: "#1e90ff",
								teal: "#14b8a6",
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
							<span style={badge}>Assets Confirmed</span>
						</Section>

						<Heading className="text-center my-0 leading-8">
							Practice Approved Assets
						</Heading>

						<Section>
							<Text className="text-base">
								<Link className="text-brand font-bold">{practiceName}</Link> has
								confirmed and approved the assets for the following campaign:
							</Text>
						</Section>

						<Section style={campaignBox}>
							<Text style={campaignName_style}>{campaignName}</Text>
							<Text style={categoryBadge}>{campaignCategory}</Text>
							<Text style={dateRange}>
								{format(new Date(fromDate), "MMM d")} - {format(new Date(toDate), "MMM d, yyyy")}
							</Text>
						</Section>

						{chosenCreative && (
							<Section style={selectionBox}>
								<Text style={selectionLabel}>Confirmed Creative</Text>
								<Text style={selectionValue}>{chosenCreative}</Text>
							</Section>
						)}

						{note && (
							<Section style={noteBox}>
								<Text style={noteLabel}>Note from practice:</Text>
								<Text style={noteText}>{note}</Text>
							</Section>
						)}

						<Section style={successBox}>
							<Text style={successIcon}>&#10003;</Text>
							<Text style={successTitle}>Ready to Go Live</Text>
							<Text style={successText}>
								The practice has reviewed and approved the artwork. You can now proceed with the campaign.
							</Text>
						</Section>

						<Section className="text-center">
							<Button
								href={reviewUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								View in Planner
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={paragraph}>
								The campaign is now confirmed and ready to move to the next stage.
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

export default AssetsConfirmedEmail;

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
	backgroundColor: "#d1fae5",
	color: "#059669",
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
	borderLeft: "4px solid #7b2eda",
};

const campaignName_style = {
	fontSize: "18px",
	fontWeight: "600" as const,
	color: "#333",
	margin: "0 0 8px 0",
};

const categoryBadge = {
	display: "inline-block",
	backgroundColor: "#e5d5f8",
	color: "#7b2eda",
	padding: "4px 10px",
	borderRadius: "12px",
	fontSize: "12px",
	fontWeight: "500" as const,
	margin: "0 0 8px 0",
};

const dateRange = {
	fontSize: "14px",
	color: "#666",
	margin: "0",
};

const selectionBox = {
	backgroundColor: "#f0fff0",
	border: "1px solid #90ee90",
	borderRadius: "8px",
	padding: "16px",
	margin: "20px 0",
	textAlign: "center" as const,
};

const selectionLabel = {
	fontSize: "12px",
	fontWeight: "600" as const,
	color: "#228b22",
	margin: "0 0 8px 0",
	textTransform: "uppercase" as const,
};

const selectionValue = {
	fontSize: "16px",
	fontWeight: "500" as const,
	color: "#333",
	margin: "0",
};

const noteBox = {
	backgroundColor: "#faf8fd",
	border: "1px solid #e5d5f8",
	borderRadius: "8px",
	padding: "16px",
	margin: "20px 0",
};

const noteLabel = {
	fontSize: "12px",
	fontWeight: "600" as const,
	color: "#7b2eda",
	margin: "0 0 8px 0",
	textTransform: "uppercase" as const,
};

const noteText = {
	fontSize: "14px",
	color: "#484848",
	margin: "0",
	fontStyle: "italic" as const,
};

const successBox = {
	backgroundColor: "#ecfdf5",
	border: "1px solid #6ee7b7",
	borderRadius: "12px",
	padding: "24px",
	margin: "24px 0",
	textAlign: "center" as const,
};

const successIcon = {
	fontSize: "32px",
	color: "#059669",
	margin: "0 0 8px 0",
};

const successTitle = {
	fontSize: "16px",
	fontWeight: "600" as const,
	color: "#059669",
	margin: "0 0 8px 0",
};

const successText = {
	fontSize: "14px",
	color: "#065f46",
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
