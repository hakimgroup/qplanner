/**
 * Festive Focus Toolkit — presence in the practice.
 *
 * What the practice looks and sounds like in December, as opposed to what it is
 * offering. The window is the loudest thing a practice owns on a busy high
 * street; the Merry Christmas HTML is the same message reaching the patients who
 * are not walking past.
 *
 * The window route is the Q4 Festive Windows campaign seen from the toolkit, so
 * it orders the same planner card and points at the same shopping list.
 */
import { FESTIVE_INSPIRATION, FESTIVE_ORDER } from "../links";
import type { Campaign } from "../types";

export const FESTIVE_IN_PRACTICE: Campaign = {
	orderLabel: "Add this to your plan",
	routes: [
		{
			id: "window",
			name: "Festive Window",
			accent: "#2F5D45",
			body: `<p>An impactful window display in December can set a practice up for the whole season. Standing out on a busy high street is the point, and a window that stops people is what connects the practice to everyone walking past it.</p>
				<p>There are two ways to get there. Off-the-shelf decor dresses the window quickly and cheaply — our creative team has put a premium display together as a shopping list you can order in one go. Or you can approach a local vendor and commission a bespoke design, which is how you end up being the talk of the high street.</p>
				<p>Either way it works hardest next to something to buy: a gift with purchase, a brand activation, whatever offer is already live. The window earns the footfall; the offer converts it.</p>`,
			note: `<p><strong>There is a group competition running on this.</strong> Windows are judged across the estate, so it is worth photographing yours once it is up.</p>`,
			order: {
				label: "Order festive posters",
				href: FESTIVE_ORDER.window,
			},
			action: {
				label: "See the shopping list",
				href: FESTIVE_INSPIRATION,
			},
			placements: [
				{
					key: "window",
					label: "Window",
					items: [
						{ ph: true, cap: "Off-the-shelf window — photography to come" },
						{ ph: true, cap: "Bespoke window — photography to come" },
					],
				},
				{
					key: "poster",
					label: "Festive posters",
					items: [{ ph: true, cap: "Festive poster set — see the Q4 campaign page" }],
				},
			],
		},
		{
			id: "merry-christmas",
			name: "Merry Christmas HTML",
			accent: "#9E1F3D",
			body: `<p>The festive period is about community and connection, and independent practices are a pillar of their communities across the estate. This is the piece that says so out loud.</p>
				<p>A Merry Christmas email from the whole practice team, so patients hear it from the people they actually see rather than from a brand. It costs nothing to send and it is the one December message with nothing to sell in it, which is exactly why it gets read.</p>
				<p>There is still room to keep gifting front of mind inside it. Sent alongside an event or a brand offer, it gives the practice a moment to stand out in a very crowded inbox.</p>`,
			note: `<p><strong>Send it from the practice, not from head office.</strong> Names and faces of the team do more here than a festive graphic will.</p>`,
			order: {
				label: "Open your planner",
				href: FESTIVE_ORDER.merryChristmas,
			},
			placements: [
				{
					key: "email",
					label: "Email",
					items: [{ ph: true, cap: "Merry Christmas HTML — artwork to come" }],
				},
			],
		},
	],
};
