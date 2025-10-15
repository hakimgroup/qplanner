import Bespoke from "@/components/campaignsSetup/bespoke/Bespoke";
import Logo from "@/components/logo/Logo";
import { Colors, statusColors } from "@/shared/shared.const";
import {
	Box,
	Flex,
	Text,
	Divider,
	Group,
	Badge,
	Card,
	rgba,
	Stack,
	Spoiler,
} from "@mantine/core";
import { IconCircleFilled, IconGridDots } from "@tabler/icons-react";
import { Fragment, useContext, useMemo, useState } from "react";
import { usePractice } from "@/shared/PracticeProvider";
import AppContext from "@/shared/AppContext";
import { format } from "date-fns";
import { Campaign } from "@/models/campaign.models";
import Edit from "../Edit";
import { isEmpty } from "lodash";
import { status } from "@/filters.json";
import Event from "@/components/campaignsSetup/event/Event";

/** =========================
 *  CONFIG & TYPES
 *  ========================= */
const LABEL_COL_WIDTH = 210; // Keep in sync across headers & rows

type Mode = "equal" | "proportional";

type GroupRowData = {
	id: string | number;
	name: string;
	dotColor: string;
	campaigns: Campaign[];
};

/** =========================
 *  DATE / POSITION UTILS
 *  ========================= */
function statusToColor(status?: string | null) {
	if (!status) return "gray";
	// status is like "onPlan", "inProgress", etc.
	return (statusColors as Record<string, string>)[status] ?? "gray";
}

function daysInMonth(year: number, month0: number) {
	return new Date(year, month0 + 1, 0).getDate();
}

// inclusive end: add +1 day so the end date is visually included
function msInclusive(end: Date) {
	const d = new Date(end);
	d.setDate(d.getDate() + 1);
	return d;
}

function clamp01(n: number) {
	return Math.max(0, Math.min(1, n));
}

// PROPORTIONAL mode: exact day mapping across whole half
function getPositionProportional(
	startISO: string,
	endISO: string,
	rangeStartISO: string,
	rangeEndISO: string
) {
	const start = new Date(startISO);
	const end = new Date(endISO);
	const rangeStart = new Date(rangeStartISO);
	const rangeEnd = new Date(rangeEndISO);

	const total = msInclusive(rangeEnd).getTime() - rangeStart.getTime();
	const leftMs = start.getTime() - rangeStart.getTime();
	const widthMs = msInclusive(end).getTime() - start.getTime();

	const left = clamp01(leftMs / total) * 100;
	const width = clamp01(widthMs / total) * 100;
	return { left: `${left}%`, width: `${width}%` };
}

// EQUAL mode: 6 equal month cells with day precision inside each cell
function getPositionEqual(
	startISO: string,
	endISO: string,
	halfStartISO: string // "2025-01-01" or "2025-07-01"
) {
	const start = new Date(startISO);
	const end = new Date(endISO);
	const halfStart = new Date(halfStartISO);

	const monthIndex = (d: Date) => d.getMonth() - halfStart.getMonth(); // 0..5
	const dim = (d: Date) => daysInMonth(d.getFullYear(), d.getMonth());

	const startFrac = monthIndex(start) + (start.getDate() - 1) / dim(start);
	const endFrac = monthIndex(end) + end.getDate() / dim(end); // include end day

	const totalMonths = 6;
	const left = clamp01(startFrac / totalMonths) * 100;
	const width = clamp01((endFrac - startFrac) / totalMonths) * 100;
	return { left: `${left}%`, width: `${width}%` };
}

// Month/quarter widths for proportional headers
function getMonthWidthsForHalf(year: number, startMonth0: number) {
	const days = Array.from({ length: 6 }, (_, i) =>
		daysInMonth(year, startMonth0 + i)
	);
	const total = days.reduce((a, b) => a + b, 0);
	return days.map((d) => d / total);
}

function getQuarterWidthsFromMonths(monthFractions: number[]) {
	const q1 = monthFractions.slice(0, 3).reduce((a, b) => a + b, 0);
	const q2 = monthFractions.slice(3, 6).reduce((a, b) => a + b, 0);
	return [q1, q2];
}

/** =========================
 *  LANE LAYOUT (OVERLAP STACKING)
 *  ========================= */
type Interval = {
	id: Campaign["id"];
	startMs: number;
	endMsIncl: number;
	campaign: Campaign;
};

