import { CampaignModel } from "@/api/campaign";
import { AppRoutes } from "@/shared/shared.models";
import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Row,
	Section,
	Text,
	Tailwind,
	Hr,
	Img,
} from "@react-email/components";
import { format } from "date-fns";
import * as React from "react";

interface CampaignSummaryProps {
	summary?: CampaignModel;
	firstName?: string;
}

const test: CampaignModel = {
	campaign_id: "01b85cdd-df36-4032-b161-655f5ccd28e2",
	created_at: "2024-09-05T14:28:51.405744+00:00" as any,
	creator_id: "4605b452-4555-4855-8dc5-14d0c88977a9",
	personal_details: {
		name: "Bratua Seimodei",
		email: "wetinna@gmail.com",
		practiceName: "Test Practice",
		strategyName: "My 2025 Strategy",
	},
	campaign_plans: [
		{
			campaign_id: "307a57a8-b1c8-4092-8416-f9daa9be44c1",
			campaign_link: "",
			campaign_name: "Proudly independent ",
			campaign_note: "trhbgsart mtsrm tsrmrysr",
			campaign_period: ["2025-09-03", "2025-09-20"],
		},
		{
			campaign_id: "d2f96ebe-3d33-416f-b2d3-cde14b6427cc",
			campaign_link: "",
			campaign_name:
				"https://hakimgroupcouk.sharepoint.com/sites/HelpHub/SitePages/Drive-Safe.aspx",
			campaign_note: "ytdmnfgtdm,f,j ",
			campaign_period: ["2025-09-09", "2025-09-20"],
		},
		{
			campaign_id: "ad5a6a00-7f44-4d25-becd-dd331468e37a",
			campaign_link: "",
			campaign_name:
				"Contact lenses - horrors of unregulated CL - see professional ",
			campaign_note: "",
			campaign_period: ["2025-10-03", "2025-10-25"],
		},
		{
			campaign_id: "7c218556-9ebe-4cc6-b618-9700b0694e2e",
			campaign_link: "",
			campaign_name: "Bold frame campaign - party ready - gold",
			campaign_note: "",
			campaign_period: ["2025-11-06", "2025-11-22"],
		},
		{
			campaign_id: "9e1e6e7a-fca0-44bd-be58-d544a6afac69",
			campaign_link:
				"https://hakimgroupcouk.sharepoint.com/sites/HelpHub/SitePages/Summer-Sports-Vision.aspx",
			campaign_name: "Summer of sport - Wimbledon",
			campaign_note: "rvgagnbsgrnt   gsf ntrsnt srtn ",
			campaign_period: ["2025-06-04", "2025-06-27"],
		},
		{
			campaign_id: "77c9b5ce-7612-42d0-9ba9-9e89aa4ddc5d",
			campaign_link: "",
			campaign_name: "Equal student offer",
			campaign_note: "Email Tests",
			campaign_period: ["2025-08-14", "2025-08-29"],
		},
		{
			campaign_id: "b2b0aff8-06f5-4b2f-82c8-ec24e5984372",
			campaign_link:
				"https://hakimgroupcouk.sharepoint.com/sites/HelpHub/SitePages/Dry-Eye(1).aspx",
			campaign_name: "Allergy/dry eye campaign - Brand activation",
			campaign_note: "",
			campaign_period: ["2025-04-11", "2025-04-24"],
		},
	],
};

export const CampaignSummary = ({
	summary,
	firstName,
}: CampaignSummaryProps) => {
	const url: string = "https://planner.hakimgroup.co.uk";

	return (
		<Html>
			<Head />
			<Preview>
				Your latest campaign strategy has been successfully submitted!!
				🎉
			</Preview>
			<Tailwind
				config={
					{
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
					} as any
				}
			>
				<Body className="bg-offwhite text-base font-sans">
					<Img
						src={`https://i.postimg.cc/MG5r0LMD/HG-Marketing-Planner.png`}
						width="184"
						style={{
							borderRadius: "10px",
						}}
						alt="Netlify"
						className="mx-auto my-20"
					/>
					<Container className="bg-white p-45">
						<Heading className="text-center my-0 leading-8">
							Campaign Summary
						</Heading>

						<Section>
							<Row>
								<Text className="text-base">
									Congratulations{" "}
									<Link className="text-brandRed">
										{firstName}
									</Link>
									! We're excited to let you know that your
									campaign plan by{" "}
									<Link className="text-brand font-bold">
										{summary?.personal_details.practiceName}
									</Link>{" "}
									has been submitted successfully!!
								</Text>

								<Text className="text-base">
									Here's a summary of the included campaigns:
								</Text>
							</Row>
						</Section>

						<ul>
							{summary?.campaign_plans.map((sm, i) => (
								<li key={i} style={list}>
									<strong style={{ fontSize: "15px" }}>
										{sm.campaign_name}
									</strong>

									<Text style={{ marginTop: "1px" }}>
										Begins{" "}
										<Link className="text-brand">
											{format(
												sm.campaign_period[0],
												"MMMM do, yyyy"
											)}
										</Link>{" "}
										and ends{" "}
										<Link className="text-brand">
											{format(
												sm.campaign_period[1],
												"MMMM do, yyyy"
											)}
										</Link>
									</Text>

									{sm.campaign_link && (
										<Text style={{ marginTop: "-10px" }}>
											<Link
												href={sm.campaign_link}
												className="text-brandRed"
											>
												Link to campaign overview
											</Link>
										</Text>
									)}
								</li>
							))}
						</ul>

						<Section className="text-center">
							<Button
								href={``}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								Go To My Campaigns
							</Button>
						</Section>

						<Hr style={hr} />

						<Section style={{ marginTop: "30px" }}>
							<Row>
								<Text
									style={{ ...paragraph, fontWeight: "700" }}
								>
									What's Next?
								</Text>
								<Text>
									<Link href={``} style={link}>
										Create a new plan.
									</Link>
								</Text>
								<Text>
									<Link href={``} style={link}>
										View all my plans.
									</Link>
								</Text>
								<Text>
									<Link href={``} style={link}>
										Update exisiting plans.
									</Link>
								</Text>
							</Row>
						</Section>
					</Container>

					<Container className="mt-20">
						{/* <Section>
							<Row>
								<Column className="text-right px-20">
									<Link>Unsubscribe</Link>
								</Column>
								<Column className="text-left">
									<Link>Manage Preferences</Link>
								</Column>
							</Row>
						</Section> */}
						<Text className="text-center text-gray-400 mb-45">
							Unit 317, India Mill Business Centre, Bolton Rd,
							Darwen BB3 1AE
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default CampaignSummary;

const global = {
	heading: {
		fontSize: "32px",
		lineHeight: "1.3",
		fontWeight: "700",
		textAlign: "center",
		letterSpacing: "-1px",
		color: "#7b2eda",
	} as React.CSSProperties,
};

const paragraph = {
	fontSize: "15px",
	lineHeight: "1.4",
	color: "#484848",
};

const link = {
	...paragraph,
	color: "#f01879",
	display: "block",
};

const hr = {
	borderColor: "#e5d5f8",
	margin: "30px 0",
};

const list = {
	padding: "10px 10px .1px 10px",
	borderRadius: "3px",
	backgroundColor: "#f7f2fd",
	marginBottom: "20px",
	height: "fit-content",
};
