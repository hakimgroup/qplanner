// Types for the revamped bespoke campaign brief (2026-08).
// The `brief` object is persisted on bespoke_campaigns.brief and mirrored
// into notifications.payload.brief (the Trello/n8n contract).

/** A file uploaded to the public `bespoke-brief-files` bucket. Durable URL. */
export interface BriefFile {
	name: string;
	url: string;
}

/** One date/time slot for an event (date + start/end time). */
export interface DateSlot {
	date: string; // YYYY-MM-DD
	start: string; // HH:mm
	end: string; // HH:mm
}

/**
 * Structured brief stored on bespoke_campaigns.brief + mirrored to
 * notifications.payload.brief. Union of bespoke-campaign fields and
 * event fields (all optional) since both share the one jsonb column.
 */
export interface BespokeBrief {
	// ── Bespoke campaign fields ──────────────────────────────
	purpose?: string;
	audience?: string;
	audience_notes?: string;
	offers_cta?: string;
	look_and_feel?: string;
	what_to_avoid?: string;
	has_content?: boolean;
	content_files?: BriefFile[];
	has_imagery?: boolean;
	imagery_files?: BriefFile[];
	has_examples?: boolean;
	example_files?: BriefFile[];
	other_deliverable?: string;

	// ── Event fields ─────────────────────────────────────────
	theme?: string;
	brands?: string;
	discounts?: string;
	on_the_day?: string;
	date_slots?: DateSlot[];
	pr?: boolean;
}

/** One row of the event deliverables catalog (get_event_deliverables). */
export interface EventDeliverable {
	id: string;
	channel: "print" | "digital" | "direct_comms";
	group: string;
	name: string;
	input_mode: "quantity" | "tick";
	disclaimer: string | null;
}

/** A chosen event deliverable. `quantity` is set only for quantity-mode items. */
export interface ChosenEventDeliverable {
	key: string;
	channel: "print" | "digital" | "direct_comms";
	group: string;
	name: string;
	input_mode: "quantity" | "tick";
	quantity?: number | null;
}

/** One row of the bespoke deliverables catalog (get_bespoke_deliverables). */
export interface BespokeDeliverable {
	id: string;
	channel: "print" | "digital";
	group: string;
	name: string;
	/** null = quantity-only item (no price). */
	price: number | null;
	/** Print-run pricing tiers, e.g. [{label:"500", value:38.95}]. */
	options: { label: string; value: number }[];
}

/**
 * A chosen deliverable with the quantity / print-run option the practice picked.
 * `key` is `${channel}:${group}:${name}` — stable id for selection state.
 */
export interface ChosenDeliverable {
	key: string;
	channel: "print" | "digital";
	group: string;
	name: string;
	/** For quantity-only items. */
	quantity?: number | null;
	/** For items with print-run options — the chosen tier label. */
	optionLabel?: string | null;
	price?: number | null;
}
