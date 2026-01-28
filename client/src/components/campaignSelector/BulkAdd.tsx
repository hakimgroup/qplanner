import {
	Flex,
	Modal,
	Stack,
	Title,
	Text,
	useMantineTheme,
	Card,
	Group,
	Grid,
	Badge,
	Button,
} from "@mantine/core";
import { IconCalendar, IconClockHour2, IconPlus } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	addDays,
	addWeeks,
	addMonths,
	differenceInCalendarDays,
	isAfter,
	isBefore,
	max as dateMax,
	min as dateMin,
	parseISO,
	isValid as isValidDate,
	format,
} from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { usePractice } from "@/shared/PracticeProvider";
import AppContext from "@/shared/AppContext";
import { useContext } from "react";
import CampaignDates from "@/components/campaignDates/CampaignDates";
import StyledButton from "@/components/styledButton/StyledButton";
import { useBulkAddCampaigns } from "@/hooks/campaign.hooks";

interface BulkAddProps {
	opened?: boolean;
	closeModal: () => void;
	selections: string[]; // array of campaign IDs (catalog IDs)
}

type DateRange = { from: Date | null; to: Date | null };
type Availability = { from: string; to: string } | null;

const toDate = (iso?: string | null) => {
	if (!iso) return null;
	const d = typeof iso === "string" ? parseISO(iso) : new Date(iso);
	return isValidDate(d) ? d : null;
};

const quickDateOptions = [
	{ name: "1 Week", type: "weeks" as const, amount: 1 },
	{ name: "2 Weeks", type: "weeks" as const, amount: 2 },
	{ name: "1 Month", type: "months" as const, amount: 1 },
	{ name: "2 Months", type: "months" as const, amount: 2 },
	{ name: "3 Months", type: "months" as const, amount: 3 },
];

