import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { RPCFunctions } from "@/shared/shared.models";
import {
	BespokeDeliverable,
	BriefFile,
	EventDeliverable,
} from "@/models/bespokeBrief.models";

/** Data-driven deliverables catalog for the revamped bespoke brief form. */
export function useBespokeDeliverables() {
	return useQuery({
		queryKey: [RPCFunctions.GetBespokeDeliverables],
		staleTime: 5 * 60 * 1000,
		queryFn: async (): Promise<BespokeDeliverable[]> => {
			const { data, error } = await supabase.rpc(
				RPCFunctions.GetBespokeDeliverables,
			);
			if (error) throw error;
			return (data ?? []) as BespokeDeliverable[];
		},
	});
}

/** Data-driven deliverables catalog for the revamped event brief form. */
export function useEventDeliverables() {
	return useQuery({
		queryKey: [RPCFunctions.GetEventDeliverables],
		staleTime: 5 * 60 * 1000,
		queryFn: async (): Promise<EventDeliverable[]> => {
			const { data, error } = await supabase.rpc(
				RPCFunctions.GetEventDeliverables,
			);
			if (error) throw error;
			return (data ?? []) as EventDeliverable[];
		},
	});
}

const BRIEF_BUCKET = "bespoke-brief-files";

/**
 * Upload brief files to the PUBLIC bespoke-brief-files bucket and return
 * durable public URLs (the design team opens these from Trello, so signed/
 * expiring URLs won't do). Throws with a helpful message on the first failure.
 */
export async function uploadBespokeBriefFiles(
	files: File[],
): Promise<BriefFile[]> {
	const out: BriefFile[] = [];
	for (const file of files) {
		const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
		const path = `${crypto.randomUUID()}-${safeName}`;
		const { error } = await supabase.storage
			.from(BRIEF_BUCKET)
			.upload(path, file, {
				cacheControl: "3600",
				upsert: false,
				contentType: file.type || "application/octet-stream",
			});
		if (error) {
			const msg = error.message || "upload failed";
			const sizeHint = /size|large|payload|exceeded|maximum/i.test(msg)
				? " — the file may exceed the 25 MB limit"
				: "";
			console.error("[bespoke-upload]", file.name, error);
			throw new Error(`Couldn't upload ${file.name}: ${msg}${sizeHint}`);
		}
		const { data } = supabase.storage.from(BRIEF_BUCKET).getPublicUrl(path);
		out.push({ name: file.name, url: data.publicUrl });
	}
	return out;
}