function toIntervals(campaigns: Campaign[]): Interval[] {
	return campaigns
		.map((c) => {
			const s = new Date(c.selection_from_date);
			const e = new Date(c.selection_to_date);
			return {
				id: c.id,
				startMs: s.getTime(),
				endMsIncl: msInclusive(e).getTime(),
				campaign: c,
			};
		})
		.sort((a, b) => a.startMs - b.startMs || a.endMsIncl - b.endMsIncl);
}

function layoutLanes(campaigns: Campaign[]) {
	const intervals = toIntervals(campaigns);
	const lanes: Interval[][] = [];
	const laneIndexById = new Map<Campaign["id"], number>();

	for (const it of intervals) {
		let placed = false;
		for (let li = 0; li < lanes.length; li++) {
			const lane = lanes[li];
			const last = lane[lane.length - 1];
			if (last.endMsIncl <= it.startMs) {
				lane.push(it);
				laneIndexById.set(it.id, li);
				placed = true;
				break;
			}
		}
		if (!placed) {
			lanes.push([it]);
			laneIndexById.set(it.id, lanes.length - 1);
		}
	}

	// Convert lanes back to campaigns for convenience if needed
	const campaignLanes = lanes.map((lane) => lane.map((x) => x.campaign));
	return { lanes: campaignLanes, laneIndexById };
}

/** =========================
 *  STATIC LABELS
 *  ========================= */
const monthsH1 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const monthsH2 = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** =========================
 *  HEADER ROWS
 *  ========================= */
function QuarterRow({
	mode,
	color,
	year,
	startMonth0, // 0 for H1, 6 for H2
}: {
	mode: Mode;
	color: string;
	year: number;
	startMonth0: number;
}) {
	const isH1 = startMonth0 === 0;
	const monthFractions =
		mode === "proportional"
			? getMonthWidthsForHalf(year, startMonth0)
			: Array(6).fill(1 / 6);
	const quarterFractions = getQuarterWidthsFromMonths(monthFractions);

	return (
		<Flex mt={30}>
			<Box w={LABEL_COL_WIDTH} />
			{quarterFractions.map((q, i) => (
				<Box key={i} style={{ width: `${q * 100}%` }}>
					<Text ta="center" mb={7} size="sm" fw={600} c={color}>
						{isH1
							? i === 0
								? `Q1 ${year}`
								: `Q2 ${year}`
							: i === 0
							? `Q3 ${year}`
							: `Q4 ${year}`}
					</Text>
					<Divider color={color} size="sm" />
				</Box>
			))}
		</Flex>
	);
}

function MonthRow({
	mode,
	labels,
	year,
	startMonth0,
}: {
	mode: Mode;
	labels: string[];
	year: number;
	startMonth0: number;
}) {
	const monthFractions =
		mode === "proportional"
			? getMonthWidthsForHalf(year, startMonth0)
			: Array(6).fill(1 / 6);

	return (
		<>
			<Flex mt="lg">
				<Box w={LABEL_COL_WIDTH} />
				{labels.map((m, i) => (
					<Box
						key={m}
						ta="center"
						style={{ width: `${monthFractions[i] * 100}%` }}
					>
						<Text size="xs" fw={500} c="gray.6">
							{m}
						</Text>
					</Box>
				))}
			</Flex>
			<Flex mt="sm">
				<Box w={LABEL_COL_WIDTH} />
				<Divider size="xs" flex={1} color="gray.1" />
			</Flex>
		</>
	);
}

/** =========================
 *  GROUPED CAMPAIGN ROW
 *  ========================= */
