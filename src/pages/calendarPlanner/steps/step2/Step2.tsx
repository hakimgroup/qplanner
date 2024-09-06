import {
	Text,
	Checkbox,
	Group,
	Stack,
	Card,
	ActionIcon,
	Modal,
	Anchor,
	Textarea,
	Button,
	MultiSelect,
} from "@mantine/core";
import { DatePicker, DatePickerInput } from "@mantine/dates";
import "./step2.scss";
import { Fragment, useEffect, useState } from "react";
import { addMonths, format, lastDayOfMonth } from "date-fns";
import filtersData from "@/filters.json";
import { CampaignModel, CampaignPlan, CampaignsModel } from "@/api/campaign";
import { IconPlus } from "@tabler/icons-react";
import { hasLength, useForm } from "@mantine/form";
import clsx from "clsx";
import _ from "lodash";
import { useUpdateCampaign } from "../../campaign.hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";
import { useMediaQuery, useScrollIntoView } from "@mantine/hooks";

interface Props {
	currentCampaign: CampaignModel;
	allCampaigns: CampaignsModel[];
}

let fm = "MMMM do, yyyy";

const Step2 = ({ allCampaigns, currentCampaign }: Props) => {
	//Media queries
	const isSm = useMediaQuery("(max-width: 980px)");
	const isXs = useMediaQuery("(max-width: 865px)");
	const isXxs = useMediaQuery("(max-width: 675px)");

	const size = () => {
		switch (true) {
			case isXxs:
				return {
					size: "sm",
					col: 1,
				};
			case isXs:
				return {
					size: "md",
					col: 2,
				};
			case isSm:
				return {
					size: "sm",
					col: 3,
				};
			default:
				return {
					size: "md",
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
	const { mutate, isPending } = useUpdateCampaign((id) => {
		toast.success("Campaign plan submitted successfully!!");
		navigate(`${AppRoutes.Calendar}/${3}/${id}`);
	});

	const calendarYear = 2025;
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

	const campaingsByPeriod = () => {
		const periodFiltered = allCampaigns.map((ac) => {
			if (
				ac.campaign_availability.every((item) =>
					currentRange.includes(item)
				)
			) {
				return ac;
			}
		});

		return filters.length > 0
			? periodFiltered.filter(
					(ftc) =>
						!ftc?.campaign_tags.every(
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
		return data.map((item) => (
			<Checkbox.Card
				className="c-root"
				radius="sm"
				value={item}
				key={item}
			>
				<Group wrap="nowrap" align="flex-start">
					<Checkbox.Indicator />
					<div>
						<Text className="c-label">{item}</Text>
					</div>
				</Group>
			</Checkbox.Card>
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

	const MobileMultiSelect = ({ label, description, data }) => (
		<MultiSelect
			clearable
			hidePickedOptions
			label={label}
			description={description}
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

				<Text mt={20}>
					<Anchor
						href={campaign?.campaign_link}
						target="_blank"
						c="dark"
						fw={700}
						size="xl"
						opacity={0.75}
					>
						Link to campaign overview
					</Anchor>
				</Text>

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
				<Text fw={800} c="pink">
					STEP 2
				</Text>
				<Text fz="h1" fw={600} c="dark">
					Planning Calendar |{" "}
					<Text fz="h1" fw={600} c="blue" span>
						2025
					</Text>
				</Text>
				<Text size="sm" c="dimmed" maw={600}>
					Explore your calendar and select the perfect dates for your
					marketing campaigns! Review the available slots, choose the
					campaigns that align with your goals, and schedule them to
					maximize your impact throughout the year.
				</Text>

				<div className="calendar-picker-group">
					<DatePicker
						type="range"
						size={size().size as any}
						numberOfColumns={size().col}
						columnsToScroll={1}
						minDate={firstDayOfYear}
						maxDate={lastDayOfYear}
						value={value}
						onChange={setValue}
						onNextMonth={(d) => setCurrentRange(monthsBetween(d))}
						onPreviousMonth={(d) =>
							setCurrentRange(monthsBetween(d))
						}
					/>
				</div>

				<div className="campaign-selector">
					<div className="filters">
						<Text fz="h2" fw={600} c="blue" mb="xl">
							Filters
						</Text>

						<div className="objectives">
							<Text fz="h3" fw={500} c="dark" mb="lg">
								Objectives
							</Text>
							<div className="all-objectives">
								<Checkbox.Group
									value={filters}
									onChange={setFilters}
									label="Your KPI Objectives"
									description="Filter and choose all your KPI objectives for this period."
								>
									<Stack pt="md" gap="xs">
										{cards(filtersData.objectives)}
									</Stack>
								</Checkbox.Group>
							</div>
						</div>

						<div className="objectives">
							<Text fz="h3" fw={500} c="dark" mb="lg">
								Topics
							</Text>
							<div className="all-objectives">
								<Checkbox.Group
									value={filters}
									onChange={setFilters}
									label="Your General Topics"
									description="Filter and choose all other topics for this period."
								>
									<Stack pt="md" gap="xs">
										{cards(filtersData.topics)}
									</Stack>
								</Checkbox.Group>
							</div>
						</div>

						<div className="objectives">
							<Text fz="h3" fw={500} c="dark" mb="lg">
								Selections
							</Text>
							<div className="all-objectives">
								<Checkbox.Group
									value={filters}
									onChange={setFilters}
									label="Your Selected Campaigns"
									description="All campaigns added to your campaign plan so far."
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

					<div className="blocks">
						<Text fz="h2" fw={600} c="blue" mb="xl">
							Campaigns
						</Text>

						<Text size="xl" fw={500} className="block-subtitle">
							All Campaigns
						</Text>

						<div className="mobile-filters">
							<MobileMultiSelect
								label="Your KPI Objectives"
								description="Filter and choose all your KPI objectives for this period."
								data={filtersData.objectives}
							/>
							<MobileMultiSelect
								label="Your General Topics"
								description="Filter and choose all other topics for this period."
								data={filtersData.topics}
							/>
						</div>

						<Text c="dimmed" size="sm" mt={25} mb={10}>
							Showing all available campaigns between{" "}
							<Text c="blue" size="sm" fw={600} span>
								{period}
							</Text>
						</Text>
						<div className="blocks-content">
							{allCampaigns && allCampaigns.length > 0 && (
								<Fragment>
									{campaingsByPeriod().map((cmp, i) => (
										<Fragment key={i}>
											{cmp !== undefined && (
												<Card
													radius="sm"
													withBorder
													className={clsx(
														"c-card",
														isChosen(
															cmp?.campaign_id
														) && "chosen"
													)}
													onClick={() => {
														if (
															isChosen(
																cmp?.campaign_id
															)
														) {
															setCampaignPlans(
																campaignPlans.filter(
																	(cp) =>
																		cp.campaign_id !==
																		cmp?.campaign_id
																)
															);
														} else {
															setCampaign(cmp);
														}
													}}
												>
													<Group mt="xs" mb="xs">
														<Text c="dark" fw={300}>
															{cmp.campaign_name}
														</Text>
													</Group>

													{isChosen(
														cmp?.campaign_id
													) ? (
														<Text
															c="blue"
															fw={700}
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
																stroke={1.5}
															/>
														</ActionIcon>
													)}
												</Card>
											)}
										</Fragment>
									))}
								</Fragment>
							)}
						</div>

						<Button
							fullWidth
							className="sticky-button"
							mt={50}
							size="lg"
							disabled={campaignPlans?.length < 1}
							loading={isPending}
							onClick={() => {
								mutate({
									...currentCampaign,
									campaign_plans: campaignPlans,
								});
							}}
						>
							Submit Campaign Plan
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Step2;
