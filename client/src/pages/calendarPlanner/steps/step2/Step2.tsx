import {
	Text,
	Checkbox,
	Stack,
	Card,
	ActionIcon,
	Modal,
	Anchor,
	Textarea,
	Button,
	MultiSelect,
	Collapse,
	Flex,
	Box,
} from "@mantine/core";
import { DatePicker, DatePickerInput } from "@mantine/dates";
import "./step2.scss";
import { Fragment, useEffect, useState } from "react";
import { addMonths, format, lastDayOfMonth } from "date-fns";
import filtersData from "@/filters.json";
import { CampaignModel, CampaignPlan, CampaignsModel } from "@/api/campaign";
import { IconPlus, IconSelector } from "@tabler/icons-react";
import { hasLength, useForm } from "@mantine/form";
import clsx from "clsx";
import _ from "lodash";
import { useSendEmail, useUpdateCampaign } from "../../campaign.hooks";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import CampaignSummary from "@/emails/CampaignSummary";
import { render } from "@react-email/components";
import { useAuth } from "@/shared/AuthProvider";

interface Props {
	currentCampaign: CampaignModel;
	allCampaigns: CampaignsModel[];
}

let fm = "MMMM do, yyyy";
const calendarYear = 2025;

const Step2 = ({ allCampaigns, currentCampaign }: Props) => {
	const { campaignId } = useParams();
	const [topicsOpened, { toggle: toggleTopics }] = useDisclosure(true);
	const [objectivesOpened, { toggle: toggleObjectives }] =
		useDisclosure(true);

	//Media queries
	const isMd = useMediaQuery("(max-width: 710px)");
	const isSm = useMediaQuery("(max-width: 500px)");

	const size = () => {
		switch (true) {
			case isSm:
				return {
					size: "xs",
					col: 1,
				};
			case isMd:
				return {
					size: "xs",
					col: 2,
				};
			default:
				return {
					size: "xs",
					col: 3,
				};
		}
	};

	const navigate = useNavigate();
	const [campaignPlans, setCampaignPlans] = useState<CampaignPlan[]>(
		currentCampaign?.campaign_plans ?? []
	);
	const [period, setPeriod] = useState(
		"January 1st, 2025 to March 31st, 2025"
	);
	const [currentRange, setCurrentRange] = useState<string[]>([
		"Jan",
		"Feb",
		"Mar",
	]);
	const [value, setValue] = useState<[Date | null, Date | null]>([
		null,
		null,
	]);
	const [filters, setFilters] = useState<string[]>([]);
	const [campaign, setCampaign] = useState<CampaignsModel>(null);

	//State when trying to add a campaign to the selected plan
	const form = useForm({
		mode: "controlled",
		initialValues: {
			campaign_period: [],
			campaign_note: "",
		},
		validate: {
			campaign_period: hasLength(
				{ min: 1 },
				"Please select a period for this campaign."
			),
		},
	});

	//API
	const { user } = useAuth();
	const { mutate: sendEmail } = useSendEmail();
	const { mutate, isPending } = useUpdateCampaign((cm) => {
		toast.success("Campaign plan submitted successfully!!");
		const emailTemplate = render(
			<CampaignSummary
				summary={cm}
				firstName={user?.user_metadata.first_name}
			/>
		);
		sendEmail({
			to: currentCampaign.personal_details.email,
			subject: `Your ${calendarYear} Campaign Summary`,
			html: emailTemplate,
		});
		navigate(`${AppRoutes.Calendar}/${3}/${cm.campaign_id}`);
	});

	const lastDayOfYear = new Date(calendarYear, 11, 31);
	const firstDayOfYear = new Date(calendarYear, 0, 1);
	const MonthMap = {
		Jan: `January ${calendarYear}`,
		Feb: `February ${calendarYear}`,
		Mar: `March ${calendarYear}`,
		Apr: `April ${calendarYear}`,
		May: `May ${calendarYear}`,
		Jun: `June ${calendarYear}`,
		Jul: `July ${calendarYear}`,
		Aug: `August ${calendarYear}`,
		Sep: `September ${calendarYear}`,
		Oct: `October ${calendarYear}`,
		Nov: `November ${calendarYear}`,
		Dec: `December ${calendarYear}`,
	};

	const campaingsByPeriod = (arr: CampaignsModel[]) => {
		const periodFiltered = _.filter(
			arr,
			(campaign) =>
				!_.isEmpty(
					_.intersection(currentRange, campaign.campaign_availability)
				)
		);

		return filters.length > 0
			? periodFiltered.filter(
					(ftc) =>
						!ftc?.campaign_tags?.every(
							(item) => !filters.includes(item)
						)
			  )
			: periodFiltered;
	};

	const monthsBetween = (d: Date) => {
		const bP = (n: number) =>
			format(lastDayOfMonth(addMonths(d, n)), "MMM");
		let mB = [format(d, "MMM"), bP(1), bP(2)];

		setPeriod(
			`${format(d, fm)} to ${format(
				lastDayOfMonth(addMonths(d, size().col - 1)),
				fm
			)}`
		);
		return mB;
	};

	const getMaxMinDate = () => {
		let minDate = new Date(MonthMap[campaign?.campaign_availability[0]]);
		let maxDate =
			campaign?.campaign_availability.length > 1
				? lastDayOfMonth(
						new Date(
							MonthMap[
								campaign?.campaign_availability[
									campaign?.campaign_availability.length - 1
								]
							]
						)
				  )
				: lastDayOfMonth(minDate);

		return {
			minDate,
			maxDate,
		};
	};

	const cards = (data: string[]) => {
		return data.map((item, i) => (
			<Checkbox key={i} value={item} label={item} />
		));
	};

	const addToPlan = (values: typeof form.values) => {
		const cp: CampaignPlan = {
			...values,
			campaign_period: [
				format(values.campaign_period[0], "yyyy-MM-dd"),
				format(values.campaign_period[1], "yyyy-MM-dd"),
			],
			campaign_name: campaign?.campaign_name,
			campaign_id: campaign?.campaign_id,
			campaign_link: campaign?.campaign_link,
		};

		const cP = campaignPlans ? [...campaignPlans, cp] : [cp];

		setCampaignPlans(cP);
		setCampaign(null);
		form.reset();
	};

	const isChosen = (id: string) => {
		return campaignPlans?.map((cp) => cp.campaign_id).includes(id);
	};

	const handleChange = (event: string[], optionsSet: string[]) => {
		const value = Array.from(event, (option) => option);
		const filteredValues = value.filter((v) => optionsSet.includes(v));
		setFilters((prevSelectedFilters) => {
			// Only add or remove the selected value based on the predefined set
			return [...new Set([...prevSelectedFilters, ...filteredValues])];
		});
	};

	const groupByCampaignType = () => {
		const groupedItems = _.groupBy(allCampaigns, "campaign_type");
		const result = [
			{ campaign_type: "Campaigns", items: groupedItems.Campaign || [] },
			{
				campaign_type: "Always On",
				items: groupedItems["Marketing Suite"] || [],
			},
			{
				campaign_type: "Brand Activations",
				items: groupedItems["Brand Activations"] || [],
			},
		];
		return result;
	};

	const MobileMultiSelect = ({ label, data }) => (
		<MultiSelect
			clearable
			hidePickedOptions
			label={label}
			data={data}
			value={filters.filter((str) => data.includes(str))}
			onChange={(s) => handleChange(s, data)}
			onClear={() =>
				setFilters(filters.filter((str) => !data.includes(str)))
			}
			onRemove={(v) => setFilters(filters.filter((f) => f !== v))}
		/>
	);

	useEffect(() => {
		if (currentCampaign) {
			setCampaignPlans(currentCampaign.campaign_plans);
		}
	}, [currentCampaign]);

	return (
		<div className="planner-step-2">
			<Modal
				opened={campaign !== null}
				onClose={() => setCampaign(null)}
				size="sm"
				title={
					<Text fw={600} c="dimmed">
						Set your campaign details
					</Text>
				}
			>
				<Text fz="h3" fw={500} c="dark">
					{campaign?.campaign_name}
				</Text>

				<Text size="md" c="dark">
					Available:{" "}
					<Text size="sm" fw={600} c="blue" span>
						{MonthMap[campaign?.campaign_availability[0]]}{" "}
						{campaign?.campaign_availability.length > 1 && (
							<>
								to{" "}
								{
									MonthMap[
										campaign?.campaign_availability[
											campaign?.campaign_availability
												.length - 1
										]
									]
								}
							</>
						)}
					</Text>
				</Text>

				<Text mt={20} size="sm">
					<Text span c="blue" fw={700} pr={5}>
						About Campaign:
					</Text>
					{campaign?.campaign_description}
				</Text>

				{campaign?.campaign_link && (
					<Text mt={20}>
						<Anchor
							href={campaign?.campaign_link}
							target="_blank"
							c="blue"
							fw={600}
							size="sm"
						>
							Link to campaign overview
						</Anchor>
					</Text>
				)}

				<Text mt={30} size="xl" opacity={0.6} fw={600}>
					Select campaign period
				</Text>

				<form onSubmit={form.onSubmit(addToPlan)}>
					<DatePickerInput
						type="range"
						clearable
						size="sm"
						label="Campaign period"
						placeholder="Date input"
						minDate={getMaxMinDate().minDate}
						maxDate={getMaxMinDate().maxDate}
						{...form.getInputProps("campaign_period")}
					/>

					<Textarea
						mt={20}
						label="Additional Notes"
						description="Any additional notes you might have about this campaign"
						autosize
						minRows={4}
						maxRows={10}
						{...form.getInputProps("campaign_note")}
					/>

					<Button type="submit" fullWidth mt={20}>
						Add campaign to plan
					</Button>
				</form>
			</Modal>

			<div className="ps2-content">
				<Flex
					direction={{ lg: "row", sm: "column", base: "column" }}
					justify="space-between"
					align="flex-start"
				>
					<Box>
						<Text fw={800} c="pink">
							STEP 2
						</Text>
						<Text fz="h1" fw={600} c="dark">
							Planning Calendar |{" "}
							<Text fz="h1" fw={600} c="blue" span>
								2025
							</Text>
						</Text>
						<Text size="sm" c="dimmed" mb="md" maw={600}>
						Use the calendar to schedule marketing campaigns that align with your practice’s goals. Filter by objectives (e.g., ADV, conversion) or topics (e.g., frames, lenses) to explore available campaigns. Each campaign includes details such as availability dates and links to materials, helping you plan effectively.
						</Text>

						<Text size="sm"mb="md" c="dimmed" maw={600}>
						“Always On” campaigns provide year-round opportunities, while “Brand Activations” focus on specific, time-sensitive initiatives.
						</Text>

						<Text fz="h4">Save Your Progress:</Text>

						<Text size="sm" mb="md" c="dimmed" maw={600}>Be sure to save your selections before exiting—your plan will be available in My Marketing Plans, where you can return anytime to make updates or add new campaigns.</Text>

						<Text size="sm" c="dimmed" maw={600}>When ready, submit your plan to receive a summary email, with additional feedback provided closer to implementation.</Text>
					</Box>

					<Button
						onClick={() => navigate(AppRoutes.MyCampaigns)}
						mt={20}
					>
						View Marketing Plan
					</Button>
				</Flex>

				<div className="calendar-picker-group">
					<div className="filters">
						<Text fz="h2" fw={600} c="blue">
							Filters
						</Text>

						<div className="objectives">
							<Flex
								justify="space-between"
								align="center"
								style={{ cursor: "pointer" }}
								onClick={toggleObjectives}
							>
								<Text fz="h4" fw={700} c="dark">
									Objectives
								</Text>
								<IconSelector size={20} />
							</Flex>
							<Collapse in={objectivesOpened}>
								<div className="all-objectives">
									<Checkbox.Group
										value={filters}
										onChange={setFilters}
									>
										<Stack pt="md" gap="xs">
											{cards(filtersData.objectives)}
										</Stack>
									</Checkbox.Group>
								</div>
							</Collapse>
						</div>

						<div className="objectives">
							<Flex
								justify="space-between"
								align="center"
								style={{ cursor: "pointer" }}
								onClick={toggleTopics}
								mt="xl"
							>
								<Text fz="h4" fw={700} c="dark">
									Topics
								</Text>
								<IconSelector size={20} />
							</Flex>
							<Collapse in={topicsOpened}>
								<div className="all-objectives">
									<Checkbox.Group
										value={filters}
										onChange={setFilters}
									>
										<Stack pt="md" gap="xs">
											{cards(filtersData.topics)}
										</Stack>
									</Checkbox.Group>
								</div>
							</Collapse>
						</div>

						<div className="objectives">
							<Text fz="h4" fw={700} c="dark" mt="xl">
								Selections
							</Text>
							<div className="all-objectives">
								<Checkbox.Group
									value={filters}
									onChange={setFilters}
								>
									{campaignPlans &&
									campaignPlans?.length > 0 ? (
										<Fragment>
											{campaignPlans.map((cp, i) => (
												<Card
													key={i}
													mt={10}
													radius="sm"
													withBorder
													className="c-card"
													onClick={() => {}}
												>
													<Text c="dark" fw={300}>
														{cp.campaign_name}
													</Text>

													<Text
														c="blue"
														size="sm"
														fw={600}
														mt={5}
													>
														{format(
															cp
																.campaign_period[0],
															fm
														)}{" "}
														to{" "}
														{format(
															cp
																.campaign_period[1],
															fm
														)}
													</Text>
												</Card>
											))}
										</Fragment>
									) : (
										<Card
											mt={10}
											radius="sm"
											withBorder
											className="c-card"
											onClick={() => {}}
										>
											<Text c="dark" fw={300}>
												No campaigns selected.
											</Text>
										</Card>
									)}
								</Checkbox.Group>
							</div>
						</div>
					</div>
					<div className="content">
						<DatePicker
							type="range"
							size={size().size as any}
							numberOfColumns={size().col}
							columnsToScroll={1}
							minDate={firstDayOfYear}
							maxDate={lastDayOfYear}
							value={value}
							onChange={setValue}
							onNextMonth={(d) =>
								setCurrentRange(monthsBetween(d))
							}
							onPreviousMonth={(d) =>
								setCurrentRange(monthsBetween(d))
							}
						/>

						<div className="mobile-filters">
							<MobileMultiSelect
								label="Your KPI Objectives"
								data={filtersData.objectives}
							/>
							<MobileMultiSelect
								label="Your General Topics"
								data={filtersData.topics}
							/>
						</div>

						<div className="blocks">
							{groupByCampaignType().map((gr, index) => (
								<Box key={index} mt={index !== 0 ? 50 : 0}>
									<Text fz="h2" fw={600} c="blue">
										{gr.campaign_type}
									</Text>

									<Text c="dimmed" size="sm" mb={10}>
										Showing all available {gr.campaign_type}{" "}
										between{" "}
										<Text c="blue" size="sm" fw={600} span>
											{period}
										</Text>
									</Text>

									<div className="blocks-content">
										{gr.items && gr.items.length > 0 && (
											<Fragment>
												{_.every(
													campaingsByPeriod(gr.items),
													_.isUndefined
												) ? (
													<Text
														fw={700}
														c="gray"
														fs="italic"
													>
														No {gr.campaign_type}{" "}
														available for this
														period.
													</Text>
												) : (
													<Fragment>
														{campaingsByPeriod(
															gr.items
														).map((cmp, i) => (
															<Fragment key={i}>
																{cmp !==
																	undefined && (
																	<Card
																		radius="sm"
																		withBorder
																		className={clsx(
																			"c-card",
																			isChosen(
																				cmp?.campaign_id
																			) &&
																				"chosen"
																		)}
																		onClick={() => {
																			if (
																				isChosen(
																					cmp?.campaign_id
																				)
																			) {
																				setCampaignPlans(
																					campaignPlans.filter(
																						(
																							cp
																						) =>
																							cp.campaign_id !==
																							cmp?.campaign_id
																					)
																				);
																			} else {
																				setCampaign(
																					cmp
																				);
																			}
																		}}
																	>
																		<Stack
																			mt="xs"
																			mb="xs"
																			gap={
																				5
																			}
																		>
																			<Text
																				c="dark"
																				fw={
																					300
																				}
																			>
																				{
																					cmp.campaign_name
																				}
																			</Text>

																			<Text
																				size="xs"
																				c="blue"
																				fw={
																					600
																				}
																			>
																				Available:{" "}
																				<Text
																					size="xs"
																					fw={
																						600
																					}
																					c="dark"
																					span
																				>
																					{
																						MonthMap[
																							cmp
																								?.campaign_availability[0]
																						]
																					}{" "}
																					{cmp
																						?.campaign_availability
																						.length >
																						1 && (
																						<>
																							to{" "}
																							{
																								MonthMap[
																									cmp
																										?.campaign_availability[
																										cmp
																											?.campaign_availability
																											.length -
																											1
																									]
																								]
																							}
																						</>
																					)}
																				</Text>
																			</Text>
																		</Stack>

																		{isChosen(
																			cmp?.campaign_id
																		) ? (
																			<Text
																				c="blue"
																				fw={
																					700
																				}
																				size="sm"
																				style={{
																					alignSelf:
																						"flex-end",
																				}}
																			>
																				Remove
																			</Text>
																		) : (
																			<ActionIcon
																				variant={
																					isChosen(
																						cmp?.campaign_id
																					)
																						? "filled"
																						: "light"
																				}
																				aria-label="Settings"
																				style={{
																					alignSelf:
																						"flex-end",
																				}}
																			>
																				<IconPlus
																					style={{
																						width: "70%",
																						height: "70%",
																					}}
																					stroke={
																						1.5
																					}
																				/>
																			</ActionIcon>
																		)}
																	</Card>
																)}
															</Fragment>
														))}
													</Fragment>
												)}
											</Fragment>
										)}
									</div>
								</Box>
							))}

							<Button
								fullWidth
								mt={50}
								size="lg"
								disabled={campaignPlans?.length < 1}
								loading={isPending}
								onClick={() => {
									mutate({
										...currentCampaign,
										campaign_id: campaignId,
										campaign_plans: campaignPlans,
									});
								}}
								style={{ position: "sticky", bottom: "10px" }}
							>
								Save Marketing Plan
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Step2;
