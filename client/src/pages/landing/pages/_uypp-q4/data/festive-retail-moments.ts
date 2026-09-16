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
			],
		},
		{
			id: "december-sale",
			name: "December Sale",
			accent: "#5E2750",
			body: `<p>The sale period now runs on through December rather than stopping when Black Friday does. That is a month of shoppers who have left it late, and a sale is the simplest way to convert them.</p>
				<p>Run alongside the volume drivers elsewhere in this toolkit, it makes the most of last-minute gift shoppers who are already on the high street. It works particularly well with later opening times and an in-practice event, which together make the practice a destination for gifting rather than somewhere people pass.</p>`,
			note: `<p><strong>Still being set up in the Marketing Planner.</strong> The button below opens your planner — or speak to your marketing executive and they will add it to your plan.</p>`,
			order: {
				label: "Open your planner",
				href: FESTIVE_ORDER.decemberSale,
			},
			placements: [
				{
					key: "window",
					label: "Window",
					items: [{ ph: true, cap: "Sale window poster — artwork to come" }],
				},
				{
					key: "instore",
					label: "In practice",
					items: [{ ph: true, cap: "In-practice sale POS — artwork to come" }],
				},
			],
		},
	],
};
