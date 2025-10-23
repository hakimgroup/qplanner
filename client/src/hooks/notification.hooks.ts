// hooks/selectionAssets.hooks.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { DatabaseTables, RPCFunctions } from "@/shared/shared.models";
import {
  AdminAssetsPayload,
  RequestAssetsInput,
} from "@/models/notification.models";

export function useUpdateSourceAssets() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (p: AdminAssetsPayload) => {
      if (p.isBespoke && p.bespokeCampaignId) {
        const { error } = await supabase
          .from(DatabaseTables.BespokeCampaigns)
          .update({ assets: p.assets })
          .eq("id", p.bespokeCampaignId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(DatabaseTables.Selections)
          .update({ assets: p.assets })
          .eq("id", p.selectionId);
        if (error) throw error;
      }
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [DatabaseTables.CampaignsCatalog],
        exact: false,
      });
      qc.invalidateQueries({
        queryKey: [DatabaseTables.Selections],
        exact: false,
      });
    },
  });
}

export function useRequestAssets() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: RequestAssetsInput) => {
      const { data, error } = await supabase.rpc(RPCFunctions.RequestAssets, {
        p_selection_id: input.selectionId,
        p_creatives: input.creativeUrls,
        p_note: input.note ?? null,
        p_recipient_ids: input.recipientIds ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Refresh admin views (selections list, notifications, etc.)
      qc.invalidateQueries({
        queryKey: [DatabaseTables.Notifications],
        exact: false,
      });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });
    },
  });
}
