export type BugSeverity = "low" | "medium" | "high" | "critical";
export type BugStatus = "open" | "closed";

export interface BugAttachment {
	path: string; // storage path within the bug-attachments bucket
	name: string;
	type: string; // MIME type
	size: number; // bytes
}

export interface BugReport {
	id: string;
	title: string;
	description: string;
	severity: BugSeverity;
	status: BugStatus;
	attachments: BugAttachment[];
	created_by: string | null;
	created_by_name: string;
	created_at: string;
	closed_by: string | null;
	closed_by_name: string;
	closed_at: string | null;
	resolution_note: string | null;
}

export interface CreateBugReportArgs {
	title: string;
	description: string;
	severity: BugSeverity;
	files: File[];
}

export const SEVERITY_META: Record<
	BugSeverity,
	{ label: string; color: string }
> = {
	low: { label: "Low", color: "gray" },
	medium: { label: "Medium", color: "blue" },
	high: { label: "High", color: "orange" },
	critical: { label: "Critical", color: "red" },
};
