/**
 * Festive Focus Toolkit — Local PR, Give the Gift of Sight.
 *
 * The only item in the toolkit that does not run through the Marketing Planner:
 * the PR team at HQ writes and places the story, so the practice's whole job is a
 * form and a photograph. It also carries the only hard deadline in the toolkit,
 * which is why the date is stated in the route copy, in the note and again on the
 * page rather than once.
 *
 * The photography guidance is the substance here. Practices that get no coverage
 * almost always sent a picture of a shopfront, so the list is deliberately
 * specific rather than encouraging.
 */
import { GIFT_OF_SIGHT } from "../links";
import type { Campaign } from "../types";

/** Stated on the page as well as here, so a change lands in both. */
export const PR_DEADLINE = "end of day, 11 December";

export const FESTIVE_LOCAL_PR: Campaign = {
	orderLabel: "Fill in the form",
	routes: [
		{
			id: "gift-of-sight",
			name: "Give the Gift of Sight",
			accent: "#3D305C",
			body: `<p>The PR team at HQ is running a campaign for Give the Gift of Sight Month, and sending it to press and media in your local area on your behalf. Coverage is completely free of charge.</p>
				<p>The story raises awareness of why eyes need regular care, while highlighting the services, products and clinical expertise in your practice. It reinforces your position as the trusted expert locally, and it reaches people who would not otherwise have a reason to think about you in December.</p>
				<p>All you provide is the form and a photograph. HQ writes it, places it and chases it.</p>`,
			note: `<p><strong>The deadline is ${PR_DEADLINE}.</strong> The form explains how the campaign works in full — fill it in before then and there is nothing further to do.</p>`,
			order: {
				label: "Fill in the form",
				href: GIFT_OF_SIGHT,
			},
			placements: [
				{
					key: "press",
					label: "Press",
					items: [{ ph: true, cap: "Press release template — to come" }],
				},
			],
		},
	],
};

/**
 * Why a submission gets no coverage, in the PR team's words. Lives with the
 * campaign rather than in the page so the two stay together if either moves.
 */
export const PHOTO_TIPS: { tip: string; why: string }[] = [
	{
		tip: "Include people",
		why: "A shopfront on its own, or a display of frames, will not be used. Editors want faces.",
	},
	{
		tip: "Match the photo to the story",
		why: "If the release is about getting eyes checked regularly, send a photo of a patient having an eye exam.",
	},
	{
		tip: "Keep offers out of shot",
		why: "Posters in the window are usually time-sensitive, and a dated offer makes the picture unusable a fortnight later.",
	},
	{
		tip: "Shoot landscape",
		why: "News outlets prefer it, and a portrait photo is often the reason a story runs without a picture.",
	},
	{
		tip: "Get permission",
		why: "Everyone in the photo should be happy to appear, and you need copyright permission to send it — with any photographer's watermark removed.",
	},
	{
		tip: "Caption it",
		why: "Who is who, left to right, with full names and roles, plus a line on what is happening.",
	},
	{
		tip: "Send something new",
		why: "The same image used repeatedly stops being picked up.",
	},
];
