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
import { img } from "../uypp-q4";
import { FESTIVE_ORDER, MARKETING, MARKETING_LINK } from "../links";
import type { Brand, Campaign } from "../types";

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

/**
 * The gift-with-purchase brands, repeated from the gifting page.
 *
 * Added after the team's review: every event format works better with something
 * to hand over, and a practice planning one should be able to opt in from the
 * page they are already on. Only what an event organiser needs to decide is here
 * — the full qualifying criteria stay on the gifting page, which is the canonical
 * version.
 */
const EVENT_GWP_CASE =
	"<p>At an event, a gift with purchase does something it cannot do on an ordinary day: it gives the team a specific thing to offer at the moment someone is deciding, and it gives the evening a reason to have happened. Display it beside the relevant frames and brief everyone working that night.</p>";

const EVENT_BRANDS: Brand[] = [
	{
		id: "boss",
		name: "BOSS",
		logo: img("logo-boss.png"),
		group: "Gifts to hand out on the night",
		offer: "Five branded magnetic phone wallets, with BOSS frames",
		body: EVENT_GWP_CASE,
		gives: ["Five BOSS branded magnetic phone wallets per qualifying practice"],
		products: ["BOSS frames"],
		howto: "<p>The first 10 practices to purchase 12 pieces or more in a single order during September and October. Opt in below.</p>",
	},
	{
		id: "oakley",
		name: "Oakley",
		logo: img("logo-oakley.png"),
		group: "Gifts to hand out on the night",
		offer: "Ten Oakley baseball caps, with Oakley frames",
		body: EVENT_GWP_CASE,
		gives: ["Ten Oakley baseball caps per selected practice"],
		products: ["Oakley frames"],
		howto: "<p>Selected practices only — you will have had an email if yours is one. Opt in below.</p>",
	},
	{
		id: "ted-baker",
		name: "Ted Baker",
		logo: img("logo-ted-baker.png"),
		group: "Gifts to hand out on the night",
		offer: "Ten branded re-usable coffee mugs, with Ted Baker frames",
		body: EVENT_GWP_CASE,
		gives: ["Ten Ted Baker branded re-useable coffee mugs per qualifying practice"],
		products: ["Ted Baker frames"],
		howto: "<p>Opt in below to join the Ted Baker gifting campaign.</p>",
	},
	{
		id: "design-eyewear",
		name: "Design Eyewear Group",
		logo: img("logo-prodesign.png"),
		group: "Gifts to hand out on the night",
		offer: "A free sunglass with every optical frame purchase, on Prodesign and Face a Face",
		body: EVENT_GWP_CASE,
		gives: [
			"Prodesign: 10 sunglasses with any order over 20 pieces",
			"Prodesign: 10 pocket mirrors with any order over 15 pieces",
			"Face a Face: one Polaroid camera with any order over 20 pieces",
		],
		products: ["Prodesign", "Face a Face"],
		howto: "<p>Opt in to one or both campaigns using the form below. Capped and first come, first served.</p>",
	},
];

export const FESTIVE_EVENTS: Campaign = {
	orderLabel: "Add this event to your plan",
	brands: EVENT_BRANDS,
	routes: [
		{
			id: "twelve-days",
			name: "12 Days of Christmas",
			accent: "#9E1F3D",
			body: `<p>${WHY_EVENTS}</p>
				<p>12 Days of Christmas runs a different incentive on each of twelve days, which is what lets it reach across demographics rather than appealing to one group. It builds anticipation — patients come back to see what today's offer is — and it gives you twelve separate reasons to contact them rather than one.</p>
				<p>Appointments booked during the run tend to convert more strongly and carry a higher average dispense value. Even where someone does not buy on the day, the experience and the styling follow-up do the work later.</p>
				<p>Twelve days needs twelve things to give away or talk about, which is where the brand gifts with purchase below earn their place — a BOSS phone wallet or a Ted Baker mug is a day's incentive that costs the practice nothing.</p>`,
			note: `<p><strong>Worth locking your twelve offers in early.</strong> This was the most requested event of 2025, and several practices found it hard to land because the daily offers were not settled in time. Twelve is not many if you start now, and quite a lot come December.</p>`,
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
				<p>An exclusive event with a premium look and feel gives shoppers a moment to themselves in a busy month. They may not buy on the night — the experience is what converts at the styling follow-up.</p>
				<p>It works hardest with something to hand over. A supplier gift with purchase turns a nice evening into a reason to dispense that night, and the brands below are all funding one this December.</p>`,
			note: `<p><strong>Pair it with something to give away.</strong> A brand gift with purchase and whatever frames offer you are already running give the evening a reason to exist beyond the late opening. Questions: <a href="${MARKETING_LINK}">${MARKETING}</a></p>`,
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
