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
import {
  sendNotificationEmail,
  sendBulkNotificationEmail,
} from "@/api/emails";

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
    onSuccess: (data) => {
      toast.success("Request sent to practice");

      // Refresh admin views (selections list, notifications, etc.)
      qc.invalidateQueries({
        queryKey: [DatabaseTables.Notifications],
        exact: false,
      });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });

      // Send notification email (fire-and-forget)
      if (data?.id) {
        sendNotificationEmail({ notificationId: data.id });
      }
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
    onSuccess: (data) => {
      // You'll likely want to refetch notifications and campaigns
      qc.invalidateQueries({ queryKey: [DatabaseTables.Notifications] });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans] }); // or whatever key you use for current selections/plans

      // Send notification email to admins (fire-and-forget)
      if (data?.id) {
        sendNotificationEmail({ notificationId: data.id });
      }
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

export type ConfirmAssetsArgs = {
  selectionId: string;
  note?: string | null;
};

export function useConfirmAssets() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ selectionId, note }: ConfirmAssetsArgs) => {
      const { data, error } = await supabase.rpc(RPCFunctions.ConfirmAssets, {
        p_selection_id: selectionId,
        p_note: note ?? null,
      });
      if (error) throw error;
      // RPC returns {success, error, id, ...} - check success flag
      if (data && !data.success) {
        throw new Error(data.error || "Failed to confirm assets");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success("Assets confirmed successfully");

      // Refresh notifications and plans
      qc.invalidateQueries({
        queryKey: [DatabaseTables.Notifications],
        exact: false,
      });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });

      // Send notification email to admins (fire-and-forget)
      if (data?.id) {
        sendNotificationEmail({ notificationId: data.id });
      }
    },
  });
}

export type RequestRevisionArgs = {
  selectionId: string;
  feedback: string;
};

export function useRequestRevision() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ selectionId, feedback }: RequestRevisionArgs) => {
      const { data, error } = await supabase.rpc(RPCFunctions.RequestRevision, {
        p_selection_id: selectionId,
        p_feedback: feedback,
      });
      if (error) throw error;
      // RPC returns {success, error, id, ...} - check success flag
      if (data && !data.success) {
        throw new Error(data.error || "Failed to submit feedback");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success("Feedback submitted successfully");

      // Refresh notifications and plans
      qc.invalidateQueries({
        queryKey: [DatabaseTables.Notifications],
        exact: false,
      });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });

      // Send notification email to admins (fire-and-forget)
      if (data?.id) {
        sendNotificationEmail({ notificationId: data.id });
      }
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

      // Send consolidated bulk notification emails (one per practice)
      // Extract notification IDs from successful results
      const notificationIds = (res.results || [])
        .filter((r: any) => r.status === "ok" && r.notification_id)
        .map((r: any) => r.notification_id);

      if (notificationIds.length > 0) {
        sendBulkNotificationEmail({ notificationIds });
      }
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Failed to request assets in bulk");
    },
  });
}