const BulkAdd = ({ opened = false, closeModal, selections }: BulkAddProps) => {
	const T = useMantineTheme();
	const qc = useQueryClient();
	const { activePracticeId } = usePractice();
	const {
		state: { allCampaigns },
	} = useContext(AppContext);

	// Derive the selected catalog campaign rows from global campaigns
	const selectedCampaigns = useMemo(() => {
		if (!Array.isArray(allCampaigns?.data)) return [];
		const set = new Set(selections.map(String));
		return (allCampaigns.data as any[]).filter((c) =>
			set.has(String(c.id))
		);
	}, [allCampaigns?.data, selections]);

	// One week from today - minimum selectable date
	const oneWeekFromNow = useMemo(() => addDays(new Date(), 7), []);

	// Compute an intersection availability across selected campaigns (if any provide availability)
	const { minDate, maxDate } = useMemo(() => {
		// Gather all [from, to] date pairs for campaigns that have availability
		const pairs: Array<{ from: Date; to: Date }> = [];
		for (const c of selectedCampaigns) {
			const av = (c?.availability ?? null) as Availability;
			const from = toDate(av?.from ?? null);
			const to = toDate(av?.to ?? null);
			if (from && to) {
				pairs.push({ from, to });
			}
		}

		// Intersection = [max(all from), min(all to)]
		const safeMax = (arr: Date[]) =>
			arr.length ? dateMax(arr) : undefined;
		const safeMin = (arr: Date[]) =>
			arr.length ? dateMin(arr) : undefined;

		const maxFrom = safeMax(pairs.map((p) => p.from));
		const minTo = safeMin(pairs.map((p) => p.to));

		// Effective minDate is the later of (intersection start, one week from now)
		let effectiveMin: Date | undefined;
		if (maxFrom) {
			effectiveMin = isAfter(maxFrom, oneWeekFromNow) ? maxFrom : oneWeekFromNow;
		} else {
			effectiveMin = oneWeekFromNow;
		}

		if (pairs.length === 0) {
			return {
				minDate: oneWeekFromNow,
				maxDate: undefined as Date | undefined,
			};
		}

		if (maxFrom && minTo && isAfter(effectiveMin, minTo)) {
			// Empty intersection or dates too close -> still enforce one week minimum
			return { minDate: oneWeekFromNow, maxDate: undefined };
		}
		return { minDate: effectiveMin, maxDate: minTo };
	}, [selectedCampaigns, oneWeekFromNow]);

	// Default date range: use full availability if possible
	const defaultFrom = minDate ?? oneWeekFromNow;
	const defaultTo = maxDate ?? addDays(addMonths(defaultFrom, 1), -1);

	const [campaign, setCampaign] = useState<{ dateRange: DateRange }>({
		dateRange: { from: defaultFrom, to: defaultTo },
	});

	const { mutate: bulkAdd, isPending: creating } = useBulkAddCampaigns();

	// When availability changes (or modal opens), reinitialize default range
	useEffect(() => {
		setCampaign({ dateRange: { from: defaultFrom, to: defaultTo } });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened, minDate?.getTime(), maxDate?.getTime()]);

	const daysDuration = useMemo(() => {
		const { from, to } = campaign.dateRange;
		if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
		return differenceInCalendarDays(to, from) + 1; // inclusive
	}, [campaign.dateRange]);

	const scheduleText = useMemo(() => {
		const { from, to } = campaign.dateRange;
		if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
		return `${format(from, "EEEE, MMMM do, yyyy")} → ${format(
			to,
			"EEEE, MMMM do, yyyy"
		)}`;
	}, [campaign.dateRange]);

	// Apply quick option from current "from" (or minDate if not set)
	const safeStart = () => {
		const f = campaign.dateRange.from;
		return f && isValidDate(f) ? f : (minDate ?? oneWeekFromNow);
	};

	const applyQuickOption = (opt: (typeof quickDateOptions)[number]) => {
		const start = safeStart();
		let end: Date;
		if (opt.type === "weeks") {
			end = addDays(addWeeks(start, opt.amount), -1); // inclusive
		} else {
			end = addDays(addMonths(start, opt.amount), -1);
		}
		setCampaign((prev) => ({
			...prev,
			dateRange: { from: start, to: end },
		}));
	};

	// Disable a quick option if the proposed [start, end] would violate min/max bounds (when provided)
	const optionDisabled = (opt: (typeof quickDateOptions)[number]) => {
		const start = safeStart();
		let end: Date;
		if (opt.type === "weeks")
			end = addDays(addWeeks(start, opt.amount), -1);
		else end = addDays(addMonths(start, opt.amount), -1);

		// Validate against intersection bounds if present
		if (minDate && isBefore(start, minDate)) return true;
		if (maxDate && isAfter(end, maxDate)) return true;

		// Also guard start <= end
		if (isAfter(start, end)) return true;

		return false;
	};

	// Validation: must have valid from/to, start <= end, and at least one selection + practice
	const canSubmit = useMemo(() => {
		const { from, to } = campaign.dateRange;
		if (!from || !to || !isValidDate(from) || !isValidDate(to))
			return false;
		if (isAfter(from, to)) return false;
		if (!activePracticeId) return false;
		if (!Array.isArray(selections) || selections.length === 0) return false;

		// If min/max are defined, ensure the chosen range sits within
		if (minDate && isBefore(from, minDate)) return false;
		if (maxDate && isAfter(to, maxDate)) return false;

		return true;
	}, [campaign.dateRange, activePracticeId, selections, minDate, maxDate]);

	const handleCancel = () => closeModal();

	const handleConfirm = () => {
		if (!canSubmit) {
			toast.error("Please select a valid date range.");
			return;
		}

		const { from, to } = campaign.dateRange;

		bulkAdd(
			{
				campaignIds: selections, // array of catalog campaign IDs
				from: from as Date,
				to: to as Date,
				status: "onPlan",
				notes: null,
			},
			{
				onSuccess: () => {
					closeModal(); // cache invalidation is handled inside the hook
				},
				onError: (e: any) => {
					toast.error(e?.message ?? "Failed to add campaigns");
				},
			}
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={closeModal}
			title={
				<Stack gap={0}>
					<Flex align={"center"} gap={7}>
						<IconCalendar color={T.colors.blue[3]} size={22} />
						<Title order={4} fw={600}>
							Bulk Add Campaigns
						</Title>
					</Flex>

					<Text size="sm" c="gray.8">
						Set dates for {selections.length} selected campaign
						{selections.length === 1 ? "" : "s"}
					</Text>
				</Stack>
			}
			centered
			radius={10}
			size={"28rem"}
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
		>
			<Stack gap={20}>
				<CampaignDates
					icon={<IconCalendar size={16} />}
					dateRange={campaign.dateRange}
					minDate={minDate}
					maxDate={maxDate}
					onChange={(range) =>
						setCampaign((prev) => ({ ...prev, dateRange: range }))
					}
					startLabel="Start Date"
					endLabel="End Date"
					inputSize="md"
					labelSize="sm"
					titleLabelSize="sm"
					hideTitleIcon
				/>

				<Card bg={"#f6f6f8"} radius={10}>
					<Flex align={"center"} justify={"space-between"}>
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
										daysDuration === 1 ? "" : "s"
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
							const disabled = optionDisabled(d);
							return (
								<Grid.Col span={4} key={d.name}>
									<StyledButton
										fullWidth
										fw={500}
										fz={"xs"}
										disabled={disabled}
										onClick={() => {
											if (!disabled) applyQuickOption(d);
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
						<Text fw={600} size="xs" c={"gray.6"}>
							Campaign Schedule:
						</Text>
						<Text size="xs" c={"gray.6"}>
							{scheduleText ?? "—"}
						</Text>
					</Stack>
				</Card>

				<Flex justify={"flex-end"} gap={8}>
					<StyledButton onClick={handleCancel}>Cancel</StyledButton>
					<Button
						type="submit"
						radius={10}
						color="blue.3"
						loading={creating}
						disabled={!canSubmit}
						leftSection={<IconPlus size={14} />}
						onClick={handleConfirm}
					>
						Confirm Dates
					</Button>
				</Flex>
			</Stack>
		</Modal>
	);
};

export default BulkAdd;
