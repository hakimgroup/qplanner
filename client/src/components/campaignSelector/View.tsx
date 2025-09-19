import {
	Drawer,
	Flex,
	Badge,
	Stack,
	Divider,
	Card,
	Group,
	Grid,
	Button,
	Text,
	useMantineTheme,
} from "@mantine/core";
import {
	IconFileText,
	IconShare3,
	IconCalendar,
	IconClockHour2,
	IconPlus,
	IconEdit,
	IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import CampaignDates from "../campaignDates/CampaignDates";
import StyledButton from "../styledButton/StyledButton";
import { Campaign } from "@/models/campaign.models";
import { firstSentence } from "@/shared/shared.utilities";
import { toast } from "sonner";
import {
	addDays,
	addWeeks,
	addMonths,
	differenceInCalendarDays,
	format,
	isValid as isValidDate,
	isAfter,
	isBefore,
} from "date-fns";
import { useAddSelection, useDeleteSelection } from "@/hooks/selection.hooks";
import { SelectionStatus } from "@/shared/shared.models";
import Status from "../status/Status";
import Edit from "./Edit";
import { useDisclosure } from "@mantine/hooks";

interface Props {
	mode: "add" | "view";
	c: Campaign;
	opened: boolean;
	closeDrawer: () => void;
}

type DateRange = { from: Date | null; to: Date | null };

const View = ({ c, opened = false, closeDrawer, mode = "add" }: Props) => {
	const isAdd = mode === "add";
	const T = useMantineTheme();
	const [editOpened, { open: openEdit, close: closeEdit }] =
		useDisclosure(false);

	const availFrom = c.availability?.from
		? new Date(c.availability.from)
		: null;
	const availTo = c.availability?.to ? new Date(c.availability.to) : null;

	const defaultFrom = new Date(c.availability?.from);
	const defaultTo = addDays(addMonths(defaultFrom, 1), -1);

	const [campaign, setCampaign] = useState<{ dateRange: DateRange }>(() => ({
		dateRange: {
			from: defaultFrom,
			to: defaultTo,
		},
	}));

	const { mutate: addSelection, isPending: adding } =
		useAddSelection(closeDrawer);
	const { mutate: deleteSelection, isPending: deleting } =
		useDeleteSelection();

	const assets = [
		{ name: "back-to-school-flyer.pdf", type: "application/pdf" },
		{ name: "parent-education-video.mp4", type: "video/mp4" },
		{ name: "insurance-benefits-sheet.docx", type: "application/msword" },
	];

	const Objectives = ({ noTitle = false }) => (
		<Stack gap={5}>
			{!noTitle && (
				<Text size="xs" fw={500} c={"blue.3"}>
					OBJECTIVES
				</Text>
			)}
			<Flex align={"center"} gap={4}>
				{c.objectives.map((c) => (
					<Badge key={c} color="red.4">
						{c}
					</Badge>
				))}
			</Flex>
		</Stack>
	);

	const Topics = ({ noTitle = false }) => (
		<Stack gap={5}>
			{!noTitle && (
				<Text size="xs" fw={500} c={"blue.3"}>
					TOPICS
				</Text>
			)}
			<Flex align={"center"} gap={4}>
				{c.topics.map((c) => (
					<Badge key={c} variant="outline" color="gray.1">
						<Text size="xs" fw={600} c={"gray.9"}>
							{c}
						</Text>
					</Badge>
				))}
			</Flex>
		</Stack>
	);

	const quickDateOptions = [
		{ name: "1 Week", type: "weeks", amount: 1 },
		{ name: "2 Weeks", type: "weeks", amount: 2 },
		{ name: "1 Month", type: "months", amount: 1 },
		{ name: "2 Months", type: "months", amount: 2 },
		{ name: "3 Months", type: "months", amount: 3 },
	] as const;

	const safeStart = () => {
		const selected = campaign.dateRange.from;
		return selected && isValidDate(selected)
			? selected
			: availFrom ?? new Date();
	};

	const computeEnd = (
		start: Date,
		opt: (typeof quickDateOptions)[number]
	) => {
		if (opt.type === "weeks") {
			return addDays(addWeeks(start, opt.amount), -1); // inclusive
		}
		return addDays(addMonths(start, opt.amount), -1); // inclusive
	};

	const optionDisabled = (opt: (typeof quickDateOptions)[number]) => {
		if (!availFrom || !availTo) return false; // no availability window → don't disable
		let start = safeStart();

		// normalize start within availability
		if (isBefore(start, availFrom)) start = availFrom;
		if (isAfter(start, availTo)) start = availFrom;

		const end = computeEnd(start, opt);

		const startsBefore = isBefore(start, availFrom);
		const endsAfter = isAfter(end, availTo);
		return startsBefore || endsAfter;
	};

	const applyQuickOption = (opt: (typeof quickDateOptions)[number]) => {
		const start = safeStart();
		const end = computeEnd(start, opt);

		setCampaign((prev) => ({
			...prev,
			dateRange: { from: start, to: end },
		}));
	};

	const daysDuration = (() => {
		const { from, to } = campaign.dateRange;
		if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
		return differenceInCalendarDays(to, from) + 1; // inclusive
	})();

	const scheduleText = (() => {
		const { from, to } = campaign.dateRange;
		if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
		return `${format(from, "EEEE, MMMM do, yyyy")} → ${format(
			to,
			"EEEE, MMMM do, yyyy"
		)}`;
	})();

	const canSubmit =
		!!campaign.dateRange.from &&
		!!campaign.dateRange.to &&
		isValidDate(campaign.dateRange.from as Date) &&
		isValidDate(campaign.dateRange.to as Date);

	const handleAddToPlan = () => {
		if (!canSubmit) {
			toast.error("Please choose a valid start and end date");
			return;
		}

		addSelection(
			{
				campaign_id: c.id,
				from_date: format(
					campaign.dateRange.from as Date,
					"yyyy-MM-dd"
				),
				to_date: format(campaign.dateRange.to as Date, "yyyy-MM-dd"),
				status: SelectionStatus.OnPlan,
			},
			{
				onSuccess: () => {
					toast.success(`Added "${c.name}" to plan`);
					closeDrawer();
				},
				onError: (e: any) => {
					toast.error(e?.message ?? "Could not add to plan");
				},
			}
		);
	};

	const onRemove = () => {
		deleteSelection(c.selection_id, {
			onSuccess: () => {
				toast.success("Removed from plan");
				closeDrawer();
			},
			onError: (e: any) => toast.error(e.message ?? "Could not remove"),
		});
	};

	return (
		<>
			<Drawer
				size={"32rem"}
				opened={opened}
				onClose={closeDrawer}
				title={
					<Flex align={"center"} gap={5}>
						<Text fz={"h4"} fw={600}>
							{c.name}
						</Text>
						<Status status={c.status} />
					</Flex>
				}
				position="right"
				offset={8}
				radius={10}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<Stack gap={20} pb={20}>
					<Text c={"gray.7"} maw={400}>
						{firstSentence(c.description)}
					</Text>

					<Objectives />
					<Topics />
					<Divider size={"xs"} color="gray.1" />

					<Text fw={500} size="sm">
						Description
					</Text>
					<Text c="gray.7" size="sm">
						{c.description}
					</Text>

					<Divider size={"xs"} color="gray.1" />

					<Flex align={"center"} gap={5}>
						<IconFileText size={18} color={T.colors.blue[3]} />
						<Text fw={500} size="sm">
							Assets (3)
						</Text>
					</Flex>

					<Stack gap={8}>
						{assets.map((as) => (
							<Card
								key={as.name}
								bg={"#f6f6f8"}
								radius={10}
								style={{ cursor: "pointer" }}
								p={10}
							>
								<Flex
									align={"center"}
									justify={"space-between"}
								>
									<Group align={"center"} gap={8}>
										<IconFileText
											size={18}
											color={T.colors.gray[5]}
										/>
										<Stack gap={5}>
											<Text fw={500} size="sm">
												{as.name}
											</Text>
											<Text size="xs" c={"gray.5"}>
												{as.type}
											</Text>
										</Stack>
									</Group>
									<IconShare3
										size={18}
										color={T.colors.gray[9]}
									/>
								</Flex>
							</Card>
						))}
					</Stack>

					<Divider size={"xs"} color="gray.1" />

					{isAdd && (
						<>
							<Card bg={"#fbfbfc"} radius={10}>
								<Stack gap={25}>
									<Stack gap={3}>
										<Text fw={600} size="sm">
											Campaign Dates
										</Text>
										<Text c="gray.7" size="sm">
											Set the date range for "{c.name}"
										</Text>
									</Stack>

									<CampaignDates
										icon={<IconCalendar size={16} />}
										dateRange={campaign.dateRange}
										minDate={
											availFrom
												? new Date(availFrom)
												: undefined
										}
										maxDate={
											availTo
												? new Date(availTo)
												: undefined
										}
										onChange={(range) =>
											setCampaign((prev) => ({
												...prev,
												dateRange: range,
											}))
										}
										startLabel="Start Date"
										endLabel="End Date"
										inputSize="md"
										labelSize="sm"
										titleLabelSize="sm"
										hideTitleIcon
									/>

									<Card bg={"#f6f6f8"} radius={10}>
										<Flex
											align={"center"}
											justify={"space-between"}
										>
											<Group align={"center"} gap={10}>
												<IconClockHour2
													size={18}
													color={T.colors.gray[7]}
												/>
												<Text fw={500} size="sm">
													Duration:
												</Text>
											</Group>
											<Badge color="red.4">
												{daysDuration
													? `${daysDuration} day${
															daysDuration === 1
																? ""
																: "s"
													  }`
													: "-"}
											</Badge>
										</Flex>
									</Card>

									<Stack>
										<Text fw={500} size="sm">
											Quick Options
										</Text>

										<Grid gutter={8}>
											{quickDateOptions.map((d) => {
												const disabled =
													optionDisabled(d);
												return (
													<Grid.Col
														span={4}
														key={d.name}
													>
														<StyledButton
															fullWidth
															fw={500}
															fz={"xs"}
															disabled={disabled}
															onClick={() => {
																if (!disabled)
																	applyQuickOption(
																		d
																	);
															}}
														>
															{d.name}
														</StyledButton>
													</Grid.Col>
												);
											})}
										</Grid>
									</Stack>

									<Card bg={"#ecedfd"} radius={10}>
										<Stack gap={2}>
											<Text
												fw={600}
												size="xs"
												c={"gray.6"}
											>
												Campaign Schedule:
											</Text>
											<Text size="xs" c={"gray.6"}>
												{scheduleText ?? "—"}
											</Text>
										</Stack>
									</Card>
								</Stack>
							</Card>

							{mode === "add" && (
								<Button
									fullWidth
									radius={10}
									color="blue.3"
									leftSection={<IconPlus size={15} />}
									onClick={handleAddToPlan}
									loading={adding}
								>
									Add to Plan
								</Button>
							)}

							<Divider size={"xs"} color="gray.1" />
						</>
					)}

					<Text fw={500} size="sm">
						More Information
					</Text>

					<StyledButton
						link={c.more_info_link}
						leftSection={
							<IconShare3 size={18} color={T.colors.gray[9]} />
						}
					>
						Read more on SharePoint
					</StyledButton>

					{c.selected && (
						<>
							<Divider size={"xs"} color="gray.1" />

							<Grid gutter={10}>
								<Grid.Col span={8}>
									<StyledButton
										fullWidth
										leftSection={
											<IconEdit
												size={18}
												color={T.colors.gray[9]}
											/>
										}
										onClick={openEdit}
									>
										Edit Campaign
									</StyledButton>
								</Grid.Col>

								<Grid.Col span={4}>
									<Button
										fullWidth
										radius={10}
										color="red.4"
										leftSection={<IconX size={15} />}
										loading={deleting}
										onClick={onRemove}
									>
										Remove
									</Button>
								</Grid.Col>
							</Grid>
						</>
					)}

					{mode === "add" && (
						<Text fw={700} size="xs" ta={"center"}>
							Adding to{" "}
							<Text span fw={700} c="blue.4">
								{c.name}
							</Text>
						</Text>
					)}
				</Stack>
			</Drawer>

			<Edit opened={editOpened} closeModal={closeEdit} selection={c} />
		</>
	);
};

export default View;
