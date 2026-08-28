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
	/** "tbc" dims the row and renders no button — there is nothing to take up. */
	status?: "tbc";
	/** HTML string. */
	body?: string;
	gives?: string[];
	products?: string[];
	/** HTML string. */
	howto?: string;
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
