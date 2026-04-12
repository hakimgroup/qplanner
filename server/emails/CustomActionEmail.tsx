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

interface Props {
	subject: string;
	body: string;
	practiceName: string;
	senderName?: string;
	ctaText?: string;
	ctaUrl?: string;
}

const CustomActionEmail = ({
	subject,
	body,
	practiceName,
	senderName,
	ctaText = "Open QPlanner",
	ctaUrl = "https://planner.hakimgroup.co.uk",
}: Props) => (
	<Html>
		<Head />
		<Preview>{subject}</Preview>
		<Tailwind
			config={{
				theme: {
					extend: {
						colors: {
							brand: "#7b2eda",
							offwhite: "#faf8fd",
							orange: "#ff7f50",
						},
					},
				},
			} as any}
		>
			<Body className="bg-offwhite text-base font-sans">
				<Section style={{ textAlign: "center", padding: "30px 0 20px" }}>
					<div
						style={{
							display: "inline-block",
							backgroundColor: "#7b2eda",
							borderRadius: 12,
							padding: "10px 14px",
						}}
					>
						<Img
							src="https://i.postimg.cc/0Q5wP963/hg-icon-white-rgb.png"
							alt="HG"
							width="36"
							height="36"
							style={{ display: "block" }}
						/>
					</div>
				</Section>
				<Container className="bg-white p-[45px]">
					<Section
						style={{
							textAlign: "center",
							marginBottom: 16,
						}}
					>
						<span
							style={{
								display: "inline-block",
								backgroundColor: "#fff3ed",
								color: "#ff7f50",
								padding: "6px 16px",
								borderRadius: 20,
								fontSize: 13,
								fontWeight: 700,
								letterSpacing: 0.5,
								textTransform: "uppercase" as const,
							}}
						>
							Action Required
						</span>
					</Section>

					<Heading className="text-center my-0 leading-8">
						{subject}
					</Heading>

					<Text className="text-sm text-gray-500 text-center mt-1 mb-6">
						For {practiceName}
					</Text>

					<Hr className="border-gray-200 my-4" />

					{body.split("\n").map((line, i) => (
						<Text key={i} className="text-base leading-6 my-1">
							{line || "\u00A0"}
						</Text>
					))}

					<Section style={{ textAlign: "center", marginTop: 30 }}>
						<Button
							href={ctaUrl}
							style={{
								backgroundColor: "#7b2eda",
								borderRadius: 8,
								color: "#fff",
								fontSize: 15,
								fontWeight: 700,
								textDecoration: "none",
								textAlign: "center" as const,
								display: "inline-block",
								padding: "14px 32px",
							}}
						>
							{ctaText}
						</Button>
					</Section>

					{senderName && (
						<>
							<Hr className="border-gray-200 my-6" />
							<Text className="text-sm text-gray-500">
								— {senderName}
							</Text>
						</>
					)}
				</Container>

				<Section style={{ textAlign: "center", padding: "20px 0" }}>
					<Text className="text-xs text-gray-400">
						QPlanner — Hakim Group
					</Text>
				</Section>
			</Body>
		</Tailwind>
	</Html>
);

export default CustomActionEmail;
