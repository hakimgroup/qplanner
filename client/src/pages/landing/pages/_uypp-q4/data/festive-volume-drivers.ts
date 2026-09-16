/**
 * Festive Focus Toolkit — volume drivers.
 *
 * The three assets the brief singles out as the "strong focus on high-performing
 * volume drivers": festive editions of "eye exams available" and "we accept
 * outside prescriptions", plus multi-pair. Grouped on one page because a practice
 * does not choose between them — they are posters, they cost nothing to run
 * together, and the brief asks for all of them up at once.
 *
 * Two of the three already exist as planner cards: the toolkit repackages Q4 work
 * rather than creating new campaigns, so these order the same cards the evergreen
 * pages order. Multi-pair has no card yet — see FESTIVE_ORDER in links.ts.
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
			body: `<p>${WHY_DECEMBER}</p>
				<p>The simplest message a practice can put on the pavement, in a festive edition. No offer, no clinical language — just an open door and appointments available today. It fills quiet diary slots without ever reaching for a discount, and it works hardest in exactly the weeks the diary looks lightest.</p>
				<p>Alongside well-executed offers and brand activations, it supports conversion as well as volume: it brings both new and existing patients in while the high street is already busy.</p>`,
			note: `<p><strong>Put it where the footfall is.</strong> An A-board outside and a poster in the window or inside the practice. This is a new festive design, not the all-year version.</p>`,
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
							cap: "Festive window, eye exams available",
						},
						{
							img: img("festive-easy-3.jpg"),
							cap: "Dot-matrix treatment, with gifting alongside",
						},
					],
				},
				{
					key: "aboard",
					label: "A-board",
					items: [{ ph: true, cap: "Festive A-board — artwork to come" }],
				},
			],
		},
		{
			id: "outside-rx",
			name: "Outside Prescriptions Welcome",
			accent: "#2F5D45",
			body: `<p>${WHY_DECEMBER}</p>
				<p>This one converts rather than recruits. It tells high-street shoppers that a prescription from somewhere else is welcome here, which catches last-minute needs for new glasses or lenses — including visiting family, who are in town for a fortnight and have nowhere else to go.</p>
				<p>It works well alongside whatever promotion is already live in the practice, and it is easy to add accessories, sunglasses and sports eyewear onto the dispense, which lifts ADV through the gifting period.</p>`,
			note: `<p><strong>Your prescription, our frames.</strong> A new festive edition of the always-on asset, so it can go straight up alongside the rest of the toolkit.</p>`,
			order: {
				label: "Order in the planner",
				href: FESTIVE_ORDER.outsideRx,
			},
			placements: [
				{
					key: "aboard",
					label: "A-board",
					items: [{ ph: true, cap: "Festive A-board — artwork to come" }],
				},
				{
					key: "poster",
					label: "Poster",
					items: [{ ph: true, cap: "Window poster — artwork to come" }],
				},
			],
		},
		{
			id: "multi-pair",
			name: "Multi Pair",
			accent: "#A8802B",
			body: `<p>${WHY_DECEMBER}</p>
				<p>A second pair is an easier conversation in December than at any other point in the year, because one of them can be a gift. The same visit, the same sight test, a materially larger dispense.</p>
				<p>It sits naturally on top of the other two: someone who came in because the A-board said appointments were available, or because you accept an outside prescription, is already in the chair.</p>`,
			note: `<p><strong>Still being set up in the Marketing Planner.</strong> The button below opens your planner — search for the multi-pair assets there, or ask marketing and they will add it to your plan.</p>`,
			order: {
				label: "Open your planner",
				href: FESTIVE_ORDER.multiPair,
			},
			placements: [
				{
					key: "poster",
					label: "Poster",
					items: [{ ph: true, cap: "Multi-pair poster — artwork to come" }],
				},
				{
					key: "instore",
					label: "In practice",
					items: [{ ph: true, cap: "Dispensing-table support — artwork to come" }],
				},
			],
		},
	],
};