function CampaignRow({
	mode,
	group,
	rangeStartISO,
	rangeEndISO,
	laneHeight = 34,
	laneGap = 6,
	minBlockWidth = 10,
}: {
	mode: Mode;
	group: GroupRowData;
	rangeStartISO: string; // "2025-01-01" or "2025-07-01"
	rangeEndISO: string; // "2025-06-30" or "2025-12-31"
	laneHeight?: number;
	laneGap?: number;
	minBlockWidth?: number;
}) {
	const [cp, setCp] = useState<Campaign>(null);
	const { laneIndexById, lanes } = layoutLanes(group.campaigns);
	const laneCount = lanes.length;
	const containerHeight =
		16 + laneCount * laneHeight + (laneCount - 1) * laneGap;

	const calcPos = (c: Campaign) =>
		mode === "proportional"
			? getPositionProportional(
					c.selection_from_date,
					c.selection_to_date,
					rangeStartISO,
					rangeEndISO
			  )
			: getPositionEqual(
					c.selection_from_date,
					c.selection_to_date,
					rangeStartISO
			  );

	return (
		<>
			<Card
				mt="lg"
				radius={10}
				bg={rgba(Colors.cream, 0.5)}
				style={{ overflow: "visible" }}
				shadow="xs"
			>
				<Flex align="center">
					<Group
						align="center"
						gap={5}
						w={LABEL_COL_WIDTH}
						h={containerHeight}
					>
						<IconCircleFilled color={group.dotColor} size={12} />
						<Text size="sm" fw={600}>
							{group.name}
						</Text>
					</Group>

					<Box
						pos="relative"
						flex={1}
						style={{ height: containerHeight }}
					>
						{group.campaigns.map((c) => {
							const pos = calcPos(c);
							const lane = laneIndexById.get(c.id) ?? 0;
							const top = 8 + lane * (laneHeight + laneGap);

							return (
								<Fragment key={c.id}>
									<Box
										pos="absolute"
										style={{
											top,
											left: pos.left,
											width: `max(${pos.width}, ${minBlockWidth}px)`,
											height: laneHeight,
											backgroundColor: rgba(
												statusToColor(c.status),
												0.85
											),
											borderRadius: 6,
											color: "white",
											fontWeight: 700,
											display: "grid",
											gridAutoFlow: "column",
											gridTemplateColumns: "auto 1fr",
											alignItems: "center",
											columnGap: 5,
											padding: "0 8px",
											lineHeight: 1,
											border: `2px solid ${statusToColor(
												c.status
											)}`,
											cursor: "pointer",
										}}
										title={`${c.name} (${c.selection_from_date}–${c.selection_to_date})`}
										onClick={() => setCp(c)}
									>
										<IconGridDots size={10} color="white" />
										<Text
											size="xs"
											fw={700}
											truncate
											style={{ minWidth: 0 }}
											title={c.name}
										>
											{c.name}
										</Text>
									</Box>

									{!isEmpty(cp) && (
										<Edit
											selection={cp}
											opened={
												!isEmpty(cp) && cp.id === c.id
											}
											closeModal={() => setCp(null)}
										/>
									)}
								</Fragment>
							);
						})}
					</Box>
				</Flex>
			</Card>
		</>
	);
}

/** =========================
 *  MAIN COMPONENT
 *  ========================= */
