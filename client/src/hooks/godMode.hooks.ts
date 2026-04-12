import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { RPCFunctions } from "@/shared/shared.models";
import { toast } from "sonner";

export type GodModeSearchRow = {
  id: string;
  practice_id: string;
  practice_name: string;
  campaign_name: string;
  category: string;
  bespoke: boolean;
  bespoke_campaign_id: string | null;
  campaign_id: string | null;
  status: string;
  from_date: string;
  to_date: string;
  updated_at: string;
};

export type GodModeSearchResult = {
  success: boolean;
  data: GodModeSearchRow[];
  total: number;
  error?: string;
};

export type GodModeSearchArgs = {
  search?: string | null;
  status?: string | null;
  practiceId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  limit?: number;
  offset?: number;
};

export function useGodModeSearch(args: GodModeSearchArgs, enabled = true) {
  return useQuery<GodModeSearchResult>({
    queryKey: ["god_mode_search", args],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeSearchSelections,
        {
          p_search: args.search ?? null,
          p_status: args.status && args.status !== "all" ? args.status : null,
          p_practice_id: args.practiceId ?? null,
          p_start_date: args.startDate ?? null,
          p_end_date: args.endDate ?? null,
          p_limit: args.limit ?? 50,
          p_offset: args.offset ?? 0,
        }
      );
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Search failed");
      return data as GodModeSearchResult;
    },
  });
}

export type GodModeNotification = {
  id: string;
  type: string;
  audience: string;
  practice_id: string;
  selection_id: string;
  campaign_id: string | null;
  actor_user_id: string | null;
  title: string | null;
  message: string | null;
  payload: any;
  created_at: string;
};

export type GodModeStatusHistory = {
  id: string;
  selection_id: string;
  from_status: string | null;
  to_status: string;
  actor_user_id: string | null;
  note: string | null;
  message: string | null;
  recipient: any;
  practice: any;
  created_at: string;
};

export type GodModeEmail = {
  id: string;
  notification_id: string | null;
  email_type: string;
  recipient_email: string;
  recipient_user_id: string | null;
  selection_id: string | null;
  practice_id: string | null;
  practice_name: string | null;
  campaign_name: string | null;
  status: string;
  error_message: string | null;
  payload: any;
  created_at: string;
  sent_at: string | null;
};

export type GodModeLogEntry = {
  id: string;
  actor_user_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  selection_id: string | null;
  action_type: string;
  target: string | null;
  before_value: any;
  after_value: any;
  reason: string | null;
  silent: boolean;
  created_at: string;
};

export type GodModeSelectionDetails = {
  success: boolean;
  selection: any;
  campaign: any | null;
  bespoke_campaign: any | null;
  practice: any;
  practice_members: Array<{
    user_id: string;
    email: string;
    role: string;
    first_name: string | null;
    last_name: string | null;
  }>;
  status_history: GodModeStatusHistory[];
  notifications: GodModeNotification[];
  emails: GodModeEmail[];
  god_mode_log: GodModeLogEntry[];
  error?: string;
};

export function useGodModeSelectionDetails(
  selectionId: string | null,
  enabled = true
) {
  return useQuery<GodModeSelectionDetails>({
    queryKey: ["god_mode_details", selectionId],
    enabled: enabled && !!selectionId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeGetSelectionDetails,
        { p_selection_id: selectionId }
      );
      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.error || "Failed to load details");
      return data as GodModeSelectionDetails;
    },
  });
}

export type GodModeUpdateSelectionArgs = {
  selectionId: string;
  patch: Record<string, any>;
  reason?: string | null;
};

export function useGodModeUpdateSelection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ selectionId, patch, reason }: GodModeUpdateSelectionArgs) => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeUpdateSelection,
        {
          p_selection_id: selectionId,
          p_patch: patch,
          p_reason: reason ?? null,
        }
      );
      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.error || "Failed to update selection");
      return data;
    },
    onSuccess: (_data, vars) => {
      toast.success("Selection updated");
      qc.invalidateQueries({
        queryKey: ["god_mode_details", vars.selectionId],
      });
      qc.invalidateQueries({ queryKey: ["god_mode_search"] });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Failed to update selection");
    },
  });
}

export type GodModeUpdateBespokeArgs = {
  bespokeCampaignId: string;
  selectionId: string;
  patch: Record<string, any>;
  reason?: string | null;
};

export function useGodModeUpdateBespokeCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bespokeCampaignId,
      selectionId,
      patch,
      reason,
    }: GodModeUpdateBespokeArgs) => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeUpdateBespokeCampaign,
        {
          p_bespoke_campaign_id: bespokeCampaignId,
          p_selection_id: selectionId,
          p_patch: patch,
          p_reason: reason ?? null,
        }
      );
      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.error || "Failed to update bespoke campaign");
      return data;
    },
    onSuccess: (_data, vars) => {
      toast.success("Bespoke campaign updated");
      qc.invalidateQueries({
        queryKey: ["god_mode_details", vars.selectionId],
      });
      qc.invalidateQueries({ queryKey: ["god_mode_search"] });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Failed to update bespoke campaign");
    },
  });
}

// ─── Phase 3 hooks ──────────────────────────────────────────────

const invalidateGodMode = (qc: ReturnType<typeof useQueryClient>, selectionId: string) => {
  qc.invalidateQueries({ queryKey: ["god_mode_details", selectionId] });
  qc.invalidateQueries({ queryKey: ["god_mode_search"] });
  qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });
};

export type GodModeForceStatusArgs = {
  selectionId: string;
  targetStatus: string;
  createNotification?: boolean;
  silent?: boolean;
  reason?: string | null;
};

export function useGodModeForceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      selectionId,
      targetStatus,
      createNotification,
      silent,
      reason,
    }: GodModeForceStatusArgs) => {
      const { data, error } = await supabase.rpc(RPCFunctions.GodModeForceStatus, {
        p_selection_id: selectionId,
        p_target_status: targetStatus,
        p_create_notification: !!createNotification,
        p_silent: silent ?? true,
        p_reason: reason ?? null,
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Failed to force status");
      return data;
    },
    onSuccess: (_data, vars) => {
      toast.success("Status forced");
      invalidateGodMode(qc, vars.selectionId);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to force status"),
  });
}

export type GodModeUpdatePayloadsArgs = {
  selectionId: string;
  notificationTypes: string[];
  payloadPatch: Record<string, any>;
  reason?: string | null;
};

export function useGodModeUpdatePayloads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      selectionId,
      notificationTypes,
      payloadPatch,
      reason,
    }: GodModeUpdatePayloadsArgs) => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeUpdateNotificationPayloads,
        {
          p_selection_id: selectionId,
          p_notification_types: notificationTypes,
          p_payload_patch: payloadPatch,
          p_reason: reason ?? null,
        }
      );
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Failed to update payloads");
      return data;
    },
    onSuccess: (data, vars) => {
      const count = (data as any)?.updated_count ?? 0;
      toast.success(`Updated ${count} notification payload${count === 1 ? "" : "s"}`);
      invalidateGodMode(qc, vars.selectionId);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to update payloads"),
  });
}

export type GodModeRecreateNotificationArgs = {
  selectionId: string;
  notificationType: string;
  audience: "admins" | "practice";
  payload?: Record<string, any> | null;
  reason?: string | null;
};

export function useGodModeRecreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      selectionId,
      notificationType,
      audience,
      payload,
      reason,
    }: GodModeRecreateNotificationArgs) => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeRecreateNotification,
        {
          p_selection_id: selectionId,
          p_notification_type: notificationType,
          p_audience: audience,
          p_payload: payload ?? null,
          p_reason: reason ?? null,
        }
      );
      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.error || "Failed to recreate notification");
      return data;
    },
    onSuccess: (_data, vars) => {
      toast.success("Notification recreated");
      invalidateGodMode(qc, vars.selectionId);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to recreate notification"),
  });
}

export type GodModeForceMarkReadArgs = {
  selectionId: string;
  notificationId?: string | null;
  reason?: string | null;
};

export function useGodModeForceMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      selectionId,
      notificationId,
      reason,
    }: GodModeForceMarkReadArgs) => {
      const { data, error } = await supabase.rpc(RPCFunctions.GodModeForceMarkRead, {
        p_selection_id: selectionId,
        p_notification_id: notificationId ?? null,
        p_reason: reason ?? null,
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Failed to mark read");
      return data;
    },
    onSuccess: (data, vars) => {
      const count = (data as any)?.targets_marked ?? 0;
      toast.success(`Marked ${count} target${count === 1 ? "" : "s"} as read`);
      invalidateGodMode(qc, vars.selectionId);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to mark read"),
  });
}

export type GodModeResendEmailArgs = {
  selectionId: string;
  notificationId: string;
  recipientEmails: string[];
  reason?: string | null;
};

