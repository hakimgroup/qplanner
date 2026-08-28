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
 *   Supplier sign-up forms, where the supplier collects the practice's details
 *   itself. The festive gift-with-purchase brands work this way.
 *
 *   Requests, which go to the marketing team with a subject line so they can be
 *   triaged without being opened. Used where take-up runs through a rep or an
 *   allocation rather than a form.
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

export const MARKETING = "marketing@hakimgroup.co.uk";

/**
 * Asking marketing something, as a link that actually opens.
 *
 * These were `mailto:` and silently did nothing for a lot of people. A mailto
 * needs a mail client registered as the protocol handler, and on a managed
 * machine — or for anyone living in Outlook on the web — there often is not one.
 * The browser swallows the click with no error and no tab: the worst kind of
 * broken, because it looks like the button is dead.
 *
 * An Outlook on the web compose link is an ordinary https URL, so it behaves
 * like every other working link on these pages. Safe to assume here: the planner
 * signs in through the Hakim Azure AD tenant, so everyone reaching this button
 * already has a Microsoft account.
 *
 * `MARKETING` stays exported for the places that print the address as readable
 * text — those are copyable whatever the browser does with protocols.
 */
const COMPOSE = "https://outlook.office.com/mail/deeplink/compose";
const ask = (subject: string) =>
	`${COMPOSE}?to=${encodeURIComponent(MARKETING)}&subject=${encodeURIComponent(subject)}`;

/** A message to the marketing team with the subject filled in. Exported so a page
 *  can raise a conversation about one specific thing rather than the campaign as
 *  a whole. */
export const marketingEmail = ask;

/** The marketing team, for the places that print the address as the link text.
 *  Same compose link, so those work too rather than being the only dead ones
 *  left on the page. */
export const MARKETING_LINK = ask("Marketing enquiry");

const planner = (id: string) => `/dashboard?campaign=${id}`;

const PRESBYOPIA = planner("49fc2f96-6e7c-4d95-a7cf-a97ce5bc5f4a");
const DRY_EYE = planner("eb34e719-e674-4b95-b69d-cbe92afb0648");
const BLACK_FRIDAY = planner("6e0839c3-674b-42b4-b586-205b2d9422ea");
const OUTSIDE_RX = planner("d0780dcc-709e-4354-8fa2-fb8643c607bf");
const EYE_EXAMS = planner("8d0c111d-a127-49b3-a142-22065517518a");

const FESTIVE = planner("729bef72-acf0-403f-8f4a-97003466fe46");

/** The planner itself — the labelled fallback destination. */
export const PLANNER_HOME = "/dashboard";

/** The pieces behind the Festive Made Easy window, as a shopping list. Supplied
 *  27 August 2026. Off-the-shelf decor, so it points outside the group entirely
 *  — the only destination here that does. */
export const FESTIVE_INSPIRATION = "https://amzn.eu/0gf7VUPa";

/** Feedback on Q4 as a whole, supplied 27 August 2026. A form rather than an
 *  email so replies arrive in one place and in one shape. */
export const FEEDBACK_FORM = "https://form.jotform.com/262372678819068";

const CAMPAIGN: Record<CampaignId, string> = {
	presbyopia: PRESBYOPIA,
	"menopause-dry-eye": DRY_EYE,
	"black-friday": BLACK_FRIDAY,
	"festive-windows": FESTIVE,
	"outside-prescriptions": OUTSIDE_RX,
	"eye-exams-available": EYE_EXAMS,
};

/** Supplier add-ons: a sign-up form where the supplier has one, otherwise a
 *  request to marketing. A brand with nothing to take up is left out entirely
 *  rather than given a null — see the festive note below. */
const BRANDS: Record<CampaignId, Record<string, string>> = {
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
		// Promotion details still to follow, but the row still offers a way in —
		// every brand does. See the note on brandLink.
		scope: ask("Scope - Black Friday"),
	},
	"festive-windows": {
		// Supplier sign-up forms, supplied 27 August 2026. Each collects the
		// practice's details for that supplier directly, so these are real
		// destinations rather than a request to marketing.
		boss: "https://form.jotform.com/262382567372363",
		oakley: "https://form.jotform.com/262382059840359",
		"ted-baker": "https://form.jotform.com/262371538489065",
		"design-eyewear": "https://form.jotform.com/262382412556356",
		// Thea is training and product support rather than a sign-up, so it
		// stays a conversation with the rep.
		thea: ask("Thea brand assets - Festive Windows"),
		// Alcon, Bausch + Lomb and Silhouette were dropped before launch —
		// unconfirmed in time. Removed from the data rather than left as `tbc`
		// rows, so nothing shows for them at all.
	},
	"outside-prescriptions": {},
	"eye-exams-available": {},
};

/** Campaign-level destination, shared by that campaign's creative directions. */
export function campaignLink(id: CampaignId): string {
	return CAMPAIGN[id] ?? PLANNER_HOME;
}

/**
 * Where a supplier add-on is taken up.
 *
 * Every brand resolves to something: a sign-up form where the supplier runs one,
 * otherwise an email to marketing. A brand that offered no way in at all left the
 * visitor reading about an activation with nowhere to go, so the fallback is the
 * rule rather than an edge case — `brandLink` never returns null.
 */
export function brandLink(id: CampaignId, brandId: string): string {
	return BRANDS[id]?.[brandId] ?? ask("Brand assets enquiry");
}

/** True where a destination is the marketing team rather than a supplier. */
export const isMarketingContact = (href: string) => href.startsWith(COMPOSE);

/**
 * True where a destination is a supplier's own sign-up form. Drives the button
 * label: a form is filled in, marketing is contacted.
 *
 * Note the exclusion. Contacting marketing is now an https link too, so testing
 * the protocol alone would label it "Fill in form" — which is exactly the sort of
 * button that lies about where it goes.
 */
export const isForm = (href: string) =>
	/^https?:\/\//i.test(href) && !isMarketingContact(href);

/**
 * True where a destination is an email rather than a page.
 *
 * The only distinction `Cta` still needs to draw: a mailto hands off to the mail
 * client and must not open a tab, everything else opens in one.
 */
export const isMail = (href: string) => /^mailto:/i.test(href);
