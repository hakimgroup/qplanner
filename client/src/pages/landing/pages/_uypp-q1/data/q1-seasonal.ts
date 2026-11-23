/**
 * Q1 2027 Focus Toolkit — the seasonal Q1 campaigns.
 *
 * Two platforms on one page, as tabs, because the brief's whole framing is that
 * they are a pair: "Two Platforms, One Promise". Each has a territory, a human
 * truth, what it carries, a tone of voice and a way to bring it to life, and the
 * same five headings on both is what makes them comparable.
 *
 * There is no artwork yet. The brief says "Artwork and full campaign information
 * to follow" on all three seasonal slides, so the frames and tiles are
 * placeholders, labelled as such, and nothing here describes creative that does
 * not exist.
 */
import { Q1_ORDER } from "../../_uypp-q4/links";
import type { Campaign } from "../../_uypp-q4/types";
import type { RouteDetail } from "../RouteDetails";

export const Q1_SEASONAL: Campaign = {
	orderLabel: "Open your Marketing Planner",
	routes: [
		{
			id: "platform-a",
			name: "Platform A: Clinical Care",
			accent: "#1F5A5E",
			body: `<p><strong>Clinical / Technical Care: &ldquo;Because we care for you.&rdquo;</strong> Personal, uncompromised clinical care.</p>
				<p>People settle &mdash; for okay lenses, okay advice, and self-served answers off a supermarket shelf. Independents don&rsquo;t compromise on time, expertise or attention. With us, a number becomes a name.</p>
				<p>It positions your practice as the place for care that the supermarket and the multiples can&rsquo;t match: more time, more expertise and more attention for every patient. Best for practices who want to grow eye exam volume, myopia management, dry eye and lens upgrades.</p>`,
			note: `<p><strong>Tone of voice: expert, warm and plain-language.</strong> Always lead with the consumer&rsquo;s pain point, never the clinical feature. Never lead with &ldquo;myopia&rdquo; &mdash; lead with what the person is living. Say &ldquo;Do you want your child&rsquo;s eyes to stop getting worse?&rdquo;, not how effective the product is.</p>`,
			order: {
				label: "Open your planner",
				href: Q1_ORDER.platformA,
			},
			placements: [
				{
					key: "artwork",
					label: "Artwork",
					items: [
						{ ph: true, cap: "Platform A campaign artwork — to follow" },
						{ ph: true, cap: "Platform A in-practice materials — to follow" },
					],
				},
			],
		},
		{
			id: "platform-b",
			name: "Platform B: Self-Expression",
			accent: "#B03A6B",
			body: `<p><strong>Self-Expression / Look &amp; Feel: &ldquo;Treat you as an individual.&rdquo;</strong> Personal styling, personal shopper, personal care. You deserve more&hellip;</p>
				<p>Choice is overwhelming: around 64% of people feel overwhelmed by it, and around 74% abandon a purchase because of it. People don&rsquo;t want a wall of frames. They want someone with taste and care to put the right four in front of them &mdash; affordable luxury, and an experience with a dopamine hit.</p>
				<p><strong>The headline claim is curation and guidance: being chosen for, not choosing alone.</strong> Best for practices who want to drive conversion and ADV, and set the practice apart with premium and independent ranges.</p>`,
			note: `<p><strong>Tone of voice: confident, stylish and individual</strong> &mdash; the opposite of the conveyor belt.</p>`,
			order: {
				label: "Open your planner",
				href: Q1_ORDER.platformB,
			},
			placements: [
				{
					key: "artwork",
					label: "Artwork",
					items: [
						{ ph: true, cap: "Platform B campaign artwork — to follow" },
						{ ph: true, cap: "Platform B in-practice materials — to follow" },
					],
				},
			],
		},
	],
};

/**
 * Why Platform B's territory was chosen — the evidence behind its headline
 * claim, from the brief.
 *
 * Held out of the route copy on purpose. Inside the tab it made Platform B a
 * paragraph longer than Platform A, and the frame beside the copy is as tall as
 * the copy: with no artwork yet, that stretched an empty placeholder to most of
 * a screen. It reads better as its own point beside the comparison anyway — it
 * is about the market, not about what the practice does.
 */
export const PLATFORM_B_EVIDENCE =
	"Our market scan found this is the largest unclaimed territory in the category. Boots says \u201cpersonal\u201d but shows product; Ace & Tate owns design obsession, not guidance. It\u2019s also the best fit with the strongest 2026 consumer trend: decision fatigue, and \u201cbrands as editors, not catalogues\u201d.";

/** What each platform carries, side by side. The lists are the brief's. */
export const PLATFORM_CARRIES: { title: string; claim: string; items: string[] }[] = [
	{
		title: "Platform A carries",
		claim: "Because we care for you",
		items: [
			"Preventative health: the eye exam as a health check",
			"Myopia management",
			"Dry eye, including allergy and menopause iterations, and allergy care",
			"First-time varifocals and occupational lenses",
			"Contact lens health, and hearing, seeded through holistic care",
		],
	},
	{
		title: "Platform B carries",
		claim: "Treat you as an individual",
		items: [
			"Frames, brands and new-season collections, and sunglasses",
			"Contact lenses as confidence and look",
			"Gifting, styling events and multi-pair",
		],
	},
];

/** "Bringing it to life", by platform. */
export const SEASONAL_DETAILS: Record<string, RouteDetail> = {
	"platform-a": {
		period: "January – March",
		steps: [
			"Lead every conversation, recall and post with the patient's problem, then the solution.",
			"Talk about the eye exam as a health check, not a sight test.",
			"Use names, not numbers: personalise recalls and follow-ups.",
			"Pair with half term myopia management.",
		],
		support: "Artwork and full campaign information to follow.",
	},
	"platform-b": {
		period: "January – March",
		steps: [
			"Curate, don't catalogue: shortlist four frames for each patient rather than pointing to the wall.",
			"Offer styling appointments and personal shopper moments.",
			"Edit your displays and windows down to a few hero looks.",
			"Pair with our brand campaigns and independent eyewear brands.",
		],
		support: "Artwork and full campaign information to follow.",
	},
};
