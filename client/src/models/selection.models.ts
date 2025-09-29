import { SelectionsSource, SelectionStatus } from "@/shared/shared.models";

// types/db.ts
export type Selection = {
	id: string;
	assets: string[];
	practice_id: string;
	campaign_id: string;
	from_date: string; // ISO date (YYYY-MM-DD)
	to_date: string; // ISO date
	status: SelectionStatus;
	notes: string | null;
	bespoke: boolean;
	created_by: string | null;
	updated_at: string;
	reference_links: string[];
};

export type AddSelectionInput = {
	campaign_id?: string;
	from_date?: string; // 'YYYY-MM-DD'
	to_date?: string; // 'YYYY-MM-DD'
	status?: SelectionStatus; // default 'On Plan'
	notes?: string | null;
	bespoke?: boolean;
	source?: SelectionsSource;
};

export type UpdateSelectionInput = {
	id: string;
	patch: Partial<
		Pick<
			Selection,
			"from_date" | "to_date" | "status" | "notes" | "bespoke"
		>
	>;
};

export type PlanRow = {
	id: string;
	practiceId: string;
	practice: string;
	campaign: string;
	category: string | null;
	source: string | null;
	tier: string | null;
	status: string;
	from: string; // date (YYYY-MM-DD)
	end: string; // date (YYYY-MM-DD)
	updated_at: string; // ISO timestamp
	notes: string;
	reference_links: string[];
};

export type PlansFilter = {
	practiceIds?: string[] | null;
	status?: string | null;
	category?: string | null;
	source?: string | null;
	tier?: string | null;
	isBespoke?: boolean;
};
