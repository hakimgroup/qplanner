import { SelectionStatus } from "@/shared/shared.models";

export const OBJECTIVES = [
	"ADV",
	"AOV",
	"Conversion",
	"Volume",
	"Sales (Turnover)",
	"Recurring revenue",
	"Eye test",
] as const;
export type Objective = (typeof OBJECTIVES)[number];

export const TOPICS = [
	"Frame",
	"Lens",
	"Contact lenses",
	"Kids",
	"Clinical",
	"Seasonal",
] as const;
export type Topic = (typeof TOPICS)[number];

export interface Availability {
	from: string;
	to: string;
}

export interface Campaign {
	id: string;
	name: string;
	description: string;
	category: string;
	assets: string[];
	objectives: Objective[]; // e.g. ["Conversion", "ADV"]
	topics: Topic[]; // e.g. ["Frame", "Lens"]
	availability: Availability | null; // e.g. { from: "Sep", to: "Oct" } or null
	more_info_link: string;
	reference_links: string[];
	status: SelectionStatus;
	is_bespoke: boolean;
	selected: boolean;
	selection_id: string;
	selection_from_date: string;
	selection_to_date: string;
	selection_practice_id: string;
	notes: string;
}

export type CreateBespokeInput = {
	name: string;
	description: string;
	from: Date;
	to: Date;

	// optional fields
	status?: string; // default 'onPlan'
	notes?: string | null;
	objectives?: string[]; // will be sent as jsonb
	topics?: string[]; // will be sent as jsonb
	more_info_link?: string | null;
	reference_links?: string[];
	assets?: unknown; // any JSON-serializable shape (jsonb)
};

export type BulkAddCampaignsInput = {
	campaignIds: string[]; // catalog campaign UUIDs
	from: Date; // start date
	to: Date; // end date
	status?: string; // default 'onPlan'
	notes?: string | null; // optional notes
	practiceId?: string | null; // optional override; defaults to activePracticeId
};
