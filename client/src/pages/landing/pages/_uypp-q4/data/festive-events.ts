/**
 * Festive Focus Toolkit — in-practice events.
 *
 * The two event formats in the brief. Kept on one page because the decision a
 * practice is actually making is "do we run an event, and if so which shape" —
 * one evening or twelve days — and that is easier to answer with both in front of
 * you than on two separate pages.
 *
 * The 2025 caution on the hub belongs to this page: 12 Days of Christmas was the
 * most requested event last year, and ten practices dropped out because the daily
 * offers were not committed to in time. That is stated in the route copy rather
 * than buried, because it is the single most useful thing we know about it.
 */
import { FESTIVE_ORDER, MARKETING, MARKETING_LINK } from "../links";
import type { Campaign } from "../types";

/** The case for running any event at all, shared by both routes. */
const WHY_EVENTS =
	"Events are a strong way to support the festive period, and practices often see record days or weeks when a targeted one is scheduled.";

/** The running order the brief gives for both formats. */
const RUN_SHEET = `<h4 class="supplier__coltitle">Running it</h4>
	<ul>
		<li>Set a date and an audience — VIPs, lapsed patients, partners</li>
		<li>Send two invitations and one reminder, by email or SMS</li>
		<li>Prepare POS and a simple offer for the night itself</li>
		<li>On the night: a bookings desk, a styling rota, light refreshments</li>
		<li>Afterwards: thank patients, reserve favourites, book styling revisits</li>
	</ul>`;

export const FESTIVE_EVENTS: Campaign = {
	orderLabel: "Add this event to your plan",
	routes: [
		{
			id: "twelve-days",
			name: "12 Days of Christmas",
			accent: "#9E1F3D",
			body: `<p>${WHY_EVENTS}</p>
				<p>12 Days of Christmas runs a different incentive on each of twelve days, which is what lets it reach across demographics rather than appealing to one group. It builds anticipation — patients come back to see what today's offer is — and it gives you twelve separate reasons to contact them rather than one.</p>
				<p>Appointments booked during the run tend to convert more strongly and carry a higher average dispense value. Even where someone does not buy on the day, the experience and the styling follow-up do the work later.</p>`,
			note: `<p><strong>Decide your twelve offers before you announce it.</strong> This was the most requested event of 2025, but ten practices pulled out because the daily offers were not committed to in time. Twelve is not many if you start early, and it is a great deal if you start in December.</p>`,
			order: {
				label: "Open your planner",
				href: FESTIVE_ORDER.twelveDays,
			},
			placements: [
				{
					key: "invite",
					label: "Invitation",
					items: [{ ph: true, cap: "Email and SMS invitation — artwork to come" }],
				},
				{
					key: "instore",
					label: "In practice",
					items: [
						{ ph: true, cap: "Countdown POS — artwork to come" },
						{ ph: true, cap: "Daily offer card — artwork to come" },
					],
				},
				{
					key: "social",
					label: "Social",
					items: [{ ph: true, cap: "Social posts — artwork to come" }],
				},
			],
		},
		{
			id: "late-night-vip",
			name: "Late-night VIP",
			accent: "#3D305C",
			body: `<p>${WHY_EVENTS}</p>
				<p>A late-night VIP evening gives the event a premium feel, and appointments booked around it lead to higher conversion and a higher average dispense value. The festive high street is already open late across plenty of other trades, so a later opening is something shoppers are looking for rather than something you have to explain.</p>
				<p>An exclusive event with a premium look and feel gives shoppers a moment to themselves in a busy month. They may not buy on the night — the experience is what converts at the styling follow-up.</p>`,
			note: `<p><strong>Pair it with something to give away.</strong> It works hardest alongside a brand gift with purchase and whatever frames offer you are already running, so the evening has a reason to exist beyond the late opening. Questions: <a href="${MARKETING_LINK}">${MARKETING}</a></p>`,
			order: {
				label: "Open your planner",
				href: FESTIVE_ORDER.lateNightVip,
			},
			placements: [
				{
					key: "invite",
					label: "Invitation",
					items: [{ ph: true, cap: "VIP invitation — artwork to come" }],
				},
				{
					key: "instore",
					label: "In practice",
					items: [{ ph: true, cap: "Evening POS — artwork to come" }],
				},
			],
		},
	],
};

export { RUN_SHEET };
