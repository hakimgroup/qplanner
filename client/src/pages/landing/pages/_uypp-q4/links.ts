/**
 * Every ordering destination for the Q4 landing pages, in one place.
 *
 * Ported from the standalone `campaign-links.js`. No page or component should
 * contain a destination of its own — they all read from here.
 *
 * Two kinds of destination:
 *
 *   Planner deep links, supplied 26 August 2026. `/dashboard?campaign=<id>` opens
 *   the dashboard with that campaign's details drawer already open — see the
 *   landing README, "Linking to a specific campaign". Written as a root-relative
 *   path, not an absolute URL, so it follows the environment it is served from:
 *   the same link works on a Vercel preview and in production without a rewrite.
 *   `Cta` opens it in a new tab rather than routing in-app, so the visitor keeps
 *   the campaign page they were reading.
 *
 *   Requests, which go to the marketing team with a subject line so they can be
 *   triaged without being opened. The Q4 brief shows brand take-up runs through a
 *   rep, a BDM, a supplier form or an allocation, none of which has a URL we hold,
 *   and Festive Windows has no planner campaign yet.
 *
 * A campaign's creative directions share its link: the planner has one entry per
 * campaign, not per direction, so the direction is chosen inside the planner.
 */

export type CampaignId =
	| "presbyopia"
	| "menopause-dry-eye"
	| "black-friday"
	| "festive-windows"
	| "outside-prescriptions"
	| "eye-exams-available";

const MAIL = "mailto:marketing@hakimgroup.co.uk";
const ask = (subject: string) => `${MAIL}?subject=${encodeURIComponent(subject)}`;

const planner = (id: string) => `/dashboard?campaign=${id}`;

const PRESBYOPIA = planner("49fc2f96-6e7c-4d95-a7cf-a97ce5bc5f4a");
const DRY_EYE = planner("eb34e719-e674-4b95-b69d-cbe92afb0648");
const BLACK_FRIDAY = planner("6e0839c3-674b-42b4-b586-205b2d9422ea");
const OUTSIDE_RX = planner("d0780dcc-709e-4354-8fa2-fb8643c607bf");
const EYE_EXAMS = planner("8d0c111d-a127-49b3-a142-22065517518a");

/** Festive Windows is still being set up in the planner, now that Christmas
 *  gifting and party season has folded into it. Until it exists, ordering is a
 *  request. Replace this one constant when the campaign id arrives. */
const FESTIVE = ask("Festive Windows - campaign order");

/** The planner itself — the labelled fallback destination. */
export const PLANNER_HOME = "/dashboard";

const CAMPAIGN: Record<CampaignId, string> = {
	presbyopia: PRESBYOPIA,
	"menopause-dry-eye": DRY_EYE,
	"black-friday": BLACK_FRIDAY,
	"festive-windows": FESTIVE,
	"outside-prescriptions": OUTSIDE_RX,
	"eye-exams-available": EYE_EXAMS,
};

/** Supplier add-ons. Every one is a request; see the note at the top. */
const BRANDS: Record<CampaignId, Record<string, string | null>> = {
	presbyopia: {
		hoya: ask("Hoya brand assets - Presbyopia"),
		coopervision: ask("CooperVision brand assets - Presbyopia"),
		"bausch-lomb": ask("Bausch + Lomb brand assets - Presbyopia"),
	},
	"menopause-dry-eye": {
		thea: ask("Thea brand assets - Dry Eye and Menopause"),
		"body-doctor": ask("The Body Doctor opt-in - Dry Eye and Menopause"),
	},
	"black-friday": {
		// Promotion details still to follow — the block renders no button.
		scope: null,
	},
	"festive-windows": {
		boss: ask("BOSS gift with purchase - Festive Windows"),
		oakley: ask("Oakley gift with purchase - Festive Windows"),
		"ted-baker": ask("Ted Baker gift with purchase - sign up"),
		"design-eyewear": ask(
			"Design Eyewear Group gift with purchase - Festive Windows"
		),
		thea: ask("Thea brand assets - Festive Windows"),
		// Nothing confirmed yet — these render no button.
		silhouette: null,
		alcon: null,
		"bausch-lomb": null,
	},
	"outside-prescriptions": {},
	"eye-exams-available": {},
};

/** Campaign-level destination, shared by that campaign's creative directions. */
export function campaignLink(id: CampaignId): string {
	return CAMPAIGN[id] ?? PLANNER_HOME;
}

/** Supplier add-on destination, or null where there is nothing to take up yet. */
export function brandLink(id: CampaignId, brandId: string): string | null {
	return BRANDS[id]?.[brandId] ?? null;
}

/**
 * True where a destination is an email rather than a page.
 *
 * The only distinction `Cta` still needs to draw: a mailto hands off to the mail
 * client and must not open a tab, everything else opens in one.
 */
export const isMail = (href: string) => /^mailto:/i.test(href);
