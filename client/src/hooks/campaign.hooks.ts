import { getAllCampaigns } from "@/api/campaign";
import { supabase } from "@/api/supabase";
import {
	BulkAddCampaignsInput,
	Campaign,
	CreateBespokeInput,
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
					p_from_date: format(from, "yyyy-MM-dd"),
					p_to_date: format(to, "yyyy-MM-dd"),
					p_status: status,
					p_notes: notes,
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
