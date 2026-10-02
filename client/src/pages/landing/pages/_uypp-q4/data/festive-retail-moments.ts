/**
 * Festive Focus Toolkit — retail moments.
 *
 * Black Friday and the December sale. Both are the same mechanic — a time-limited
 * reason to buy now rather than later — separated by four weeks, so they belong
 * together: a practice running one should be deciding at the same time whether to
 * run the other.
 *
 * Black Friday already has a planner card and a full Q4 campaign page of its own.
 * This page is the festive framing of it and links there for the artwork rather
 * than duplicating it.
 */
import { img } from "../uypp-q4";
import { FESTIVE_ORDER } from "../links";
import type { Campaign } from "../types";

export const FESTIVE_RETAIL_MOMENTS: Campaign = {
	orderLabel: "Add this to your plan",
	routes: [
		{
			id: "black-friday",
			name: "Black Friday",
			accent: "#15131A",
			visual: img("bf-strip-window-situ.jpg"),
			visualFit: "cover",
			body: `<p>Black Friday is the biggest retail moment of the year and patients are actively looking for value. The campaign positions the practice to capture that demand and encourages people to act now rather than delay a purchase they were going to make anyway.</p>
				<p>Clear, time-limited messaging creates the urgency. It is also the easiest month to showcase frame ranges, sunglasses and lens upgrades, which is where the average transaction value comes from.</p>
				<p>The mechanic is yours. Discontinued frames to clear, a multi-pair offer, a lens upgrade — Black Friday is the lever, the promotion behind it is a local decision.</p>`,
			note: `<p><strong>Use the BLK Friday discount code in Optix.</strong> In Optix 1, do <em>not</em> use the "discount to amount" option: it erases the primary discount code and defaults to no code, so the promotion stops being reportable.</p>`,
			order: {
				label: "Order in the planner",
				href: FESTIVE_ORDER.blackFriday,
			},
			action: {
				label: "See the Q4 artwork",
				href: "/landing/black-friday",
			},
			placements: [
				{
					key: "window",
					label: "Window",
					items: [
						{ img: img("bf-strip-window-situ.jpg"), cap: "Strip treatment" },
						{ img: img("bf-arrow-window-situ.jpg"), cap: "Arrow treatment" },
						{ img: img("bf-block-window-situ.jpg"), cap: "Block treatment" },
					],
				},
				{
					key: "example",
					label: "In practice",
					items: [
						{
							img: img("bf-example-silverberg.jpg"),
							cap: "30% off sunglasses — how Silverberg Opticians ran it in 2025",
						},
					],
				},
				{
					key: "email",
					label: "Email",
					items: [{ img: img("bf-strip-email-header.jpg"), cap: "Email header, strip treatment" }],
				},
			],
		},
		{
			id: "december-sale",
			name: "December Sale",
			accent: "#5E2750",
			// Supplied 2 October 2026. Flat artwork with a space for the practice's
			// own offer line, so contained rather than cropped.
			visual: img("festive-sale-poster.jpg"),
			body: `<p>The sale period now runs on through December rather than stopping when Black Friday does. That is a month of shoppers who have left it late, and a sale is the simplest way to convert them.</p>
				<p>Run alongside the volume drivers elsewhere in this toolkit, it makes the most of last-minute gift shoppers who are already on the high street. It works particularly well with later opening times and an in-practice event, which together make the practice a destination for gifting rather than somewhere people pass.</p>`,
			note: `<p><strong>The poster carries your offer, not ours.</strong> Order it in the planner and the offer line is set for your practice, so the same artwork works for a frames clearance, a lens upgrade or a percentage off the lot.</p>
				<p><strong>Running a multi-pair offer instead?</strong> The festive 33% and 50% off additional pairs posters, and the split payment posters, are ready on the <a href="/landing/festive-volume-drivers">Volume drivers</a> page.</p>`,
			order: {
				label: "Order in the planner",
				href: FESTIVE_ORDER.decemberSale,
			},
			placements: [
				{
					key: "poster",
					label: "Poster",
					items: [
						{
							img: img("festive-sale-poster.jpg"),
							cap: "Christmas sale poster \u2014 your offer goes where the placeholder line is",
						},
					],
				},
			],
		},
	],
};
