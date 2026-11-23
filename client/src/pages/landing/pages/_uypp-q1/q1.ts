/**
 * The Q1 2027 Focus Toolkit, as the shared toolkit shell consumes it.
 *
 * Q1 has no components or stylesheets of its own. It is the same design system
 * as Q4 and the Festive Focus Toolkit — the sections, the shell and both
 * stylesheets live in `../_uypp-q4/` and are imported from there — and what
 * belongs to Q1 is its content: this config, the four data files, the five pages
 * and one block (`RouteDetails`) the brief's structure needed.
 *
 * The brief divides itself into four parts on its opening slide, and those four
 * are the four pages here. Two of them hold a pair of activities side by side as
 * tabs, because the pair is the point: Platform A and Platform B are two halves
 * of one promise, and the half term campaigns are written to be run together.
 */
import type { NavLink } from "../_uypp-q4/CampaignShell";
import type { ToolkitConfig, ToolkitPage } from "../_uypp-q4/festive";

/** Base public path for Q1's own images. Shared marks — the Hakim Group logo,
 *  supplier logos already in use — stay with the Q4 assets. */
export const Q1_ASSETS = "/landing-assets/uypp-q1";

/** `q1img("q1-gradient.jpg")` -> "/landing-assets/uypp-q1/img/q1-gradient.jpg" */
export const q1img = (file: string) => `${Q1_ASSETS}/img/${file}`;

/** The brief's own cover background. The hero on the hub and on every page:
 *  campaign artwork is still to follow, and a brand ground says "Q1" without
 *  pretending to be a campaign. */
export const Q1_HERO = q1img("q1-gradient.jpg");

/** The hub. Follows `q3-campaigns` and `q4-campaigns`. */
export const Q1_HUB = "/landing/q1-campaigns";

/**
 * The sticky nav: the hub's three sections.
 *
 * No suffixes, unlike Q4's chips — the stylesheet hides a suffix below 820px, and
 * each of these already reads whole on a phone.
 */
export const Q1_NAV: NavLink[] = [
	{ href: `${Q1_HUB}#toolkit`, label: "Toolkit" },
	{ href: `${Q1_HUB}#platforms`, label: "Platforms" },
	{ href: `${Q1_HUB}#plan`, label: "Key dates" },
];

/** The brief's opening argument, carried under the cross-links on every page. */
export const Q1_PREMISE =
	"January to March can be a quieter period, so this edition is all about planning ahead: book in your key Q1 activity now, and set up your full 2027 marketing plan, so you can adapt as the year goes on rather than reacting to issues as they arise.";

/** Every page in the toolkit, in the order the brief lists them. */
export const Q1_PAGES: ToolkitPage[] = [
	{
		slug: "q1-get-ready",
		name: "Get ready for 2027",
		when: "Plan now",
		blurb: "Setting up your 2027 marketing and your Marketing Planner, now live, including booking your marketing call.",
		layer: "toolkit",
		count: "Planner now live",
		image: q1img("q1-planner-view.jpg"),
		cta: "Start planning",
	},
	{
		slug: "q1-seasonal-campaigns",
		name: "Seasonal Q1 campaigns",
		when: "January – March",
		blurb: "The two platforms behind our seasonal campaigns: clinical care, and self-expression. Both say what independents do that the high street can't.",
		layer: "toolkit",
		count: "2 platforms · artwork to follow",
		cta: "See both platforms",
	},
	{
		slug: "q1-half-term",
		name: "Half term",
		when: "February half term",
		blurb: "Myopia management and the family voucher. Two evergreen campaigns for a week when parents have no school day to work around.",
		layer: "toolkit",
		count: "2 campaigns",
		cta: "View campaigns",
	},
	{
		slug: "q1-brand-activations",
		name: "Brand activations",
		when: "January – March",
		blurb: "Our independent eyewear brands, plus Q1 window campaigns with Gotti, Design Eyewear Group and Orgreen.",
		layer: "toolkit",
		count: "Independent brands + 3 windows",
		cta: "View activations",
	},
];

export const Q1_TOOLKIT: ToolkitConfig = {
	name: "Q1 2027 Focus Toolkit",
	hub: Q1_HUB,
	nav: Q1_NAV,
	foot: "Unlock Your Practice Potential · Q1 2027 Focus Toolkit",
	premise: Q1_PREMISE,
	crosslinksLead:
		"The four parts work together. Plan the year first, then book the seasonal campaigns, half term and the brand activations into it.",
	pages: Q1_PAGES,
	feedbackLead:
		"Tell us how this toolkit is working for your practice: what's useful, what isn't, and what you'd like to see next quarter.",
};
