/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CAMPAIGN INSPIRATION GALLERY — CONTENT FILE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  This is the only file you need to touch to add, edit or remove a campaign
 *  from the gallery. The page, the filter chips and the case-study modal all
 *  build themselves from the `CAMPAIGNS` array at the bottom.
 *
 *  TO ADD A CAMPAIGN
 *  1. Drop your images into `client/public/landing-assets/inspiration/`
 *     and reference them as `/landing-assets/inspiration/<file>.jpg`.
 *     (External URLs — S3, a CDN, anything — work just as well.)
 *  2. Copy an existing entry below, paste it at the TOP of the array
 *     (the gallery renders in array order, newest first by convention).
 *  3. Change the `id` to something unique and URL-safe — it becomes the
 *     deep link, e.g. `/landing/campaign-inspiration?campaign=your-id`.
 *  4. Fill in the rest. Everything marked `?` in the types is optional —
 *     leave it out entirely and that part of the case study won't render.
 *
 *  A NOTE ON `links`
 *  Each campaign carries its own list of buttons. Three shapes are supported
 *  and the page picks the right behaviour automatically:
 *
 *    { label: "See it on the planner", href: "/dashboard?campaign=abc" }
 *        → starts with "/", routes inside the planner (no page reload)
 *
 *    { label: "Talk to the marketing team", href: "mailto:marketing@..." }
 *        → opens the user's mail client
 *
 *    { label: "View the microsite", href: "https://..." }
 *        → opens in a new tab
 *
 *  The first link in the array is styled as the primary button; the rest are
 *  secondary. Two or three per campaign is the sweet spot.
 */

/** Filter categories. Add one here and a chip appears automatically. */
export const CATEGORIES = [
	"Brand",
	"Seasonal",
	"Student",
	"Clinical",
	"Local",
] as const;

export type CampaignCategory = (typeof CATEGORIES)[number];

export interface CampaignLink {
	label: string;
	/** Internal "/path", "mailto:…", or a full "https://…" URL. */
	href: string;
}

export interface CampaignMetric {
	/** The big number — keep it short. "+38%", "1.2m", "£4.10". */
	value: string;
	/** What it measures. "Bookings uplift", "Total reach". */
	label: string;
	/** Optional small print under the number — caveats, date ranges, sources. */
	hint?: string;
}

export interface CampaignImage {
	src: string;
	alt: string;
	caption?: string;
}

export interface CampaignEntry {
	/** Unique, URL-safe. Becomes the ?campaign= deep link. */
	id: string;
	title: string;
	category: CampaignCategory;
	/** Free text — "Q3 2026", "Summer 2026", "Sept–Nov 2026". */
	period: string;
	/** Card thumbnail and the banner at the top of the case study. */
	image: string;
	imageAlt: string;
	/** One or two sentences. Shown on the card in the grid. */
	summary: string;
	/** Optional headline numbers. Omit for a purely qualitative write-up. */
	metrics?: CampaignMetric[];
	/** The case study itself. One string per paragraph. */
	narrative: string[];
	/** Optional extra imagery — renders as a horizontal scrolling strip. */
	gallery?: CampaignImage[];
	/** Optional keyword pills shown at the foot of the case study. */
	tags?: string[];
	/** Buttons at the bottom of the case study. See the note above. */
	links?: CampaignLink[];
}

/** Central place to change the marketing inbox used by the seed entries. */
export const MARKETING_EMAIL = "marketing@hakimgroup.co.uk";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ⚠️  SEED CONTENT — PLACEHOLDER COPY AND PLACEHOLDER NUMBERS
 * ─────────────────────────────────────────────────────────────────────────────
 *  The six entries below exist so the gallery, the filters and the case-study
 *  modal all render with real images the moment you open the page. They reuse
 *  artwork already committed under /landing-assets/uypp/.
 *
 *  Every metric here is INVENTED. Replace the copy and the numbers with real
 *  campaign results before sharing this page with anyone outside the team.
 */
