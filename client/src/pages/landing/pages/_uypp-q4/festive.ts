/**
 * The few things every Festive Focus Toolkit page needs to agree on.
 *
 * The toolkit reuses the Q4 components and stylesheets wholesale — it is the same
 * design system, and the brief is explicit that it should "sit visually within
 * Unlock Your Practice Potential, but clearly labelled as our Festive Focus
 * Toolkit". What it does not share is its index: these pages belong to the
 * toolkit hub, not the Q4 campaign hub, so the logo, the nav chips and the footer
 * all point here instead.
 */
import type { NavLink } from "./CampaignShell";

/** The toolkit hub. Every toolkit page links back here. */
export const TOOLKIT_HUB = "/landing/festive-toolkit";

/** Shown in the footer of every toolkit page, and in the hub's own footer. */
export const TOOLKIT_FOOT = "Festive Focus Toolkit · Unlock Your Practice Potential";

/**
 * The sticky nav, and the toolkit's argument in three words.
 *
 * These are the three layers of a festive plan, in the order a practice should
 * build them: get people through the door, give them a reason to come on a
 * particular day, then make it worth their while once they are in. The hub's
 * sections, the nav chips and the "build your plan" block all use this same order,
 * so the structure is stated three times in the same sequence rather than three
 * different ways.
 */
export const TOOLKIT_NAV: NavLink[] = [
	{ href: `${TOOLKIT_HUB}#drivers`, label: "Volume", suffix: " drivers" },
	{ href: `${TOOLKIT_HUB}#reasons`, label: "Reasons", suffix: " to visit" },
	{ href: `${TOOLKIT_HUB}#gifting`, label: "Gifting", suffix: " & goodwill" },
];

/**
 * The closing line carried by every toolkit sub-page, straight from the brief.
 *
 * Stated once here rather than retyped on six pages, because it is the sentence
 * that explains why the toolkit exists at all and it should not drift.
 */
export const TOOLKIT_PREMISE =
	"The toolkit is designed to support exam volume through December and January, using the quieter period as an opportunity rather than accepting that volume will be down.";

/**
 * Every page in the toolkit, in the order the hub presents them.
 *
 * One list, read by the hub's cards, the sub-pages' cross-links and the December
 * plan. Adding a page means adding it here and nowhere else — which is the only
 * reason the three stay in agreement, since they are three different renderings
 * of the same set.
 *
 * `layer` is the structural idea: a practice builds a festive plan by taking
 * something from each layer rather than by choosing one page. See TOOLKIT_NAV.
 */
export interface ToolkitPage {
	slug: string;
	name: string;
	/** When it runs, shown on the card tab. */
	when: string;
	/** One line on the card. */
	blurb: string;
	/** Which hub section it appears under. */
	layer: "drivers" | "reasons" | "gifting";
	/** How many separate activities the page covers, shown under the blurb. */
	count: string;
	/**
	 * Festive photography for the card, the cross-links and the page's own hero —
	 * a filename under `landing-assets/uypp-q4/img`, passed through `img()`.
	 *
	 * Only where a shot genuinely shows what the page is about. Events and local
	 * PR have none yet and keep the striped placeholder, which is more honest than
	 * borrowing a window display to illustrate a press release.
	 */
	image?: string;
}

export const TOOLKIT_PAGES: ToolkitPage[] = [
	{
		slug: "festive-volume-drivers",
		name: "Volume drivers",
		when: "December – January",
		blurb: "Festive editions of the posters that fill a quiet diary: eye exams available, outside prescriptions welcome, and multi pair.",
		layer: "drivers",
		count: "3 assets",
		image: "festive-easy-2.jpg",
	},
	{
		slug: "festive-in-practice",
		name: "In the practice",
		when: "December",
		blurb: "What the practice looks and sounds like in December — the window display, and the Merry Christmas message from the team.",
		layer: "drivers",
		count: "2 activities",
		image: "festive-easy-1.jpg",
	},
	{
		slug: "festive-events",
		name: "Events",
		when: "December",
		blurb: "A reason to come on a particular day. 12 Days of Christmas across the month, or a single late-night VIP evening — both stronger with a brand gift to hand out.",
		layer: "reasons",
		count: "2 formats",
	},
	{
		slug: "festive-retail-moments",
		name: "Retail moments",
		when: "November – December",
		blurb: "Black Friday and the December sale. The same mechanic four weeks apart, and both are yours to set locally.",
		layer: "reasons",
		count: "2 moments",
		image: "bf-strip-window-situ.jpg",
	},
	{
		slug: "festive-gifting",
		name: "Gifting & brand support",
		when: "December",
		blurb: "Accessories and stocking fillers front and centre, then supplier-funded gifts with purchase on BOSS, Oakley, Ted Baker and Design Eyewear.",
		layer: "gifting",
		count: "Accessories + 4 gifts, 4 activations",
		image: "festive-easy-3.jpg",
	},
	{
		slug: "festive-local-pr",
		name: "Local PR",
		when: "Deadline 11 December",
		blurb: "Give the Gift of Sight. HQ writes and places a story with your local press, free of charge — you send a form and a photograph.",
		layer: "gifting",
		count: "1 campaign",
	},
];

/** Look a page up by slug, for the cross-links. */
export const toolkitPage = (slug: string) =>
	TOOLKIT_PAGES.find((p) => p.slug === slug);
