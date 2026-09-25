/**
 * Festive Focus Toolkit — volume drivers.
 *
 * The assets the brief singles out as the "strong focus on high-performing
 * volume drivers": festive editions of "eye exams available" and "we accept
 * outside prescriptions", plus multi-pair — and split payment, added in
 * September as its own card beside it. Grouped on one page because a practice
 * does not choose between them: they are posters, they cost nothing to run
 * together, and the first two bring people in while the last two make the visit
 * worth more.
 *
 * All four order from their own Christmas cards — see FESTIVE_ORDER in links.ts.
 */
import { img } from "../uypp-q4";
import { FESTIVE_ORDER } from "../links";
import type { Campaign } from "../types";

/** Repeated on every route in this group and nowhere else, so it is written once.
 *  The posters differ; the reason they work in December does not. */
const WHY_DECEMBER =
	"December is a busy time on the high street. These posters exist to turn that footfall into appointments and dispenses during what is otherwise a quiet testing period.";

export const FESTIVE_VOLUME_DRIVERS: Campaign = {
	orderLabel: "Order these posters",
	routes: [
		{
			id: "eye-exams",
			name: "Eye Exams Available",
			accent: "#9E1F3D",
			visual: img("festive-easy-2.jpg"),
			visualFit: "cover",
			body: `<p>${WHY_DECEMBER}</p>
				<p>The simplest message a practice can put on the pavement, in a festive edition. No offer, no clinical language — just an open door and appointments available today. It fills quiet diary slots without ever reaching for a discount, and it works hardest in exactly the weeks the diary looks lightest.</p>
				<p>Alongside well-executed offers and brand activations, it supports conversion as well as volume: it brings both new and existing patients in while the high street is already busy.</p>`,
			note: `<p><strong>Two festive designs to choose from:</strong> a red cross-stitch that reads like a Christmas jumper, or a quieter gold star on a dark ground. Put an A-board outside and a poster in the window or inside the practice.</p>`,
			order: {
				label: "Order in the planner",
				href: FESTIVE_ORDER.eyeExams,
			},
			placements: [
				{
					key: "window",
					label: "Window",
					items: [
						{
							img: img("festive-easy-2.jpg"),
							cap: "Star design in a full festive window",
						},
						{
							img: img("festive-easy-3.jpg"),
							cap: "Cross-stitch design, with gifting alongside",
						},
						{
							img: img("festive-eye-exams-stitch-window.jpg"),
							cap: "Cross-stitch poster in the window",
						},
						{
							img: img("festive-eye-exams-star-window.jpg"),
							cap: "Star poster in the window",
						},
					],
				},
				{
					key: "aboard",
					label: "A-board",
					items: [
						{
							img: img("festive-eye-exams-stitch-aboard.jpg"),
							cap: "Cross-stitch A-board",
						},
						{
							img: img("festive-eye-exams-star-aboard.jpg"),
							cap: "Star A-board",
						},
					],
				},
				{
					key: "poster",
					label: "Poster",
					items: [
						{
							img: img("festive-eye-exams-stitch-poster.jpg"),
							cap: "Cross-stitch poster artwork",
						},
						{
							img: img("festive-eye-exams-star-poster.jpg"),
							cap: "Star poster artwork",
						},
					],
				},
				{
					key: "social",
					label: "Social",
					items: [
						{
							img: img("festive-eye-exams-stitch-social.jpg"),
							cap: "Cross-stitch social post",
						},
						{
							img: img("festive-eye-exams-star-social.jpg"),
							cap: "Star social post",
						},
					],
				},
			],
		},
		{
			id: "outside-rx",
			name: "Outside Prescriptions Welcome",
			accent: "#2F5D45",
			visual: img("festive-outside-rx-red-window.jpg"),
			visualFit: "cover",
			body: `<p>${WHY_DECEMBER}</p>
				<p>This one converts rather than recruits. It tells high-street shoppers that a prescription from somewhere else is welcome here, which catches last-minute needs for new glasses or lenses — including visiting family, who are in town for a fortnight and have nowhere else to go.</p>
				<p>It works well alongside whatever promotion is already live in the practice, and it is easy to add accessories, sunglasses and sports eyewear onto the dispense, which lifts ADV through the gifting period.</p>`,
			note: `<p><strong>Two festive designs to choose from:</strong> a red poster with a Santa-coat trim that says it plainly, or &ldquo;Your prescription. Our frames.&rdquo; for practices that want the frames to do the talking.</p>`,
			order: {
				label: "Order in the planner",
				href: FESTIVE_ORDER.outsideRx,
			},
			placements: [
				{
					key: "window",
					label: "Window",
					items: [
						{
							img: img("festive-outside-rx-red-window.jpg"),
							cap: "Red design in the window",
						},
						{
							img: img("festive-outside-rx-frames-window.jpg"),
							cap: "\u201cYour prescription. Our frames.\u201d in the window",
						},
					],
				},
				{
					key: "aboard",
					label: "A-board",
					items: [
						{
							img: img("festive-outside-rx-red-aboard.jpg"),
							cap: "Red A-board",
						},
						{
							img: img("festive-outside-rx-frames-aboard.jpg"),
							cap: "Frames A-board",
						},
					],
				},
				{
					key: "poster",
					label: "Poster",
					items: [
						{
							img: img("festive-outside-rx-red-poster.jpg"),
							cap: "Red poster artwork",
						},
						{
							img: img("festive-outside-rx-frames-poster.jpg"),
							cap: "Frames poster artwork",
						},
					],
				},
				{
					key: "social",
					label: "Social",
					items: [
						{
							img: img("festive-outside-rx-red-social.jpg"),
							cap: "Red social post",
						},
						{
							img: img("festive-outside-rx-frames-social.jpg"),
							cap: "Frames social post",
						},
					],
				},
			],
		},
		{
			id: "multi-pair",
			name: "Multi Pair",
			accent: "#A8802B",
			// Flat artwork, not a photograph, so it stays contained rather than
			// cropped — and a portrait poster fills the tall frame on its own.
			visual: img("festive-offer-fairisle-33.png"),
			body: `<p>${WHY_DECEMBER}</p>
				<p>A second pair is an easier conversation in December than at any other point in the year, because one of them can be a gift. The same visit, the same sight test, a materially larger dispense.</p>
				<p>It sits naturally on top of the other two: someone who came in because the A-board said appointments were available, or because you accept an outside prescription, is already in the chair.</p>`,
			note: `<p><strong>Two offers, four designs.</strong> 33% off additional pairs, or 50% off with a minimum spend of £200 — either way the discount applies to the cheapest pair. The designs match the eye exams and outside prescriptions posters, so the whole window reads as one. Pair it with split payment, next door, so the price of two pairs is not the reason someone leaves with one.</p>`,
			order: {
				label: "Order in the planner",
				href: FESTIVE_ORDER.multiPair,
			},
			// Supplied 25 September 2026 as "festive-offers". Captions use the same
			// design names as the eye exams and outside prescriptions tiles — the
			// team's files call them fairisle, tree, scallop and glasses.
			placements: [
				{
					key: "33",
					label: "33% off",
					items: [
						{
							img: img("festive-offer-fairisle-33.png"),
							cap: "Cross-stitch \u2014 33% off additional pairs",
						},
						{
							img: img("festive-offer-tree-33.png"),
							cap: "Star \u2014 33% off additional pairs",
						},
						{
							img: img("festive-offer-scallop-33.png"),
							cap: "Red \u2014 33% off additional pairs",
						},
						{
							img: img("festive-offer-glasses-33.png"),
							cap: "Frames \u2014 33% off additional pairs",
						},
					],
				},
				{
					key: "50",
					label: "50% off",
					items: [
						{
							img: img("festive-offer-fairisle-50.png"),
							cap: "Cross-stitch \u2014 50% off additional pairs, £200 minimum spend",
						},
						{
							img: img("festive-offer-tree-50.png"),
							cap: "Star \u2014 50% off additional pairs, £200 minimum spend",
						},
						{
							img: img("festive-offer-scallop-50.png"),
							cap: "Red \u2014 50% off additional pairs, £200 minimum spend",
						},
						{
							img: img("festive-offer-glasses-50.png"),
							cap: "Frames \u2014 50% off additional pairs, £200 minimum spend",
						},
					],
				},
			],
		},
		{
			// Supplied 25 September 2026 as its own planner card, and asked for as a
			// toggle beside Multi Pair rather than a tab inside it. Same four designs.
			id: "split-payment",
			name: "Split Payment",
			accent: "#2F4858",
			visual: img("festive-offer-tree-pay-later.png"),
			body: `<p>${WHY_DECEMBER}</p>
				<p>December is the month when a dispense competes with every other thing on the Christmas list. Splitting the cost into interest-free payments takes that competition away: the decision becomes whether the glasses are right, not whether this is the month to pay for them.</p>
				<p>It is the natural partner to Multi Pair. A second pair is an easier yes when the total can be spread, and it gives the team a straightforward answer to the patient who likes both frames but hesitates at the till.</p>`,
			note: `<p><strong>See now, pay later.</strong> One message in the same four festive designs as the rest of the volume drivers: interest-free payment options, available now. Terms and conditions apply, so make sure the team knows the practice's terms before the poster goes up.</p>`,
			order: {
				label: "Order in the planner",
				href: FESTIVE_ORDER.splitPayment,
			},
			placements: [
				{
					key: "poster",
					label: "Poster",
					items: [
						{
							img: img("festive-offer-fairisle-pay-later.png"),
							cap: "Cross-stitch \u2014 See Now Pay Later",
						},
						{
							img: img("festive-offer-tree-pay-later.png"),
							cap: "Star \u2014 See Now Pay Later",
						},
						{
							img: img("festive-offer-scallop-pay-later.png"),
							cap: "Red \u2014 See Now Pay Later",
						},
						{
							img: img("festive-offer-glasses-pay-later.png"),
							cap: "Frames \u2014 See Now Pay Later",
						},
					],
				},
			],
		},
	],
};