export const CAMPAIGNS: CampaignEntry[] = [
	{
		id: "care-you-can-see",
		title: "Care You Can See",
		category: "Brand",
		period: "Q3 2026",
		image: "/landing-assets/uypp/img/hero-care.jpg",
		imageAlt: "Care You Can See storefront creative in a practice window",
		summary:
			"The flagship brand campaign for Q3 — a storefront-led push built around the moment a patient walks past the practice.",
		metrics: [
			{
				value: "+38%",
				label: "Booking enquiries",
				hint: "Placeholder — vs. the preceding eight weeks",
			},
			{
				value: "212",
				label: "Practices live",
				hint: "Placeholder figure",
			},
			{
				value: "4.6m",
				label: "Estimated reach",
				hint: "Placeholder — combined OOH and social",
			},
		],
		narrative: [
			"Placeholder copy. Set out the problem the campaign was built to solve — what the practice was seeing before it ran, and what made this the right moment to act.",
			"Placeholder copy. Walk through what actually went into practice: the creative route chosen, the placements used, and anything the practice teams had to do to support it.",
			"Placeholder copy. Close on what you would repeat and what you would change. This is the part other practice managers will read most closely, so keep it candid.",
		],
		gallery: [
			{
				src: "/landing-assets/uypp/img/storefront.jpg",
				alt: "Storefront vinyl in situ",
				caption: "Storefront vinyl",
			},
			{
				src: "/landing-assets/uypp/img/poster-mounted.jpg",
				alt: "Mounted in-practice poster",
				caption: "In-practice poster",
			},
			{
				src: "/landing-assets/uypp/img/creative-card.jpg",
				alt: "Care You Can See creative card",
				caption: "Creative route",
			},
		],
		tags: ["Storefront", "OOH", "Social", "Print pack"],
		links: [
			{ label: "See the campaign page", href: "/landing/care-you-can-see" },
			{
				label: "Talk to the marketing team",
				href: `mailto:${MARKETING_EMAIL}?subject=Care%20You%20Can%20See%20campaign`,
			},
		],
	},
	{
		id: "equal-student-offer",
		title: "Equal Student Offer",
		category: "Student",
		period: "Q3 2026",
		image: "/landing-assets/uypp/img/student-a-posters.jpg",
		imageAlt: "Equal student offer poster artwork",
		summary:
			"A single, unambiguous student proposition running across every practice — built to be understood in three seconds on a noticeboard.",
		metrics: [
			{
				value: "+51%",
				label: "Student bookings",
				hint: "Placeholder — term-time weeks only",
			},
			{
				value: "18–24",
				label: "Core age band",
			},
		],
		narrative: [
			"Placeholder copy. Explain why the student segment needed its own campaign rather than a discount bolted onto the main brand work.",
			"Placeholder copy. Cover how the offer was kept identical across practices, and why that consistency mattered more than local flexibility here.",
		],
		gallery: [
			{
				src: "/landing-assets/uypp/img/student-a-social.jpg",
				alt: "Student offer social tiles",
				caption: "Social tiles",
			},
			{
				src: "/landing-assets/uypp/img/student-b-posters.jpg",
				alt: "Alternative student poster route",
				caption: "Alternative route",
			},
			{
				src: "/landing-assets/uypp/img/student-a-iptv.jpg",
				alt: "Student offer IPTV still",
				caption: "IPTV still",
			},
		],
		tags: ["Student", "Posters", "Social", "IPTV"],
		links: [
			{ label: "See the campaign page", href: "/landing/equal-student-offer" },
			{
				label: "Talk to the marketing team",
				href: `mailto:${MARKETING_EMAIL}?subject=Equal%20Student%20Offer`,
			},
		],
	},
	{
		id: "dual-wear",
		title: "Dual Wear",
		category: "Clinical",
		period: "Q3 2026",
		image: "/landing-assets/uypp/img/dual-posters.jpg",
		imageAlt: "Dual Wear poster artwork",
		summary:
			"Glasses and contacts as a pair, not a choice — a clinical-led campaign aimed at raising second-pair conversations at the chair.",
		metrics: [
			{
				value: "+22%",
				label: "Second-pair rate",
				hint: "Placeholder figure",
			},
			{
				value: "9",
				label: "Placement types",
			},
			{
				value: "6 wks",
				label: "Campaign window",
			},
		],
		narrative: [
			"Placeholder copy. Describe the clinical insight behind the campaign and how it was translated into something a patient would actually respond to.",
			"Placeholder copy. Note how the in-practice team was briefed, since this one depended on the conversation at the chair rather than the artwork alone.",
		],
		gallery: [
			{
				src: "/landing-assets/uypp/img/dual-aboard.jpg",
				alt: "Dual Wear pavement A-board",
				caption: "Pavement A-board",
			},
			{
				src: "/landing-assets/uypp/img/dual-strut.jpg",
				alt: "Dual Wear strut card",
				caption: "Counter strut card",
			},
			{
				src: "/landing-assets/uypp/img/dual-hero.jpg",
				alt: "Dual Wear hero creative",
				caption: "Hero creative",
			},
		],
		tags: ["Clinical", "Second pair", "A-board", "Strut card"],
		links: [
			{ label: "See the campaign page", href: "/landing/dual-wear" },
			{
				label: "Talk to the marketing team",
				href: `mailto:${MARKETING_EMAIL}?subject=Dual%20Wear%20campaign`,
			},
		],
	},
	{
		id: "welcome-to-summer",
		title: "Welcome to Summer",
		category: "Seasonal",
		period: "Summer 2026",
		image: "/landing-assets/uypp/img/hero.jpg",
		imageAlt: "Summer campaign hero creative",
		summary:
			"Three flagship campaigns bundled into one seasonal push, with a refreshed asset pack and dates locked in well ahead of launch.",
		metrics: [
			{
				value: "3",
				label: "Campaigns bundled",
			},
			{
				value: "8 wks",
				label: "Live window",
			},
		],
		narrative: [
			"Placeholder copy. Explain the thinking behind bundling rather than running the three campaigns separately, and what that did for practice uptake.",
			"Placeholder copy. Record how far ahead the dates were published and whether that lead time actually changed how practices planned.",
		],
		tags: ["Seasonal", "Bundle", "Asset pack"],
		links: [
			{ label: "See the campaign page", href: "/landing/welcome-to-summer" },
			{
				label: "Talk to the marketing team",
				href: `mailto:${MARKETING_EMAIL}?subject=Summer%20campaign`,
			},
		],
	},
	{
		id: "q3-campaign-hub",
		title: "Unlock Your Practice Potential",
		category: "Brand",
		period: "Q3 2026",
		image: "/landing-assets/uypp/img/creative-card.jpg",
		imageAlt: "UYPP campaign hub creative",
		summary:
			"The Q3 hub itself — one place for core campaigns, brand work and CPD, replacing the scattered PDFs practices were working from.",
		metrics: [
			{
				value: "1",
				label: "Hub, not 12 PDFs",
			},
			{
				value: "3",
				label: "Campaign routes",
			},
		],
		narrative: [
			"Placeholder copy. Cover why the hub was built and what it replaced. This one is as much an internal-process story as a marketing one.",
			"Placeholder copy. Note what practices said about finding things afterwards, and whether the hub reduced inbound questions to the marketing team.",
		],
		tags: ["Hub", "Internal", "CPD"],
		links: [
			{ label: "Open the Q3 hub", href: "/landing/q3-campaigns" },
			{
				label: "Talk to the marketing team",
				href: `mailto:${MARKETING_EMAIL}?subject=Q3%20campaign%20hub`,
			},
		],
	},
	{
		id: "local-practice-spotlight",
		title: "Local Practice Spotlight",
		category: "Local",
		period: "Rolling",
		image: "/landing-assets/uypp/img/aboard.jpg",
		imageAlt: "Local practice A-board on a high street",
		summary:
			"A lightweight, always-on template practices can localise themselves — the same frame, their own photography and copy.",
		narrative: [
			"Placeholder copy. This entry deliberately has no metrics, to show how a case study renders when the results are qualitative. The numbers row simply disappears.",
			"Placeholder copy. Use entries like this for evergreen templates and pilots where hard figures either don't exist yet or wouldn't mean much.",
		],
		tags: ["Local", "Template", "Always-on"],
		links: [
			{
				label: "Request the template",
				href: `mailto:${MARKETING_EMAIL}?subject=Local%20Practice%20Spotlight%20template`,
			},
		],
	},
];
