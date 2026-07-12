import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { RPCFunctions } from "@/shared/shared.models";
import {
	BugAttachment,
	BugReport,
	BugStatus,
	CreateBugReportArgs,
} from "@/models/bug.models";
import { sendBugReportEmail } from "@/api/emails";
import { toast } from "sonner";

const BUCKET = "bug-attachments";
export const BUG_REPORTS_KEY = "bug_reports";

/** Upload files to the private bucket, return the attachment metadata to store. */
async function uploadAttachments(files: File[]): Promise<BugAttachment[]> {
	const out: BugAttachment[] = [];
	for (const file of files) {
		const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
		const path = `${crypto.randomUUID()}-${safeName}`;
		const { error } = await supabase.storage
			.from(BUCKET)
			.upload(path, file, {
				cacheControl: "3600",
				upsert: false,
				contentType: file.type || "application/octet-stream",
			});
		if (error) {
			const msg = error.message || "upload failed";
			const sizeHint = /size|large|payload|exceeded|maximum/i.test(msg)
				? " — the file may exceed the storage size limit"
				: "";
			console.error("[bug-upload]", file.name, error);
			throw new Error(`Couldn't upload ${file.name}: ${msg}${sizeHint}`);
		}
		out.push({
			path,
			name: file.name,
			type: file.type || "application/octet-stream",
			size: file.size,
		});
	}
	return out;
}

/** Mint a short-lived signed URL for viewing an attachment in the detail drawer. */
export async function signBugAttachment(
	path: string,
	expiresIn = 3600,
): Promise<string | null> {
	const { data, error } = await supabase.storage
		.from(BUCKET)
		.createSignedUrl(path, expiresIn);
	if (error) {
		console.warn("[bug-attachment] signed URL failed:", error.message);
		return null;
	}
	return data?.signedUrl ?? null;
}

export function useBugReports(status: BugStatus | "all" = "all") {
	return useQuery({
		queryKey: [BUG_REPORTS_KEY, status],
		queryFn: async (): Promise<BugReport[]> => {
			const { data, error } = await supabase.rpc(RPCFunctions.ListBugReports, {
				p_status: status === "all" ? null : status,
			});
			if (error) throw error;
			return (data as BugReport[]) ?? [];
		},
	});
}

export function useCreateBugReport() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			title,
			description,
			severity,
			files,
		}: CreateBugReportArgs) => {
			const attachments = files.length
				? await uploadAttachments(files)
				: [];
			const { data, error } = await supabase.rpc(
				RPCFunctions.CreateBugReport,
				{
					p_title: title,
					p_description: description,
					p_severity: severity,
					p_attachments: attachments,
				},
			);
			if (error) throw error;
			if (data && !data.success) {
				throw new Error(data.error || "Failed to create bug report");
			}
			return data as { id: string };
		},
		onSuccess: (data) => {
			toast.success("Bug report submitted");
			qc.invalidateQueries({ queryKey: [BUG_REPORTS_KEY], exact: false });
			if (data?.id) sendBugReportEmail({ bugReportId: data.id });
		},
		onError: (err: any) => {
			toast.error(err?.message || "Failed to submit bug report");
		},
	});
}

export function useCloseBugReport() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args: { id: string; resolutionNote?: string | null }) => {
			const { data, error } = await supabase.rpc(RPCFunctions.CloseBugReport, {
				p_id: args.id,
				p_resolution_note: args.resolutionNote ?? null,
			});
			if (error) throw error;
			if (data && !data.success) {
				throw new Error(data.error || "Failed to close ticket");
			}
			return data;
		},
		onSuccess: () => {
			toast.success("Ticket closed");
			qc.invalidateQueries({ queryKey: [BUG_REPORTS_KEY], exact: false });
		},
		onError: (err: any) => {
			toast.error(err?.message || "Failed to close ticket");
		},
	});
}

export function useReopenBugReport() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data, error } = await supabase.rpc(RPCFunctions.ReopenBugReport, {
				p_id: id,
			});
			if (error) throw error;
			if (data && !data.success) {
				throw new Error(data.error || "Failed to reopen ticket");
			}
			return data;
		},
		onSuccess: () => {
			toast.success("Ticket reopened");
			qc.invalidateQueries({ queryKey: [BUG_REPORTS_KEY], exact: false });
		},
		onError: (err: any) => {
			toast.error(err?.message || "Failed to reopen ticket");
		},
	});
}

export function useDeleteBugReport() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (bug: BugReport) => {
			// Best-effort: remove the storage objects first so we don't orphan
			// files. Don't block the row delete if this fails.
			const paths = (bug.attachments ?? []).map((a) => a.path);
			if (paths.length) {
				const { error: rmErr } = await supabase.storage
					.from(BUCKET)
					.remove(paths);
				if (rmErr) {
					console.warn("[bug-delete] storage cleanup failed:", rmErr.message);
				}
			}
			const { data, error } = await supabase.rpc(RPCFunctions.DeleteBugReport, {
				p_id: bug.id,
			});
			if (error) throw error;
			if (data && !data.success) {
				throw new Error(data.error || "Failed to delete ticket");
			}
			return data;
		},
		onSuccess: () => {
			toast.success("Ticket deleted");
			qc.invalidateQueries({ queryKey: [BUG_REPORTS_KEY], exact: false });
		},
		onError: (err: any) => {
			toast.error(err?.message || "Failed to delete ticket");
		},
	});
}
