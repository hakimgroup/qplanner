// hooks/selectionAssets.hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { DatabaseTables, RPCFunctions } from "@/shared/shared.models";
import {
  AdminAssetsPayload,
  MarkReadArgs,
  NotificationRow,
  RequestAssetsInput,
  SubmitAssetsArgs,
  UseNotificationsArgs,
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

async function fetchNotifications({
  type = null,
  practiceId = null,
  onlyUnread = false,
  limit = 25,
  offset = 0,
}: UseNotificationsArgs): Promise<NotificationRow[]> {
  const { data, error } = await supabase.rpc(RPCFunctions.ListNotifications, {
    p_type: type,
    p_practice_id: practiceId,
    p_only_unread: onlyUnread,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export function useNotifications(args: UseNotificationsArgs = {}) {
  const { type, practiceId, onlyUnread, limit, offset } = args;

  return useQuery({
    queryKey: [
      DatabaseTables.Notifications,
      { type, practiceId, onlyUnread, limit, offset },
    ],
    queryFn: () =>
      fetchNotifications({ type, practiceId, onlyUnread, limit, offset }),
  });
}

export function useSubmitAssets() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      selectionId,
      chosenCreative,
      assets,
      note,
    }: SubmitAssetsArgs) => {
      const { data, error } = await supabase.rpc(RPCFunctions.SubmitAssets, {
        p_selection_id: selectionId,
        p_chosen_creative: chosenCreative,
        p_assets: assets,
        p_note: note,
        p_recipient_ids: null, // we'll let the RPC resolve admins normally
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // You’ll likely want to refetch notifications and campaigns
      qc.invalidateQueries({ queryKey: [DatabaseTables.Notifications] });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans] }); // or whatever key you use for current selections/plans
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId }: MarkReadArgs) => {
      const { error } = await supabase.rpc(RPCFunctions.MarkAsRead, {
        p_notification_id: notificationId,
      });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DatabaseTables.Notifications] });
    },
  });
}
