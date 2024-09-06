import { Card, Text, Badge, Button, Group, Title } from "@mantine/core";
import "./campaigns.scss";
import { useCampaign } from "../calendarPlanner/campaign.hooks";
import { Fragment } from "react/jsx-runtime";
import { format } from "date-fns";
import { CampaignModel } from "@/api/campaign";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { IconEdit } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";
import Empty from "@assets/empty-folder.png";
import ProtectedWrapper from "@/shared/Protected";

const Campaigns = () => {
	const navigate = useNavigate();
	const [activeCampaign, setActiveCampaign] = useState<CampaignModel>(null);

	//APIs
	const { data, isFetching } = useCampaign();

	const isIncomplete = (dt: CampaignModel) => {
		if (!dt.personal_details || !dt.campaign_plans) {
			return true;
		}

		return false;
	};

	useEffect(() => {
		if (data) {
			for (let i = 0; i < data.length; i++) {
				const obj = data[i];

				// Check if personal_details is not null or empty
				const hasValidPersonalDetails =
					obj.personal_details &&
					Object.keys(obj.personal_details).length > 0;

				// Check if campaign_plans is not null or empty
				const hasValidCampaignPlans =
					Array.isArray(obj.campaign_plans) &&
					obj.campaign_plans.length > 0;

				// Return the first object that meets both conditions
				if (hasValidPersonalDetails && hasValidCampaignPlans) {
					setActiveCampaign(obj);
				}
			}
		}
	}, [data]);

	return (
		<ProtectedWrapper>
			<div className="my-campaigns">
				<div className="my-campaigns-content">
					<Text fw={800} c="pink">
						My Campaigns
					</Text>
					<Text fz="h1" fw={600} c="dark">
						My Campaigns Overview |{" "}
						<Text fz="h1" fw={600} c="blue" span>
							2025
						</Text>
					</Text>
					<Text size="sm" c="dimmed" maw={600}>
						Here are all your campaigns! Review your marketing
						strategies and track the progress of each campaign. You
						can easily manage and adjust your campaigns to ensure
						they align with your goals. Stay on top of your
						marketing efforts and make sure you're set up for
						success!
					</Text>

					{data && data.length > 0 ? (
						<div className="campaigns-grid">
							<div className="campaign-block">
								{data && data.length > 0 && (
									<Fragment>
										{data.map((cs, i) => {
											const isActive =
												activeCampaign?.campaign_id ===
												cs.campaign_id;
											return (
												<Card
													key={i}
													className={clsx(
														"c-card",
														isActive && "active"
													)}
													padding="sm"
													radius="sm"
													withBorder
													onClick={() => {
														if (isIncomplete(cs)) {
															if (
																!cs.personal_details
															) {
																navigate(
																	`${
																		AppRoutes.Calendar
																	}/${1}`
																);
															} else {
																navigate(
																	`${
																		AppRoutes.Calendar
																	}/${2}/${
																		cs.campaign_id
																	}`
																);
															}
														} else {
															setActiveCampaign(
																cs
															);
														}
													}}
												>
													<Group
														justify="flex-end"
														mb="sm"
													>
														<Badge
															size="xs"
															radius="xs"
															variant="light"
															color={
																isIncomplete(cs)
																	? "pink"
																	: isActive
																	? "white"
																	: "blue"
															}
														>
															{isIncomplete(cs)
																? "Incomplete"
																: "Done"}
														</Badge>
													</Group>

													<Text
														fw={700}
														c={
															isActive
																? "white"
																: "dark"
														}
													>
														{
															cs.personal_details
																.strategyName
														}
													</Text>

													<Text
														size="xs"
														mt={5}
														c={
															isActive
																? "white"
																: "dark"
														}
													>
														Created{" "}
														<Text
															size="xs"
															c={
																isActive
																	? "orange"
																	: "blue"
															}
															span
															fw={700}
														>
															{format(
																cs.created_at,
																"MMMM do, yyyy"
															)}
														</Text>
													</Text>
												</Card>
											);
										})}
									</Fragment>
								)}
							</div>
							<div className="grid-content">
								{activeCampaign && (
									<Fragment>
										{activeCampaign.campaign_plans.map(
											(ac, i) => (
												<Card
													className="c-card"
													padding="lg"
													radius="sm"
													withBorder
													key={i}
													onClick={() => {
														navigate(
															`${
																AppRoutes.Calendar
															}/${2}/${
																activeCampaign.campaign_id
															}`
														);
													}}
												>
													<Card.Section p="lg">
														<Title order={3}>
															{ac.campaign_name}
														</Title>
													</Card.Section>

													<Group
														justify="space-between"
														mt="xs"
														mb="xs"
													>
														<Text
															size="sm"
															fw={500}
														>
															Begins{" "}
															<Text
																span
																c="blue"
																fw={600}
															>
																{format(
																	ac
																		.campaign_period[0],
																	"MMMM do, yyyy"
																)}
															</Text>{" "}
															and ends{" "}
															<Text
																span
																c="blue"
																fw={600}
															>
																{format(
																	ac
																		.campaign_period[1],
																	"MMMM do, yyyy"
																)}
															</Text>
														</Text>
													</Group>

													<Text size="sm" c="dimmed">
														{ac.campaign_note
															? ac.campaign_note
															: "-"}
													</Text>

													<Button
														color="blue"
														fullWidth
														mt="md"
														radius="sm"
														variant="light"
														rightSection={
															<IconEdit
																size={15}
															/>
														}
													>
														Edit this campaign
													</Button>
												</Card>
											)
										)}
									</Fragment>
								)}
							</div>
						</div>
					) : (
						<div className="empty">
							<img src={Empty} alt="Empty file folder" />
							<Text size="lg" c="dimmed" fw={600}>
								No Campaigns Created
							</Text>
							<Button
								mt={20}
								onClick={() =>
									navigate(`${AppRoutes.Calendar}/1`)
								}
							>
								Create Campaign Now
							</Button>
						</div>
					)}
				</div>
			</div>
		</ProtectedWrapper>
	);
};

export default Campaigns;
