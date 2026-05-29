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

interface CommentAddedEmailProps {
	authorName: string;
	authorRole: string | null;
	campaignName: string;
	practiceName: string;
	body: string;
	appUrl: string;
	selectionId: string;
}

export const CommentAddedEmail = ({
	authorName,
	authorRole,
	campaignName,
	practiceName,
	body,
	appUrl,
	selectionId,
}: CommentAddedEmailProps) => {
	const reviewUrl = `${appUrl}/notifications-center?selectionId=${selectionId}&focus=comments`;
	const isAdminSide = authorRole === "admin" || authorRole === "super_admin";
	const sideLabel = isAdminSide ? "Hakim Group team" : "Practice";

	return (
		<Html>
			<Head />
			<Preview>
				{authorName} commented on {campaignName}
			</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								brand: "#7b2eda",
								offwhite: "#faf8fd",
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
							<span style={badge}>New Comment</span>
						</Section>

						<Heading className="text-center my-0 leading-8">
							New comment on {campaignName}
						</Heading>

						<Section>
							<Text style={contextText}>
								<strong>{authorName}</strong> ({sideLabel}) commented on the {campaignName} campaign for{" "}
								<strong>{practiceName}</strong>.
							</Text>
						</Section>

						<Section style={quoteBox}>
							<Text style={quoteText}>{body}</Text>
						</Section>

						<Section className="text-center">
							<Button
								href={reviewUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								Open the conversation
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={footerNote}>
								Reply by opening the conversation in the planner. Replies sent to this
								email address won't be delivered.
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

export default CommentAddedEmail;

const logoContainer = { textAlign: "center" as const, padding: "40px 0 20px 0" };
const logoBox = {
	display: "inline-block",
	borderRadius: "10px",
	background: "linear-gradient(130deg, rgba(114, 100, 233, 1) 11%, rgba(214, 76, 168, 1) 85%)",
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
const contextText = {
	fontSize: "14px",
	lineHeight: "1.6",
	color: "#374151",
	margin: "20px 0 16px 0",
};
const quoteBox = {
	backgroundColor: "#faf8fd",
	border: "1px solid #e5d5f8",
	borderLeft: "4px solid #7b2eda",
	borderRadius: "8px",
	padding: "20px 24px",
	margin: "16px 0 24px 0",
};
const quoteText = {
	fontSize: "15px",
	lineHeight: "1.55",
	color: "#1f2937",
	margin: "0",
	whiteSpace: "pre-wrap" as const,
};
const footerNote = {
	fontSize: "12px",
	color: "#9ca3af",
	textAlign: "center" as const,
	margin: "12px 0 0 0",
};
const hr = { borderColor: "#e5d5f8", margin: "30px 0" };
