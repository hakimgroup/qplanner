import Bespoke from "@/components/campaignsSetup/bespoke/Bespoke";
import Logo from "@/components/logo/Logo";
import StyledButton from "@/components/styledButton/StyledButton";
import { Colors } from "@/shared/shared.const";
import {
	Box,
	Flex,
	Text,
	Divider,
	Group,
	Badge,
	Card,
	rgba,
} from "@mantine/core";
import {
	IconChevronLeft,
	IconChevronRight,
	IconCircleFilled,
	IconGridDots,
} from "@tabler/icons-react";

/** =========================
 *  CONFIG & TYPES
 *  ========================= */
const LABEL_COL_WIDTH = 210; // Keep in sync across headers & rows

type Mode = "equal" | "proportional";

type Campaign = {
	id: string | number;
	title: string;
	start: string; // YYYY-MM-DD
	end: string; // YYYY-MM-DD
	color: string;
};

type GroupRowData = {
	id: string | number;
	name: string;
	dotColor: string;
	campaigns: Campaign[];
};

/** =========================
 *  DATE / POSITION UTILS
 *  ========================= */
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
			const s = new Date(c.start);
			const e = new Date(c.end);
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
 *  STATIC LABELS & SAMPLE DATA
 *  ========================= */
const monthsH1 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const monthsH2 = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// --- Sample grouped data (per half) ---
const H1_GROUPS: GroupRowData[] = [
	{
		id: "g1",
		name: "Downtown Vision Center",
		dotColor: "blue",
		campaigns: [
			{
				id: 1,
				title: "Designer Frames",
				start: "2025-03-15",
				end: "2025-04-10",
				color: "#7b88f3",
			},
			{
				id: 2,
				title: "Holiday Gift Card Promotion",
				start: "2025-06-10",
				end: "2025-06-30",
				color: "#f44f88",
			},
			// Overlap demo
			{
				id: 6,
				title: "Spring Clearance",
				start: "2025-04-01",
				end: "2025-04-20",
				color: "#3f8cff",
			},
		],
	},
	{
		id: "g2",
		name: "Riverside Eye Clinic",
		dotColor: "blue",
		campaigns: [
			{
				id: 7,
				title: "Contact Lens Week",
				start: "2025-02-05",
				end: "2025-02-18",
				color: "#2f7bdc",
			},
			{
				id: 8,
				title: "Family Vision Days",
				start: "2025-03-25",
				end: "2025-04-05",
				color: "#8e67ff",
			},
		],
	},
	{
		id: "g3",
		name: "Uptown Optics",
		dotColor: "blue",
		campaigns: [
			{
				id: 9,
				title: "Frames BOGO",
				start: "2025-05-10",
				end: "2025-05-28",
				color: "#ff6b6b",
			},
		],
	},
];

const H2_GROUPS: GroupRowData[] = [
	{
		id: "g4",
		name: "Downtown Vision Center",
		dotColor: "red",
		campaigns: [
			{
				id: 3,
				title: "Back to School",
				start: "2025-08-15",
				end: "2025-09-10",
				color: "#7b3ff3",
			},
			// Overlap demo
			{
				id: 5,
				title: "Freshers Promo",
				start: "2025-08-25",
				end: "2025-09-05",
				color: "#9b59ff",
			},
		],
	},
	{
		id: "g5",
		name: "Riverside Eye Clinic",
		dotColor: "red",
		campaigns: [
			{
				id: 10,
				title: "Autumn Savings",
				start: "2025-10-01",
				end: "2025-10-18",
				color: "#e74c3c",
			},
			{
				id: 11,
				title: "Wellness Check",
				start: "2025-11-05",
				end: "2025-11-25",
				color: "#ff9f43",
			},
		],
	},
	{
		id: "g6",
		name: "Uptown Optics",
		dotColor: "red",
		campaigns: [
			{
				id: 12,
				title: "Holiday Gift Cards",
				start: "2025-12-01",
				end: "2025-12-22",
				color: "#ff6b6b",
			},
		],
	},
];

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
	const { laneIndexById, lanes } = layoutLanes(group.campaigns);
	const laneCount = lanes.length;
	const containerHeight =
		16 + laneCount * laneHeight + (laneCount - 1) * laneGap;

	const calcPos = (c: Campaign) =>
		mode === "proportional"
			? getPositionProportional(
					c.start,
					c.end,
					rangeStartISO,
					rangeEndISO
			  )
			: getPositionEqual(c.start, c.end, rangeStartISO);

	return (
		<Card
			mt="lg"
			radius={10}
			bg={rgba(Colors.cream, 0.5)}
			style={{ overflow: "visible" }}
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
							<Box
								key={c.id}
								pos="absolute"
								style={{
									top,
									left: pos.left,
									width: `max(${pos.width}, ${minBlockWidth}px)`,
									height: laneHeight,
									backgroundColor: rgba(c.color, 0.85),
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
									border: `2px solid ${c.color}`,
								}}
								title={`${c.title} (${c.start}–${c.end})`}
							>
								<IconGridDots size={10} color="white" />
								<Text
									size="xs"
									fw={700}
									truncate
									// for safety if not using truncate:
									// style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}
									style={{ minWidth: 0 }}
									title={c.title}
								>
									{c.title}
								</Text>
							</Box>
						);
					})}
				</Box>
			</Flex>
		</Card>
	);
}

