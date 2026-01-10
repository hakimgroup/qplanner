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
import * as React from "react";

interface EmptyPlannerEmailProps {
	practiceName: string;
	practiceId: string;
	appUrl: string;
}

export const EmptyPlannerEmail = ({
	practiceName,
	practiceId,
	appUrl,
}: EmptyPlannerEmailProps) => {
	const planUrl = `${appUrl}/dashboard?practice=${practiceId}`;

	return (
		<Html>
			<Head />
			<Preview>
				Your planner for {practiceName} is ready to go
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
							Your Planner is Set Up!
						</Heading>

						<Section>
							<Text className="text-base">
								Your team started setting up{" "}
								<Link className="text-brand font-bold">
									{practiceName}
								</Link>
								, but it looks like your planner is currently empty.
							</Text>

							<Text className="text-base">
								No worries! Head back in to browse our campaign catalog
								and start planning your marketing activities.
							</Text>
						</Section>

						<Section style={emptyStateBox}>
							<Text style={emptyStateText}>
								Your plan is empty
							</Text>
							<Text style={emptyStateSubtext}>
								Browse campaigns and add them to your plan
							</Text>
						</Section>

						<Section className="text-center">
							<Button
								href={planUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								Start Planning
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={paragraph}>
								<strong>Need help getting started?</strong>
							</Text>
							<Text style={paragraph}>
								Our campaign catalog has a variety of pre-built campaigns
								ready to use. You can also create bespoke campaigns
								tailored to your practice's needs.
							</Text>
							<Text style={paragraph}>
								If you have any questions, reach out to the marketing team
								for assistance.
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

export default EmptyPlannerEmail;

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

const emptyStateBox = {
	backgroundColor: "#faf8fd",
	border: "2px dashed #e5d5f8",
	borderRadius: "8px",
	padding: "24px",
	textAlign: "center" as const,
	margin: "24px 0",
};

const emptyStateText = {
	fontSize: "18px",
	fontWeight: "600" as const,
	color: "#7b2eda",
	margin: "0 0 8px 0",
};

const emptyStateSubtext = {
	fontSize: "14px",
	color: "#666",
	margin: "0",
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
