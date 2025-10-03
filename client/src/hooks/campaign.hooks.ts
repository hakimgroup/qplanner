import { getAllCampaigns } from "@/api/campaign";
import { supabase } from "@/api/supabase";
import {
	BulkAddCampaignsInput,
	Campaign,
	CreateBespokeEventInput,
	CreateBespokeInput,
	GuidedCampaign,
	GuidedParams,
} from "@/models/campaign.models";
import { useAuth } from "@/shared/AuthProvider";
import { usePractice } from "@/shared/PracticeProvider";
import { DatabaseTables, RPCFunctions } from "@/shared/shared.models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

const key = (practiceId?: string | null) => [
	DatabaseTables.CampaignsCatalog,
	practiceId ?? null,
];

export const useAllCampaigns = (practiceId?: string | null, enabled = true) => {
	const { user } = useAuth();
	return useQuery<Campaign[]>({
		queryKey: [DatabaseTables.CampaignsCatalog, practiceId],
		queryFn: () => getAllCampaigns(practiceId),
		enabled: Boolean(user),
	});
};

export const useCreateBespokeSelection = () => {
	const qc = useQueryClient();
	const { activePracticeId } = usePractice();

	return useMutation({
		mutationFn: async (input: CreateBespokeInput) => {
			if (!activePracticeId) {
				throw new Error("No active practice selected.");
			}

			const {
				name,
				description,
				from,
				to,
				status = "onPlan",
				notes = null,
				objectives = [],
				topics = [],
				assets = [],
				reference_links,
			} = input;

			const { data, error } = await supabase.rpc(
				RPCFunctions.CreateBespokeSelection,
				{
					// REQUIRED first (per function signature)
					p_practice: activePracticeId,
					p_name: name,
					p_description: description,
					p_from_date: format(from, "yyyy-MM-dd"),
					p_to_date: format(to, "yyyy-MM-dd"),

					// OPTIONAL (defaults applied by the RPC too)
					p_status: status,
					p_notes: notes,
					p_objectives: objectives, // supabase js client serializes to jsonb
					p_topics: topics,
					p_assets: assets,
					p_reference_links: reference_links,
				}
			);

			if (error) throw error;
			// RPC returns the new selection_id (uuid)
			return data as string;
		},

		onSuccess: () => {
			// Refresh all get_campaigns caches (united + practice-scoped)
			qc.invalidateQueries({
				queryKey: [DatabaseTables.CampaignsCatalog],
				exact: false,
			});
		},
	});
};

export function useBulkAddCampaigns() {
	const qc = useQueryClient();
	const { activePracticeId } = usePractice();

	return useMutation({
		mutationFn: async (input: BulkAddCampaignsInput) => {
			const {
				campaignIds,
				from,
				to,
				status = "onPlan",
				notes = null,
				practiceId,
				source,
			} = input;

			const p_practice = practiceId ?? activePracticeId;
			if (!p_practice) throw new Error("No practice selected.");
			if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
				throw new Error("No campaigns selected.");
			}

			const { data, error } = await supabase.rpc(
				RPCFunctions.AddCampaignsBulk,
				{
					p_practice,
					p_campaign_ids: campaignIds,
					p_from_date: from,
					p_to_date: to,
					p_status: status,
					p_notes: notes,
					p_source: source,
				}
			);

			if (error) throw error;
			return data as { selection_id: string; campaign_id: string }[];
		},
		onSuccess: (_data, variables) => {
			const pid = variables.practiceId ?? activePracticeId ?? null;
			// Refresh merged campaigns view
			qc.invalidateQueries({ queryKey: key(pid) });
		},
	});
}

function keyGuided(params?: GuidedParams, practiceId?: string | null) {
	// Keep the key stable—order matters
	return [
		RPCFunctions.GetGuidedCampaigns,
		practiceId ?? null,
		params?.clinical ?? null,
		params?.frame ?? null,
		params?.lens ?? null,
		params?.contact ?? null,
		params?.kids ?? null,
		params?.seasonal ?? null,
		params?.supplierBrand ?? null,
		params?.eventReady ?? null,
		params?.activity ?? null,
	] as const;
}

export function useGuidedCampaigns<TData = Campaign[]>(
	params: GuidedParams | undefined,
	enabled: boolean = false,
	onSuccess: () => void
) {
	const { activePracticeId } = usePractice();

	const isParamsReady =
		!!params &&
		[
			params.clinical,
			params.frame,
			params.lens,
			params.contact,
			params.activity,
		].every((v) => typeof v === "number");

	return useQuery<Campaign[], unknown, TData>({
		queryKey: keyGuided(params, activePracticeId),
		enabled: enabled && isParamsReady,
		refetchOnWindowFocus: false,
		queryFn: async () => {
			if (!params) return [];

			const { data, error } = await supabase.rpc(
				RPCFunctions.GetGuidedCampaigns,
				{
					p_clinical: params.clinical,
					p_frame: params.frame,
					p_lens: params.lens,
					p_contact: params.contact,
					p_kids: params.kids,
					p_seasonal: params.seasonal,
					p_supplier_brand: params.supplierBrand,
					p_event_ready: params.eventReady,
					p_activity: Math.max(
						0,
						Math.min(100, Math.round(params.activity))
					),
					p_practice: activePracticeId ?? null,
				}
			);

			if (error) throw error;

			onSuccess && onSuccess();

			// Supabase types jsonb[] as unknown; coerce to arrays for safety
			return (data ?? []).map((row: any) => ({
				...row,
				objectives: Array.isArray(row.objectives) ? row.objectives : [],
				topics: Array.isArray(row.topics) ? row.topics : [],
				already_on_plan: !!row.already_on_plan,
			})) as Campaign[];
		},
	});
}

