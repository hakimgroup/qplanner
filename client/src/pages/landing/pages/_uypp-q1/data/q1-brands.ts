/**
 * Q1 2027 Focus Toolkit — brand activations.
 *
 * One focus and three windows. The focus is independent eyewear brands in
 * general, which a practice already stocks and can act on today; the windows are
 * brand-led campaigns from Gotti, Design Eyewear Group and Orgreen, which do not
 * have designs or dates yet and so can only be registered for.
 *
 * That difference is why the focus is the page's route and the windows are
 * supplier rows beneath it, rather than four tabs. A tab would give each window
 * a creative frame and a carousel, and there is nothing to put in either: the
 * three brief slides are word for word identical apart from the brand name. The
 * shared copy is therefore written once, below, and filled in per brand.
 */
import { img } from "../../_uypp-q4/uypp-q4";
import { BRAND_ACTIVATIONS, Q1_ORDER } from "../../_uypp-q4/links";
import type { Brand, Campaign } from "../../_uypp-q4/types";
import type { RouteDetail } from "../RouteDetails";
import { q1img } from "../q1";

/** One window row. The three slides differ only in the name, so the row is a
 *  function of it. */
const windowCampaign = (id: string, name: string, logo: string): Brand => ({
	id,
	name,
	logo,
	offer: "Q1 window campaign. Designs and timelines to be confirmed",
	body: `<p>Create a standout, brand-led window that stops passers-by and drives footfall and conversion into the ${name} range during Q1.</p>
		<p>A branded window gives patients an extra reason to step inside and helps drive dispenses into premium ranges. It works well alongside our Platform B Q1 campaign, Self-Expression / Look &amp; Feel.</p>`,
	products: [`${name} frames &mdash; ranges to be confirmed`],
	howto: `<p><strong>We&rsquo;re currently awaiting designs and timelines for this campaign.</strong> Register your interest now so you&rsquo;re first to hear when they are confirmed.</p>
		<p>In the meantime, plan your window space and make sure you have ${name} stock to display. Once live, display brand POS next to the ${name} frames in practice to stimulate interest and engagement, and brief your team so they can use the campaign to secure the dispense, or drive a lower spend dispense into a more premium range.</p>
		<p>Designs, timelines and any qualifying criteria will be shared once confirmed. Minimum stock levels and/or a sell-in requirement may apply. Keep your eye out for an email from <strong>${BRAND_ACTIVATIONS}</strong>.</p>`,
	// The brief's wording for the link. The standing rule would label a form
	// "Fill in form", which undersells a step that commits the practice to nothing.
	actionLabel: "Register your interest",
});

export const Q1_BRANDS: Campaign = {
	orderLabel: "Open your Marketing Planner",
	routes: [
		{
			id: "independent-brands",
			name: "Independent Eyewear Brands",
			accent: "#B03A6B",
			body: `<p>Independent eyewear brands set your practice apart from the high street multiples. In the new year, when patients are looking for a fresh start and something different, they&rsquo;re a strong way to drive conversion and increase average dispense value.</p>
				<p>They&rsquo;re the perfect partner for our Platform B Q1 campaign, Self-Expression / Look &amp; Feel. Display them alongside the Platform B in-practice materials to bring &ldquo;treat you as an individual&rdquo; to life &mdash; curated, distinctive frames chosen for the patient, not a wall of choice.</p>
				<p>Showcasing independent brands also reinforces your position as a destination practice with expertly curated collections.</p>`,
			note: `<p><strong>Brand list to be confirmed.</strong> Platform B artwork and full campaign information are to follow. For brand-specific support, contact <strong>${BRAND_ACTIVATIONS}</strong>.</p>`,
			order: {
				label: "Open your planner",
				href: Q1_ORDER.independentBrands,
			},
			placements: [
				{
					key: "instore",
					label: "In practice",
					items: [
						{ ph: true, cap: "Platform B in-practice materials — to follow" },
						{ ph: true, cap: "Independent brands display — image to come" },
					],
				},
			],
		},
	],
	brands: [
		windowCampaign("gotti", "Gotti", q1img("logo-gotti.png")),
		// The Design Eyewear Group row uses the Prodesign mark, as it does on the
		// festive pages — the group has no logo of its own in the asset set.
		windowCampaign("design-eyewear", "Design Eyewear Group", img("logo-prodesign.png")),
		windowCampaign("orgreen", "Orgreen", q1img("logo-orgreen.png")),
	],
};

/** "Bringing it to life" for the independent brands focus. */
export const BRAND_DETAILS: Record<string, RouteDetail> = {
	"independent-brands": {
		kpi: "Conversion and ADV",
		period: "January – March",
		steps: [
			"Pair your independent brands display with the Platform B in-practice materials, in your window and on the shop floor.",
			"Curate, don't catalogue: pick a few hero frames from your independent brands to shortlist for each patient.",
			"Brief your team on the story, design and craftsmanship behind each brand.",
			"Feature a different independent brand each month on social media.",
			"Consider a styling event to launch a new independent collection.",
		],
		products: ["Independent frame brands stocked in practice. Brand list to be confirmed."],
		audience: [
			"Style-conscious individuals looking for something unique",
			"Existing patients considering an upgrade or second pair",
			"New patients looking for an alternative to the high street",
		],
		support:
			"Platform B artwork and full campaign information to follow. For brand-specific support, contact brand.activations@hakimgroup.co.uk",
	},
};
