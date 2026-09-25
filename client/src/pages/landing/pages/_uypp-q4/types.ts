/**
 * The shape of a Q4 campaign's data, carried in each page file and rendered by
 * the shared sections. Ported from `window.UYPP_CAMPAIGN` in the standalone build.
 *
 * A campaign states a problem, then offers one or more creative routes as
 * solutions, each with its own set of placements. It may also carry the supplier
 * add-ons that attach to it.
 */

/** One artwork tile. `ph` marks an empty slot — artwork still to come. */
export type Tile =
	| { img: string; cap: string; badge?: string }
	| { ph: true; cap?: string };

export const isPlaceholder = (t: Tile): t is { ph: true; cap?: string } =>
	"ph" in t && t.ph === true;

/** A group of tiles under one tab — posters, A-board, social and so on. */
export interface Placement {
	key: string;
	label: string;
	items: Tile[];
}

/** A creative direction. Switching route swaps the panel copy, the accent colour
 *  and the entire placement set — different routes genuinely carry different art. */
export interface Route {
	id: string;
	name: string;
	/** Retained from the standalone data but no longer rendered: it only ever held
	 *  "Route 01" and the like, which the route name already covers. */
	tagline?: string;
	/** HTML string — the route's own copy, straight from the creative deck. */
	body?: string;
	visual?: string;
	/**
	 * How the visual sits in its frame. The frame is as tall as the copy beside
	 * it, so a landscape visual next to long copy floats in a tall empty mat.
	 * `contain` (the default) is right for deck renders, where cropping would
	 * slice the posters; "cover" fills the frame and suits a photograph that can
	 * lose its edges. The full image is always one click away in the lightbox.
	 */
	visualFit?: "contain" | "cover";
	/** Where a "cover" crop is anchored, as CSS object-position. Centred by default;
	 *  set it where the subject sits off-centre and the crop would cut through it. */
	visualPosition?: string;
	/** Drives the --route custom property on the page. */
	accent?: string;
	/** Retained but not rendered — the placement carousel already lists everything. */
	assets?: string[];
	/** HTML string. A closing line under the route copy, where a route needs to say
	 *  something the campaign-wide wording does not cover. */
	note?: string;
	/** An optional second button beside the order button, where a route offers
	 *  somewhere useful to go that ordering does not cover. Was a fixed "contact
	 *  marketing"; a label and a destination instead, because what is useful
	 *  differs by route — one wants a shopping list, another wants nothing. */
	action?: { label: string; href: string };
	/**
	 * Where this route is ordered, when that differs from the campaign's own
	 * destination.
	 *
	 * A Q4 campaign has one planner card shared by its creative routes, because
	 * the route is chosen inside the planner. The Festive Focus Toolkit inverts
	 * that: a toolkit page is a *group* of separate activities — 12 Days of
	 * Christmas and a Late-night VIP evening are not two treatments of one thing —
	 * so each route carries its own destination and its own button wording.
	 *
	 * Unset everywhere in Q4, so the campaign-level link stays the default.
	 */
	order?: { label?: string; href: string };
	placements?: Placement[];
}

/**
 * A supplier add-on. Only what differs from the parent campaign is held here:
 * Campaign Period, Core KPI, Audience and "best for practices who want to" are
 * identical on every brand slide in the Q4 brief, so they stay stated once on the
 * campaign itself.
 */
export interface Brand {
	id: string;
	name: string;
	logo: string;
	/** One line, shown while the row is collapsed. */
	offer?: string;
	/** Groups the list where there are enough add-ons to need it. */
	group?: string;
	/**
	 * "tbc" dims the row: details are still to come, so the panel says so and
	 * offers a conversation with marketing instead.
	 *
	 * "closed" means the activation has run out — every allocation is taken. The
	 * row stays, so a practice looking for the brand learns it is full rather than
	 * wondering where it went, but it renders no button: a sign-up form for
	 * something with no places left only produces disappointed practices.
	 */
	status?: "tbc" | "closed";
	/** HTML string. The message a closed row shows in place of its button. */
	closedNote?: string;
	/** HTML string. */
	body?: string;
	/** HTML string. What the practice has to order to qualify, where that is a
	 *  condition of taking part rather than a detail of the offer. */
	requirement?: string;
	gives?: string[];
	products?: string[];
	/** HTML string. */
	howto?: string;
	/**
	 * Button wording, where the supplier's own wording has been asked for.
	 *
	 * Otherwise derived from the destination — "Fill in form" for a supplier form,
	 * "Contact marketing" for everything else — which is the rule across every
	 * brand on every page. Override sparingly, or the rule stops meaning anything.
	 */
	actionLabel?: string;
	/** The activation itself, shown at the top of the open panel. A placeholder
	 *  tile where the imagery exists but has not reached the site yet. */
	visual?: Tile;
}

export interface Campaign {
	routes: Route[];
	brands?: Brand[];
	/**
	 * What the ordering buttons call the thing being ordered.
	 *
	 * Defaults to "Order this campaign", which is right where the campaign and
	 * the order are the same thing. Festive Windows is not: the campaign is a
	 * window you build, and what the planner actually supplies is the poster set,
	 * so its buttons say "Order Festive posters" instead of promising the window.
	 */
	orderLabel?: string;
}