export function useCreateBespokeEvent() {
	const qc = useQueryClient();
	const { activePracticeId } = usePractice();

	return useMutation({
		mutationFn: async (input: CreateBespokeEventInput) => {
			const practiceId = input.practiceId ?? activePracticeId;

			const { data, error } = await supabase.rpc(
				RPCFunctions.CreateBespokeEvent,
				{
					p_practice: practiceId,
					p_event_type: input.eventType,
					p_title: input.title,
					p_description: input.description,
					p_event_from_date: format(
						input.eventFromDate,
						"yyyy-MM-dd"
					),
					p_event_to_date: format(input.eventToDate, "yyyy-MM-dd"),
					p_objectives: input.objectives ?? [],
					p_topics: input.topics ?? [],
					p_assets: input.assets ?? [],
					p_requirements: input.requirements ?? null,
					p_notes: input.notes ?? null,
					p_reference_links: input.links ?? [],
				}
			);

			if (error) throw error;
			// RPC returns the new selection_id (uuid)
			return data as string;
		},
		onSuccess: async (selectionId) => {
			// Refresh merged campaigns for the current practice context
			await qc.invalidateQueries({
				queryKey: [DatabaseTables.CampaignsCatalog, activePracticeId],
			});
		},
		onError: (e) => {},
	});
}

type Filters = {
	category?: string | null;
	status?: string | null;
	tier?: string | null;
	q?: string | null;
};

export function useCampaignsCatalog(filters?: Filters) {
	return useQuery({
		queryKey: [DatabaseTables.CampaignsCatalog, filters],
		queryFn: async () => {
			let q = supabase
				.from(DatabaseTables.CampaignsCatalog)
				.select("*")
				.order("name", { ascending: true });

			if (filters?.category) q = q.eq("category", filters.category);
			if (filters?.status) q = q.eq("status", filters.status);

			// ---- tiers filtering (tiers is text[]):
			if (filters && "tier" in filters) {
				const t = filters.tier;

				// If null or empty array -> NO FILTER
				if (t === null || (Array.isArray(t) && t.length === 0)) {
					// do nothing → returns all campaigns
				} else if (Array.isArray(t)) {
					// Treat only the string sentinel "none" (or "__none__") as NULL-tier
					const wantsNull = t.some(
						(x) => x === "none" || x === "__none__"
					);
					const requested = t.filter(
						(x) => x !== "none" && x !== "__none__"
					);

					if (requested.length && wantsNull) {
						const set = `{${requested.join(",")}}`;
						// tiers IS NULL OR tiers overlaps requested
						q = q.or(`tiers.is.null,tiers.ov.${set}`);
					} else if (requested.length) {
						q = q.overlaps("tiers", requested);
					} else if (wantsNull) {
						q = q.is("tiers", null);
					}
				} else if (typeof t === "string" && t.length > 0) {
					if (t === "none" || t === "__none__") {
						q = q.is("tiers", null);
					} else {
						q = q.contains("tiers", [t]);
					}
				}
			}
			// ---- end tiers filter

			const { data, error } = await q;
			if (error) throw error;

			// client-side search
			const needle = (filters?.q ?? "").trim().toLowerCase();
			if (!needle) return data;

			return (data ?? []).filter((r: any) => {
				const inTxt = (s?: string) =>
					String(s ?? "")
						.toLowerCase()
						.includes(needle);
				const inArr = (a?: any[]) =>
					Array.isArray(a)
						? a.some((x) =>
								String(x).toLowerCase().includes(needle)
						  )
						: false;

				return (
					inTxt(r.name) ||
					inTxt(r.description) ||
					inTxt(r.category) ||
					inArr(r.objectives) ||
					inArr(r.topics)
				);
			});
		},
	});
}

export function useUpdateCampaignTier() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			tiers,
		}: {
			id: string;
			tiers: string[] | null;
		}) => {
			const { error } = await supabase
				.from(DatabaseTables.CampaignsCatalog)
				.update({ tiers })
				.eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [DatabaseTables.CampaignsCatalog],
			});
			toast.success("Tier updated");
		},
		onError: (e: any) => toast.error(e?.message ?? "Failed to update tier"),
	});
}

export function useBulkUpdateCampaignTier() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ ids, tier }: { ids: string[]; tier: string }) => {
			if (!ids.length) return;
			const { error } = await supabase
				.from(DatabaseTables.CampaignsCatalog)
				.update({ tier })
				.in("id", ids);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [DatabaseTables.CampaignsCatalog],
			});
			toast.success("Tier set for selected");
		},
		onError: (e: any) => toast.error(e?.message ?? "Failed to bulk update"),
	});
}

export function useUpsertCatalogCampaign() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (payload: any) => {
			const body = {
				name: payload.name,
				description: payload.description,
				category: payload.category,
				tiers: payload.tiers,
				status: payload.status ?? "Available",
				objectives: payload.objectives ?? [],
				topics: payload.topics ?? [],
				availability: payload.availability ?? null,
				more_info_link: payload.more_info_link ?? null,
			};

			const query = payload.id
				? supabase
						.from(DatabaseTables.CampaignsCatalog)
						.update(body)
						.eq("id", payload.id)
						.select()
						.single()
				: supabase
						.from(DatabaseTables.CampaignsCatalog)
						.insert(body)
						.select()
						.single();

			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [DatabaseTables.CampaignsCatalog],
			});
			toast.success("Campaign saved");
		},
		onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
	});
}
