/**
 * Q1 2027 Focus Toolkit — Get ready for 2027.
 *
 * Two slides in the brief: "Setting up your 2027 marketing", which is advice, and
 * "Your 2027 Marketing Planner", which is a thing you can open. The page is built
 * the same way round. The advice is the page's own argument — its hook, its
 * reasons, its five steps — and the Planner is the one route, because it is the
 * only part with something to show and somewhere to go.
 *
 * Making the advice a second route would have given it a tab and an empty frame
 * captioned "Creative to come", for a piece of guidance that has no creative.
 */
import { BOOK_MARKETING_CALL, Q1_ORDER } from "../../_uypp-q4/links";
import type { Campaign } from "../../_uypp-q4/types";
import { q1img } from "../q1";

export const Q1_GET_READY: Campaign = {
	orderLabel: "Open your Marketing Planner",
	routes: [
		{
			id: "planner",
			name: "Your 2027 Marketing Planner",
			accent: "#3D305C",
			// The brief's own screenshot, which it marks as the 2026 view to be
			// replaced. It is twice as wide as it is tall, and the frame is as tall
			// as the copy beside it, so contained it sat as a thin strip in an
			// empty mat. Filled from the top-left instead: that corner holds the
			// Planner's name, its filters and the first campaign card, which is
			// the part that says what the thing is. The whole screenshot is one
			// click away in the lightbox.
			visual: q1img("q1-planner-view.jpg"),
			visualFit: "cover",
			visualPosition: "0% 0%",
			body: `<p><strong>Now live.</strong> Your 2027 Marketing Planner is open, so you can start adding your campaigns today.</p>
				<p>It brings together all campaigns, assets and event opportunities in one place, so you can build your plan for the year ahead and see it all in a clear calendar view. Log in using your HG Microsoft credentials.</p>
				<p>During Q1 we will develop usability updates to help practices get the most from the Planner. We'll share these as they go live.</p>`,
			note: `<p><strong>Book your marketing call.</strong> Your Marketing Executive will build the plan with you: reviewing what worked in 2026, setting your priorities, and adding Q1 campaigns, half term activity and brand opt-ins to your Planner.</p>`,
			order: {
				label: "Open your Marketing Planner",
				href: Q1_ORDER.planner,
			},
			action: {
				label: "Book your marketing call",
				href: BOOK_MARKETING_CALL,
			},
		},
	],
};

/** The five steps from "Bringing it to life", in the brief's order. A sequence,
 *  so numbered on the page. */
export const PLAN_STEPS: { title: string; body: string }[] = [
	{
		title: "Look back at 2026",
		body: "Which campaigns drove the most exams and conversion, and where were the quiet weeks?",
	},
	{
		title: "Set your 2027 priorities",
		body: "Exam volume, myopia, contact lenses, conversion, ADV. Build the plan around your core KPIs.",
	},
	{
		title: "Map the key moments",
		body: "School half terms, seasonal campaigns, festive and local community events.",
	},
	{
		title: "One core campaign a month",
		body: "Add one core campaign per month, plus evergreen activity to fill any gaps.",
	},
	{
		title: "Note the lead times",
		body: "Assets, print and brand opt-ins often need ordering weeks in advance.",
	},
];

/** What the marketing call covers, from the Planner slide. */
export const CALL_AGENDA: string[] = [
	"Review what worked in 2026",
	"Set your priorities and core KPIs for 2027",
	"Add Q1 campaigns, half term activity and brand opt-ins to your Planner",
	"Plan bespoke assets, such as your myopia offer",
];

/** Who the planning guide is for. */
export const PLAN_AUDIENCE: string[] = [
	"Practice managers and owners",
	"Practice teams supporting local marketing",
];
