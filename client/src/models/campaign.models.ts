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
	objectives: Objective[]; // e.g. ["Conversion", "ADV"]
	topics: Topic[]; // e.g. ["Frame", "Lens"]
	availability: Availability | null; // e.g. { from: "Sep", to: "Oct" } or null
	more_info_link: string;
	status: SelectionStatus;
	is_bespoke: boolean;
	selected: boolean;
	selection_id: string;
	selection_from_date: string;
	selection_to_date: string;
	selection_practice_id: string;
	notes: string;
}
