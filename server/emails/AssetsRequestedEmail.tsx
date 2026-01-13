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

interface CreativeOption {
	url: string;
	label?: string;
}

interface AssetItem {
	name?: string;
	label?: string;
	requested?: boolean;
}

interface AssetsRequestedEmailProps {
	practiceName: string;
	practiceId: string;
	campaignName: string;
	campaignCategory: string;
	fromDate: string;
	toDate: string;
	creatives?: CreativeOption[];
	assets?: {
		digitalAssets?: AssetItem[];
		printedAssets?: AssetItem[];
		externalPlacements?: AssetItem[];
	};
	note?: string | null;
	appUrl: string;
	selectionId: string;
}

export const AssetsRequestedEmail = ({
	practiceName,
	practiceId,
	campaignName,
	campaignCategory,
	fromDate,
	toDate,
	creatives = [],
	assets,
	note,
	appUrl,
	selectionId,
}: AssetsRequestedEmailProps) => {
	const respondUrl = `${appUrl}/notifications-center?selection=${selectionId}`;

	// Count requested assets
	const requestedDigital = assets?.digitalAssets?.filter(a => a.requested) || [];
	const requestedPrinted = assets?.printedAssets?.filter(a => a.requested) || [];
	const requestedExternal = assets?.externalPlacements?.filter(a => a.requested) || [];
	const totalRequested = requestedDigital.length + requestedPrinted.length + requestedExternal.length;

	return (
		<Html>
			<Head />
			<Preview>
				Action Required: Choose creative for {campaignName}
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
							Creative Selection Needed
						</Heading>

						<Section>
							<Text className="text-base">
								The marketing team has requested your input for an upcoming campaign
								at <Link className="text-brand font-bold">{practiceName}</Link>.
							</Text>
						</Section>

						<Section style={campaignBox}>
							<Text style={campaignName_style}>{campaignName}</Text>
							<Text style={categoryBadge}>{campaignCategory}</Text>
							<Text style={dateRange}>
								{format(new Date(fromDate), "MMM d")} - {format(new Date(toDate), "MMM d, yyyy")}
							</Text>
						</Section>

						{creatives.length > 0 && (
							<Section>
								<Text style={sectionTitle}>Creative Options</Text>
								<Text className="text-base text-gray-600">
									{creatives.length} creative option{creatives.length !== 1 ? 's' : ''} available for you to choose from.
								</Text>
							</Section>
						)}

						{totalRequested > 0 && (
							<Section>
								<Text style={sectionTitle}>Requested Assets</Text>
								<Text className="text-base text-gray-600">
									Please confirm quantities for {totalRequested} asset{totalRequested !== 1 ? 's' : ''}:
								</Text>
								<ul style={assetList}>
									{requestedDigital.map((asset, i) => (
										<li key={`d-${i}`} style={assetItem}>
											{asset.name || asset.label || 'Digital Asset'}
										</li>
									))}
									{requestedPrinted.map((asset, i) => (
										<li key={`p-${i}`} style={assetItem}>
											{asset.name || asset.label || 'Printed Asset'}
										</li>
									))}
									{requestedExternal.map((asset, i) => (
										<li key={`e-${i}`} style={assetItem}>
											{asset.name || asset.label || 'External Placement'}
										</li>
									))}
								</ul>
							</Section>
						)}

						{note && (
							<Section style={noteBox}>
								<Text style={noteLabel}>Note from the team:</Text>
								<Text style={noteText}>{note}</Text>
							</Section>
						)}

						<Section className="text-center">
							<Button
								href={respondUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								Respond Now
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={paragraph}>
								Please respond at your earliest convenience so the marketing team
								can proceed with production.
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

export default AssetsRequestedEmail;

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

const sectionTitle = {
	fontSize: "14px",
	fontWeight: "600" as const,
	color: "#333",
	marginBottom: "8px",
	textTransform: "uppercase" as const,
	letterSpacing: "0.5px",
};

const assetList = {
	margin: "12px 0",
	padding: "0 0 0 20px",
};

const assetItem = {
	fontSize: "14px",
	color: "#484848",
	marginBottom: "6px",
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
