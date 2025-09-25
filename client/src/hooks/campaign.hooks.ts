import { getAllCampaigns } from "@/api/campaign";
import { supabase } from "@/api/supabase";
import {
	BulkAddCampaignsInput,
	Campaign,
	CreateBespokeInput,
	GuidedCampaign,
	GuidedParams,
} from "@/models/campaign.models";
import { usePractice } from "@/shared/PracticeProvider";
import { DatabaseTables, RPCFunctions } from "@/shared/shared.models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const key = (practiceId?: string | null) => [
	DatabaseTables.CampaignsCatalog,
	practiceId ?? null,
];

export const useAllCampaigns = (practiceId?: string | null, enabled = true) => {
	return useQuery<Campaign[]>({
		queryKey: [DatabaseTables.CampaignsCatalog, practiceId],
		queryFn: () => getAllCampaigns(practiceId),
		enabled,
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
				more_info_link = null,
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
					p_more_info_link: more_info_link,
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

export function useGuidedCampaigns<TData = GuidedCampaign[]>(
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

	return useQuery<GuidedCampaign[], unknown, TData>({
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
			})) as GuidedCampaign[];
		},
	});
}