/** =========================
 *  MAIN COMPONENT
 *  ========================= */
export default function CampaignTimeline({
	mode = "equal",
	h1Groups = H1_GROUPS,
	h2Groups = H2_GROUPS,
}: {
	mode?: Mode;
	h1Groups?: GroupRowData[];
	h2Groups?: GroupRowData[];
}) {
	// derive total planned for header badge
	const plannedCount =
		h1Groups.reduce((n, g) => n + g.campaigns.length, 0) +
		h2Groups.reduce((n, g) => n + g.campaigns.length, 0);

	return (
		<Box p="md">
			{/* Year Header And Selector */}
			<Flex align="center" justify="space-between">
				<Group align="center" gap={15}>
					<Text
						fz={"h1"}
						fw={700}
						variant="gradient"
						gradient={{ from: "blue.3", to: "red.4", deg: 180 }}
					>
						2025
					</Text>

					<Group align="center" gap={5}>
						<StyledButton>
							<IconChevronLeft size={17} />
						</StyledButton>
						<StyledButton>Today</StyledButton>
						<StyledButton>
							<IconChevronRight size={17} />
						</StyledButton>
					</Group>
				</Group>

				<Flex align="center" gap={10}>
					<Badge variant="outline" color="gray.1">
						<Text size="sm" fw={600} c={"gray.9"}>
							{plannedCount} campaigns planned
						</Text>
					</Badge>
					<Bespoke buttonText="Add Campaign" />
				</Flex>
			</Flex>

			<Flex mt="lg" direction="column" gap="xl">
				{/* ---------- H1 ---------- */}
				<Box>
					<Flex align="center" mb="sm" gap={"sm"}>
						<Logo isSmall text="H1" />
						<Text size="xl" fw={600}>
							First Half - 2025
						</Text>
					</Flex>

					<QuarterRow
						mode={mode}
						color="blue.3"
						year={2025}
						startMonth0={0}
					/>
					<MonthRow
						mode={mode}
						labels={monthsH1}
						year={2025}
						startMonth0={0}
					/>

					{h1Groups.map((g) => (
						<CampaignRow
							key={g.id}
							mode={mode}
							group={g}
							rangeStartISO="2025-01-01"
							rangeEndISO="2025-06-30"
						/>
					))}
				</Box>

				{/* ---------- H2 ---------- */}
				<Box>
					<Flex align="center" mb="sm" gap={"sm"}>
						<Logo isSmall text="H2" />
						<Text size="xl" fw={600}>
							Second Half - 2025
						</Text>
					</Flex>

					<QuarterRow
						mode={mode}
						color="red.5"
						year={2025}
						startMonth0={6}
					/>
					<MonthRow
						mode={mode}
						labels={monthsH2}
						year={2025}
						startMonth0={6}
					/>

					{h2Groups.map((g) => (
						<CampaignRow
							key={g.id}
							mode={mode}
							group={g}
							rangeStartISO="2025-07-01"
							rangeEndISO="2025-12-31"
						/>
					))}
				</Box>
			</Flex>
		</Box>
	);
}
