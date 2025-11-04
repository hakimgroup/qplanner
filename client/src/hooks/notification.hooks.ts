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
import { toast } from "sonner";
import { requestAssetsBulk } from "@/api/selections";
import { RequestAssetsBulkResponse } from "@/models/selection.models";

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
      toast.success("Request sent to practice");

      // Refresh admin views (selections list, notifications, etc.)
      qc.invalidateQueries({
        queryKey: [DatabaseTables.Notifications],
        exact: false,
      });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });
    },
  });
}

const toYMD = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

async function fetchNotifications({
  type = null,
  practiceId = null,
  limit = 25,
  offset = 0,
  category = null,
  startDate = null,
  endDate = null,
  readStatus = null,
}: UseNotificationsArgs = {}): Promise<NotificationRow[]> {
  const { data, error } = await supabase.rpc(RPCFunctions.ListNotifications, {
    p_type: type,
    p_practice_id: practiceId,
    p_limit: limit,
    p_offset: offset,
    p_category: category, // e.g. "Campaign" or null
    p_start_date: toYMD(startDate), // 'YYYY-MM-DD' or null
    p_end_date: toYMD(endDate), // 'YYYY-MM-DD' or null
    p_read_status: readStatus, // 'read' | 'unread' | null
  });

  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export function useNotifications(args: UseNotificationsArgs = {}) {
  const {
    type = null,
    practiceId = null,
    limit = 25,
    offset = 0,
    category = null,
    startDate = null,
    endDate = null,
    readStatus = null,
  } = args;

  return useQuery({
    queryKey: [
      DatabaseTables.Notifications,
      {
        type,
        practiceId,
        limit,
        offset,
        category,
        startDate: toYMD(startDate),
        endDate: toYMD(endDate),
        readStatus,
      },
    ],
    queryFn: () =>
      fetchNotifications({
        type,
        practiceId,
        limit,
        offset,
        category,
        startDate,
        endDate,
        readStatus,
      }),
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

export function useRequestAssetsBulk() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (selectionIds: string[]) => requestAssetsBulk(selectionIds),
    onSuccess: (res: RequestAssetsBulkResponse) => {
      // invalidate anything relevant (notifications list, selections, etc.)
      qc.invalidateQueries({
        queryKey: [DatabaseTables.Notifications],
        exact: false,
      });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Failed to request assets in bulk");
    },
  });
}
