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

interface FeedbackRequestedEmailProps {
	practiceName: string;
	practiceId: string;
	campaignName: string;
	campaignCategory: string;
	fromDate: string;
	toDate: string;
	feedback: string;
	appUrl: string;
	selectionId: string;
}

export const FeedbackRequestedEmail = ({
	practiceName,
	practiceId,
	campaignName,
	campaignCategory,
	fromDate,
	toDate,
	feedback,
	appUrl,
	selectionId,
}: FeedbackRequestedEmailProps) => {
	const reviewUrl = `${appUrl}/admin/plans?selection=${selectionId}`;

	return (
		<Html>
			<Head />
			<Preview>
				{practiceName} requested changes for {campaignName}
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
								orange: "#f97316",
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
							<span style={badge}>Revision Requested</span>
						</Section>

						<Heading className="text-center my-0 leading-8">
							Practice Requested Changes
						</Heading>

						<Section>
							<Text className="text-base">
								<Link className="text-brand font-bold">{practiceName}</Link> has
								reviewed the assets and requested changes for the following campaign:
							</Text>
						</Section>

						<Section style={campaignBox}>
							<Text style={campaignName_style}>{campaignName}</Text>
							<Text style={categoryBadge}>{campaignCategory}</Text>
							<Text style={dateRange}>
								{format(new Date(fromDate), "MMM d")} - {format(new Date(toDate), "MMM d, yyyy")}
							</Text>
						</Section>

						<Section style={feedbackBox}>
							<Text style={feedbackLabel}>Feedback from Practice</Text>
							<Text style={feedbackText}>{feedback}</Text>
						</Section>

						<Section style={actionBox}>
							<Text style={actionTitle}>Action Required</Text>
							<Text style={actionText}>
								Please review the feedback and make the necessary revisions.
								The campaign has been moved back to "In Progress" status.
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
								Once revisions are complete, send the updated assets for approval.
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

export default FeedbackRequestedEmail;

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
	backgroundColor: "#fff7ed",
	color: "#ea580c",
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

const feedbackBox = {
	backgroundColor: "#fff7ed",
	border: "1px solid #fed7aa",
	borderRadius: "8px",
	padding: "20px",
	margin: "20px 0",
};

const feedbackLabel = {
	fontSize: "12px",
	fontWeight: "600" as const,
	color: "#ea580c",
	margin: "0 0 12px 0",
	textTransform: "uppercase" as const,
};

const feedbackText = {
	fontSize: "15px",
	color: "#333",
	margin: "0",
	lineHeight: "1.6",
	whiteSpace: "pre-wrap" as const,
};

const actionBox = {
	backgroundColor: "#fef3c7",
	border: "1px solid #fcd34d",
	borderRadius: "8px",
	padding: "16px",
	margin: "20px 0",
	textAlign: "center" as const,
};

const actionTitle = {
	fontSize: "14px",
	fontWeight: "600" as const,
	color: "#b45309",
	margin: "0 0 8px 0",
};

const actionText = {
	fontSize: "14px",
	color: "#92400e",
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