export function useGodModeResendEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      selectionId,
      notificationId,
      recipientEmails,
      reason,
    }: GodModeResendEmailArgs) => {
      // Step 1: call the Express server with recipient override
      const expressUrl = (import.meta as any).env?.VITE_EXPRESS_URL;
      if (!expressUrl) throw new Error("VITE_EXPRESS_URL is not set");

      const res = await fetch(`${expressUrl}/send-notification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId,
          recipientEmailsOverride: recipientEmails,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Email send failed (${res.status})`);
      }
      const sendResult = await res.json().catch(() => ({}));

      // Step 2: log the action
      const { data, error } = await supabase.rpc(RPCFunctions.GodModeLogResend, {
        p_selection_id: selectionId,
        p_notification_id: notificationId,
        p_recipient_emails: recipientEmails,
        p_reason: reason ?? null,
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Failed to log resend");
      return { sendResult, logResult: data };
    },
    onSuccess: (_data, vars) => {
      toast.success(`Email resent to ${vars.recipientEmails.length} recipient(s)`);
      invalidateGodMode(qc, vars.selectionId);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to resend email"),
  });
}

// ─── Phase 4 hooks ──────────────────────────────────────────────

export type GodModeDeleteSelectionArgs = {
  selectionId: string;
  reason?: string | null;
};

export function useGodModeDeleteSelection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ selectionId, reason }: GodModeDeleteSelectionArgs) => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeDeleteSelection,
        { p_selection_id: selectionId, p_reason: reason ?? null }
      );
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Failed to delete");
      return data;
    },
    onSuccess: () => {
      toast.success("Selection permanently deleted");
      qc.invalidateQueries({ queryKey: ["god_mode_search"] });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to delete"),
  });
}

export type GodModeArchiveSelectionArgs = GodModeDeleteSelectionArgs;

export function useGodModeArchiveSelection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ selectionId, reason }: GodModeArchiveSelectionArgs) => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeArchiveSelection,
        { p_selection_id: selectionId, p_reason: reason ?? null }
      );
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Failed to archive");
      return data;
    },
    onSuccess: () => {
      toast.success("Selection archived");
      qc.invalidateQueries({ queryKey: ["god_mode_search"] });
      qc.invalidateQueries({ queryKey: [RPCFunctions.GetPlans], exact: false });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to archive"),
  });
}

export type GodModeReassignPracticeArgs = {
  selectionId: string;
  newPracticeId: string;
  reason?: string | null;
};

export function useGodModeReassignPractice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      selectionId,
      newPracticeId,
      reason,
    }: GodModeReassignPracticeArgs) => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeReassignPractice,
        {
          p_selection_id: selectionId,
          p_new_practice_id: newPracticeId,
          p_reason: reason ?? null,
        }
      );
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Failed to reassign");
      return data;
    },
    onSuccess: (_data, vars) => {
      toast.success("Selection reassigned to new practice");
      invalidateGodMode(qc, vars.selectionId);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to reassign"),
  });
}

export type GodModePractice = { id: string; name: string };

export function useGodModeListPractices(enabled = true) {
  return useQuery<GodModePractice[]>({
    queryKey: ["god_mode_list_practices"],
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(RPCFunctions.GodModeListPractices);
      if (error) throw error;
      return (data ?? []) as GodModePractice[];
    },
  });
}

export type GodModeUpdateSelectionCreativesArgs = {
  selectionId: string;
  newCreatives: any[];
  reason?: string | null;
};

export function useGodModeUpdateSelectionCreatives() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      selectionId,
      newCreatives,
      reason,
    }: GodModeUpdateSelectionCreativesArgs) => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeUpdateSelectionCreatives,
        {
          p_selection_id: selectionId,
          p_new_creatives: newCreatives,
          p_reason: reason ?? null,
        }
      );
      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.error || "Failed to update creatives");
      return data;
    },
    onSuccess: (data, vars) => {
      const count = (data as any)?.notifications_updated ?? 0;
      toast.success(`Creatives updated across ${count} notification${count === 1 ? "" : "s"}`);
      invalidateGodMode(qc, vars.selectionId);
    },
    onError: (e: any) =>
      toast.error(e?.message ?? "Failed to update creatives"),
  });
}

export type GodModeReplacePayloadArgs = {
  notificationId: string;
  selectionId: string;
  newPayload: Record<string, any>;
  reason?: string | null;
};

export function useGodModeReplacePayload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      notificationId,
      selectionId,
      newPayload,
      reason,
    }: GodModeReplacePayloadArgs) => {
      const { data, error } = await supabase.rpc(
        RPCFunctions.GodModeReplaceNotificationPayload,
        {
          p_notification_id: notificationId,
          p_selection_id: selectionId,
          p_new_payload: newPayload,
          p_reason: reason ?? null,
        }
      );
      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.error || "Failed to replace payload");
      return data;
    },
    onSuccess: (_data, vars) => {
      toast.success("Notification payload replaced");
      invalidateGodMode(qc, vars.selectionId);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to replace payload"),
  });
}
