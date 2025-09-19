import { SelectionStatus } from "@/shared/shared.models";

// types/db.ts
export type Selection = {
	id: string;
	practice_id: string;
	campaign_id: string;
	from_date: string; // ISO date (YYYY-MM-DD)
	to_date: string; // ISO date
	status: SelectionStatus;
	notes: string | null;
	bespoke: boolean;
	created_by: string | null;
	updated_at: string;
};

export type AddSelectionInput = {
	campaign_id: string;
	from_date: string; // 'YYYY-MM-DD'
	to_date: string; // 'YYYY-MM-DD'
	status?: SelectionStatus; // default 'On Plan'
	notes?: string | null;
	bespoke?: boolean;
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