export default function CampaignTimeline({ mode = "equal" }: { mode?: Mode }) {
	const calendarYear = 2026;

	const {
		state: {
			allCampaigns: { data },
		},
	} = useContext(AppContext);

	// We’ll use the current practice/unitedView to decide grouping.
	const { unitedView, activePracticeId, practices } = usePractice() as {
		unitedView: boolean;
		activePracticeId: string | null;
		practices?: { id: string; name: string }[];
	};

	const practiceName = (pid: string) => {
		const found = practices?.find((p) => String(p.id) === String(pid));
		return found?.name ?? pid;
	};

	// Build groups (H1 & H2) from selection dates.
	const { h1Groups, h2Groups } = useMemo(() => {
		const byPractice: Record<string, Campaign[]> = {};

		// Filter by context: single practice vs united (all practices current user can see are already represented in campaigns)
		const filtered = (data || []).filter((c) => {
			if (
				!c.selection_from_date ||
				!c.selection_to_date ||
				!c.selection_practice_id
			)
				return false;
			if (unitedView) return true;
			if (!activePracticeId) return false;
			return String(c.selection_practice_id) === String(activePracticeId);
		});

		// Transform into Campaign items grouped by practice
		for (const c of filtered) {
			const pid = c.selection_practice_id as string;
			if (!byPractice[pid]) byPractice[pid] = [];
			byPractice[pid].push(c);
		}

		// Split each practice’s campaigns into H1/H2 groups
		const groupsH1: GroupRowData[] = [];
		const groupsH2: GroupRowData[] = [];

		Object.entries(byPractice).forEach(([pid, list]) => {
			const name = practiceName(pid);
			const gH1: GroupRowData = {
				id: `${pid}-h1`,
				name,
				dotColor: "blue",
				campaigns: [],
			};
			const gH2: GroupRowData = {
				id: `${pid}-h2`,
				name,
				dotColor: "red",
				campaigns: [],
			};

			for (const it of list) {
				const startMonth = new Date(it.selection_from_date).getMonth(); // 0..11
				// If the campaign straddles halves, split into two bars so it renders cleanly in both halves.
				const endMonth = new Date(it.selection_to_date).getMonth();

				// boundaries
				const h1End = `${calendarYear}-06-30`;
				const h2Start = `${calendarYear}-07-01`;

				if (startMonth <= 5 && endMonth <= 5) {
					gH1.campaigns.push(it);
				} else if (startMonth >= 6 && endMonth >= 6) {
					gH2.campaigns.push(it);
				} else {
					// spans across: split at July 1
					const left: Campaign = { ...it, selection_to_date: h1End };
					const right: Campaign = {
						...it,
						selection_from_date: h2Start,
					};
					gH1.campaigns.push(left);
					gH2.campaigns.push(right);
				}
			}

			if (gH1.campaigns.length) groupsH1.push(gH1);
			if (gH2.campaigns.length) groupsH2.push(gH2);
		});

		return { h1Groups: groupsH1, h2Groups: groupsH2 };
	}, [data, unitedView, activePracticeId, practices]);

	// derive total planned for header badge
	const plannedCount =
		h1Groups.reduce((n, g) => n + g.campaigns.length, 0) +
		h2Groups.reduce((n, g) => n + g.campaigns.length, 0);

	return (
		<Box>
			{/* Year Header And Selector */}
			<Flex align="center" justify="space-between">
				<Text
					fz={"h1"}
					fw={700}
					variant="gradient"
					gradient={{ from: "blue.3", to: "red.4", deg: 180 }}
				>
					{/* {Number(format(new Date(), "yyyy"))} Planner Calendar */}
					{calendarYear} Planner Calendar
				</Text>

				<Flex align="center" gap={10}>
					<Badge variant="outline" color="gray.1">
						<Text size="xs" fw={500} c={"gray.9"}>
							{plannedCount} campaigns planned
						</Text>
					</Badge>

					{!unitedView && (
						<Group gap={10}>
							<Bespoke />
							<Event />
						</Group>
					)}
				</Flex>
			</Flex>

			<Stack mt="lg" gap="xl">
				{/* ---------- H1 ---------- */}
				<Spoiler
					maxHeight={645}
					showLabel={
						<Text fw={700} size="sm" c="red">
							Show all campaigns &#8594;
						</Text>
					}
					hideLabel={
						<Text fw={700} size="sm" c="red" mt={10}>
							Minimize view &#8594;
						</Text>
					}
				>
					<Box>
						<Flex align="center" mb="sm" gap={"sm"}>
							<Logo isSmall text="H1" />
							<Text size="xl" fw={600}>
								First Half - {calendarYear}
							</Text>
						</Flex>

						<QuarterRow
							mode={mode}
							color="blue.3"
							year={calendarYear}
							startMonth0={0}
						/>
						<MonthRow
							mode={mode}
							labels={monthsH1}
							year={calendarYear}
							startMonth0={0}
						/>

						{h1Groups.map((g) => (
							<CampaignRow
								key={g.id}
								mode={mode}
								group={g}
								rangeStartISO={`${calendarYear}-01-01`}
								rangeEndISO={`${calendarYear}-06-30`}
							/>
						))}
					</Box>
				</Spoiler>

				{/* ---------- H2 ---------- */}
				<Spoiler
					maxHeight={645}
					showLabel={
						<Text fw={700} size="sm" c="red">
							Show all campaigns &#8594;
						</Text>
					}
					hideLabel={
						<Text fw={700} size="sm" c="red" mt={10}>
							Minimize view &#8594;
						</Text>
					}
				>
					<Box>
						<Flex align="center" mb="sm" gap={"sm"}>
							<Logo isSmall text="H2" />
							<Text size="xl" fw={600}>
								Second Half - {calendarYear}
							</Text>
						</Flex>

						<QuarterRow
							mode={mode}
							color="red.5"
							year={calendarYear}
							startMonth0={6}
						/>
						<MonthRow
							mode={mode}
							labels={monthsH2}
							year={calendarYear}
							startMonth0={6}
						/>

						{h2Groups.map((g) => (
							<CampaignRow
								key={g.id}
								mode={mode}
								group={g}
								rangeStartISO={`${calendarYear}-07-01`}
								rangeEndISO={`${calendarYear}-12-31`}
							/>
						))}
					</Box>
				</Spoiler>

				<Card
					radius={10}
					bg={rgba(Colors.cream, 0.5)}
					style={{ overflow: "visible" }}
					shadow="xs"
				>
					<Text size="sm" fw={700}>
						Campaign Status Legend
					</Text>

					<Flex mt={20} gap={20}>
						{status.map((st) => (
							<Group key={st.value} align="center" gap={8}>
								<IconCircleFilled
									size={15}
									color={statusColors[st.value]}
								/>
								<Text size="xs">{st.label}</Text>
							</Group>
						))}
					</Flex>
				</Card>
			</Stack>
		</Box>
	);
}
