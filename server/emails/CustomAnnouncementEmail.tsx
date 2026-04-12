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

const CustomAnnouncementEmail = ({
	subject,
	body,
	practiceName,
	senderName,
	ctaText,
	ctaUrl,
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
				<Container
					style={{
						backgroundColor: "#ffffff",
						padding: 0,
						borderRadius: 12,
						overflow: "hidden",
					}}
				>
					{/* Hero banner */}
					<Section
						style={{
							background: "linear-gradient(135deg, #7b2eda 0%, #4f46e5 100%)",
							padding: "40px 45px 30px",
							textAlign: "center" as const,
						}}
					>
						<Heading
							style={{
								color: "#ffffff",
								fontSize: 26,
								fontWeight: 700,
								margin: 0,
								lineHeight: "1.3",
							}}
						>
							{subject}
						</Heading>
						<Text
							style={{
								color: "rgba(255,255,255,0.75)",
								fontSize: 14,
								margin: "8px 0 0",
							}}
						>
							{practiceName}
						</Text>
					</Section>

					{/* Body content */}
					<Section style={{ padding: "30px 45px 40px" }}>
						{body.split("\n").map((line, i) => (
							<Text
								key={i}
								style={{
									fontSize: 16,
									lineHeight: "1.6",
									margin: "4px 0",
									color: "#374151",
								}}
							>
								{line || "\u00A0"}
							</Text>
						))}

						{ctaText && ctaUrl && (
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
						)}

						{senderName && (
							<>
								<Hr
									style={{
										borderColor: "#e5e7eb",
										margin: "24px 0",
									}}
								/>
								<Text
									style={{
										fontSize: 14,
										color: "#9ca3af",
									}}
								>
									— {senderName}
								</Text>
							</>
						)}
					</Section>
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

export default CustomAnnouncementEmail;
