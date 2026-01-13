import { supabase } from "@/api/supabase";
import { usePractice } from "@/shared/PracticeProvider";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  AddSelectionInput,
  PlanRow,
  Plans,
  PlansFilter,
  Selection,
  UpdateSelectionInput,
} from "@/models/selection.models";
import {
  ActorNotificationType,
  DatabaseTables,
  RPCFunctions,
  SelectionStatus,
} from "@/shared/shared.models";
import { fetchPlans } from "@/api/selections";
import { useAuth } from "@/shared/AuthProvider";
import { toast } from "sonner";
import { GetAssetsResponse } from "@/models/general.models";
import { useAssets } from "./general.hooks";
import { sendActorEmail } from "@/api/emails";

/**
 * Check if a practice has been onboarded (received their onboarding summary email).
 * Actor notifications/emails should only be sent after the practice is onboarded.
 * Returns true if onboarded, false otherwise.
 */
async function isPracticeOnboarded(practiceId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("practice_onboarding_emails")
      .select("id, status")
      .eq("practice_id", practiceId)
      .eq("status", "sent")
      .limit(1);

    if (error) {
      console.error("[Onboarding Check] Error:", error.message);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error("[Onboarding Check] Unexpected error:", err);
    return false;
  }
}

/**
 * Create an in-app notification for the actor (the user who performed the action).
 * This is used for campaign add/update/delete actions.
 * Errors are logged but not thrown to avoid affecting the main flow.
 */
async function createActorNotification({
  type,
  userId,
  practiceId,
  selectionId,
  campaignId,
  campaignName,
  campaignCategory,
  fromDate,
  toDate,
  isBespoke,
}: {
  type: ActorNotificationType;
  userId: string;
  practiceId: string;
  selectionId?: string;
  campaignId?: string;
  campaignName: string;
  campaignCategory?: string;
  fromDate?: string;
  toDate?: string;
  isBespoke?: boolean;
}): Promise<string | null> {
  try {
    // Build notification title and message based on type
    let title: string;
    let message: string;

    switch (type) {
      case ActorNotificationType.CampaignAdded:
        title = "Campaign Added";
        message = `You added "${campaignName}" to your plan.`;
        break;
      case ActorNotificationType.CampaignUpdated:
        title = "Campaign Updated";
        message = `You updated "${campaignName}".`;
        break;
      case ActorNotificationType.CampaignDeleted:
        title = "Campaign Removed";
        message = `You removed "${campaignName}" from your plan.`;
        break;
      case ActorNotificationType.BespokeAdded:
        title = "Bespoke Campaign Added";
        message = `You created a bespoke campaign: "${campaignName}".`;
        break;
      case ActorNotificationType.BulkAdded:
        title = "Campaigns Added";
        message = `You added ${campaignName} to your plan.`;
        break;
      case ActorNotificationType.CampaignsCopied:
        title = "Campaigns Copied";
        message = `Campaigns have been copied to this practice.`;
        break;
      default:
        title = "Campaign Action";
        message = `Action performed on "${campaignName}".`;
    }

    // Build payload
    const payload = {
      name: campaignName,
      category: campaignCategory || "Campaign",
      from_date: fromDate,
      to_date: toDate,
      is_bespoke: isBespoke || false,
      actor_action: type,
    };

    // Insert notification
    const { data: notification, error: notifError } = await supabase
      .from(DatabaseTables.Notifications)
      .insert({
        type,
        practice_id: practiceId,
        selection_id: selectionId || null,
        campaign_id: campaignId || null,
        actor_user_id: userId,
        audience: "practice", // Uses "practice" as audience type - notification_targets scopes to actor
        title,
        message,
        payload,
      })
      .select("id")
      .single();

    if (notifError) {
      console.error("[Actor Notification] Failed to create:", notifError.message);
      return null;
    }

    // Insert notification target (the actor themselves)
    const { error: targetError } = await supabase
      .from("notification_targets")
      .insert({
        notification_id: notification.id,
        user_id: userId,
        practice_id: practiceId,
      });

    if (targetError) {
      console.error("[Actor Notification] Failed to create target:", targetError.message);
    }

    return notification.id;
  } catch (err) {
    console.error("[Actor Notification] Unexpected error:", err);
    return null;
  }
}

/**
 * Queue the first-time practice onboarding email.
 * This is called after a selection is added to a practice.
 * The RPC is idempotent - it will only queue the email once per practice.
 * Errors are logged but not thrown to avoid affecting the main flow.
 */
async function queuePracticeOnboardingEmail(
  practiceId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc(
      RPCFunctions.QueuePracticeOnboardingEmail,
      {
        p_practice_id: practiceId,
        p_triggered_by: userId,
      }
    );
    if (error) {
      console.error("[Onboarding Email] Failed to queue:", error.message);
    }
  } catch (err) {
    console.error("[Onboarding Email] Unexpected error:", err);
  }
}

const key = (activePracticeId: string | null, unitedView: boolean) => [
  DatabaseTables.Selections,
  { p: activePracticeId, u: unitedView },
];

async function fetchSelection(selectionId: string) {
  if (!selectionId) return null;

  const { data, error } = await supabase
    .from(DatabaseTables.Selections)
    .select("*")
    .eq("id", selectionId)
    .single();

  if (error) throw error;
  return data;
}

export function useSelectionById(selectionId: string | null | undefined) {
  const query = useQuery({
    queryKey: ["selection", selectionId],
    queryFn: () => fetchSelection(selectionId as string),
    enabled: !!selectionId, // don't auto-run if we don't have an id
    staleTime: 0, // always treat as fresh (forces spinner each click)
  });

  return query;
}

export function useSelections() {
  const { activePracticeId, unitedView } = usePractice();
  const { user } = useAuth();

  return useQuery({
    queryKey: key(activePracticeId, unitedView),
    enabled: Boolean(user && (unitedView || !!activePracticeId)),
    queryFn: async (): Promise<Selection[]> => {
      let q = supabase.from(DatabaseTables.Selections).select();

      if (!unitedView && activePracticeId) {
        q = q.eq("practice_id", activePracticeId);
      }

      const { data, error } = await q.order("from_date", {
        ascending: true,
      });

      if (error) throw error;
      return (data ?? []) as Selection[];
    },
  });
}

export function useAddSelection(onSuccess?: () => void) {
  const qc = useQueryClient();
  const { activePracticeId } = usePractice();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: AddSelectionInput & { campaignName?: string; campaignCategory?: string }) => {
      if (!activePracticeId) throw new Error("No active practice selected");

      const payload = {
        practice_id: activePracticeId,
        campaign_id: input.campaign_id,
        from_date: input.from_date,
        to_date: input.to_date,
        status: input.status ?? SelectionStatus.OnPlan,
        notes: input.notes ?? null,
        bespoke: input.bespoke ?? false,
        source: input.source,
      };

      const { data, error } = await supabase
        .from(DatabaseTables.Selections)
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Return selection with campaign info for email
      return {
        selection: data as Selection,
        campaignName: input.campaignName,
        campaignCategory: input.campaignCategory,
      };
    },
    onSuccess: async ({ selection, campaignName, campaignCategory }) => {
      onSuccess && onSuccess();
      qc.invalidateQueries({
        queryKey: [DatabaseTables.CampaignsCatalog],
        exact: false,
      });

      // Queue first-time practice onboarding email (fire-and-forget)
      if (activePracticeId && user?.id) {
        queuePracticeOnboardingEmail(activePracticeId, user.id);
      }

      // Send actor notification and email only if practice is already onboarded
      if (user?.id && activePracticeId) {
        // Check if practice has been onboarded (received onboarding summary email)
        const isOnboarded = await isPracticeOnboarded(activePracticeId);

        if (isOnboarded) {
          // Fetch campaign name if not provided
          let finalCampaignName = campaignName;
          let finalCategory = campaignCategory;

          if (!finalCampaignName && selection.campaign_id) {
            const { data: campaign } = await supabase
              .from(DatabaseTables.CampaignsCatalog)
              .select("name, category")
              .eq("id", selection.campaign_id)
              .single();
            if (campaign) {
              finalCampaignName = campaign.name;
              finalCategory = campaign.category;
            }
          }

          // Send actor email and create in-app notification (handled by server)
          // Await to ensure notification is created before invalidating
          await sendActorEmail({
            type: "added",
            userId: user.id,
            practiceId: activePracticeId,
            selectionId: selection.id,
            campaignName: finalCampaignName || "Campaign",
            campaignCategory: finalCategory || "Campaign",
            fromDate: selection.from_date,
            toDate: selection.to_date,
            isBespoke: selection.bespoke,
          });

          // Invalidate notifications to show the new actor notification
          qc.invalidateQueries({ queryKey: [DatabaseTables.Notifications] });
        }
      }
    },
  });
}

export function useUpdateSelection() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, patch, campaignName, campaignCategory }: UpdateSelectionInput & { campaignName?: string; campaignCategory?: string }) => {
      const { data, error } = await supabase
        .from(DatabaseTables.Selections)
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { selection: data as Selection, campaignName, campaignCategory };
    },
    onSuccess: async ({ selection, campaignName, campaignCategory }) => {
      //Invalidate ALL cached get_campaigns variants (united + any practiceId)
      qc.invalidateQueries({
        queryKey: [DatabaseTables.CampaignsCatalog],
        exact: false,
      });

      //Invalidate ALL cached get_plans
      qc.invalidateQueries({
        queryKey: [RPCFunctions.GetPlans],
        exact: false,
      });

      // Send actor notification and email only if practice is already onboarded
      if (user?.id && selection.practice_id) {
        // Check if practice has been onboarded (received onboarding summary email)
        const isOnboarded = await isPracticeOnboarded(selection.practice_id);

        if (isOnboarded) {
          // Fetch campaign name if not provided
          let finalCampaignName = campaignName;
          let finalCategory = campaignCategory;

          if (!finalCampaignName) {
            if (selection.bespoke && selection.bespoke_campaign_id) {
              const { data: bespoke } = await supabase
                .from(DatabaseTables.BespokeCampaigns)
                .select("name, category")
                .eq("id", selection.bespoke_campaign_id)
                .single();
              if (bespoke) {
                finalCampaignName = bespoke.name;
                finalCategory = bespoke.category || "Bespoke";
              }
            } else if (selection.campaign_id) {
              const { data: campaign } = await supabase
                .from(DatabaseTables.CampaignsCatalog)
                .select("name, category")
                .eq("id", selection.campaign_id)
                .single();
              if (campaign) {
                finalCampaignName = campaign.name;
                finalCategory = campaign.category;
              }
            }
          }

          // Send actor email and create in-app notification (handled by server)
          // Await to ensure notification is created before invalidating
          await sendActorEmail({
            type: "updated",
            userId: user.id,
            practiceId: selection.practice_id,
            selectionId: selection.id,
            campaignName: finalCampaignName || "Campaign",
            campaignCategory: finalCategory || "Campaign",
            fromDate: selection.from_date,
            toDate: selection.to_date,
            isBespoke: selection.bespoke,
          });

          // Invalidate notifications to show the new actor notification
          qc.invalidateQueries({ queryKey: [DatabaseTables.Notifications] });
        }
      }
    },
  });
}

type DeleteSelectionArgs = {
  selectionId: string;
  bespokeId?: string | null;
  // Optional pre-fetched details for email
  campaignName?: string;
  campaignCategory?: string;
  practiceId?: string;
  isBespoke?: boolean;
};

export function useDeleteSelection() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ selectionId, campaignName, campaignCategory, practiceId, isBespoke }: DeleteSelectionArgs) => {
      // Fetch selection details before deletion if not provided
      let finalCampaignName = campaignName;
      let finalCategory = campaignCategory;
      let finalPracticeId = practiceId;
      let finalIsBespoke = isBespoke;

      if (!finalCampaignName || !finalPracticeId) {
        const { data: selection } = await supabase
          .from(DatabaseTables.Selections)
          .select("id, practice_id, campaign_id, bespoke_campaign_id, bespoke")
          .eq("id", selectionId)
          .single();

        if (selection) {
          finalPracticeId = selection.practice_id;
          finalIsBespoke = selection.bespoke;

          if (selection.bespoke && selection.bespoke_campaign_id) {
            const { data: bespoke } = await supabase
              .from(DatabaseTables.BespokeCampaigns)
              .select("name, category")
              .eq("id", selection.bespoke_campaign_id)
              .single();
            if (bespoke) {
              finalCampaignName = bespoke.name;
              finalCategory = bespoke.category || "Bespoke";
            }
          } else if (selection.campaign_id) {
            const { data: campaign } = await supabase
              .from(DatabaseTables.CampaignsCatalog)
              .select("name, category")
              .eq("id", selection.campaign_id)
              .single();
            if (campaign) {
              finalCampaignName = campaign.name;
              finalCategory = campaign.category;
            }
          }
        }
      }

      // call the RPC that archives then deletes the selection
      const { data, error } = await supabase.rpc(RPCFunctions.DeleteSelection, {
        p_selection_id: selectionId,
      });

      if (error) throw error;

      return {
        result: data,
        campaignName: finalCampaignName,
        campaignCategory: finalCategory,
        practiceId: finalPracticeId,
        isBespoke: finalIsBespoke,
        selectionId,
      };
    },

    onSuccess: async ({ campaignName, campaignCategory, practiceId, isBespoke, selectionId }) => {
      // refresh anything that depends on selections
      qc.invalidateQueries({ queryKey: [DatabaseTables.Notifications] });
      qc.invalidateQueries({ queryKey: [DatabaseTables.Selections] });
      qc.invalidateQueries({
        queryKey: [DatabaseTables.CampaignsCatalog],
        exact: false,
      });

      // Create in-app notification and send email for actor only if practice is onboarded
      if (user?.id && practiceId) {
        // Check if practice has been onboarded (received onboarding summary email)
        const isOnboarded = await isPracticeOnboarded(practiceId);

        if (isOnboarded) {
          // Send actor email and create in-app notification (handled by server)
          sendActorEmail({
            type: "deleted",
            userId: user.id,
            practiceId,
            selectionId,
            campaignName: campaignName || "Campaign",
            campaignCategory: campaignCategory || "Campaign",
            isBespoke: isBespoke || false,
          });
        }
      }
    },

    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to delete selection.");
    },
  });
}

export function usePlans<TData = Plans>(
  filters: PlansFilter = {},
  options?: UseQueryOptions<Plans, unknown, TData, any[]>
) {
  return useQuery<Plans, unknown, TData, any[]>({
    queryKey: [RPCFunctions.GetPlans, filters],
    queryFn: () => fetchPlans(filters),
    refetchOnWindowFocus: false,
    ...options,
  });
}

type CopyPayload = {
  sourceId: string;
  targetId: string;
};

export function useCopyPracticeCampaigns() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ sourceId, targetId }: CopyPayload) => {
      if (!sourceId || !targetId)
        throw new Error("Both source and target practice IDs are required");
      if (sourceId === targetId)
        throw new Error("Source and target cannot be the same");

      const { error } = await supabase.rpc(RPCFunctions.CopyPracticeCampaigns, {
        p_source: sourceId,
        p_target: targetId,
      });

      if (error) throw error;
      return { sourceId, targetId };
    },

    onSuccess: async ({ sourceId, targetId }) => {
      toast.success(`Campaigns copied successfully!`);
      qc.invalidateQueries({
        queryKey: [DatabaseTables.CampaignsCatalog],
        exact: false,
      });

      // Queue first-time practice onboarding email for target practice (fire-and-forget)
      if (targetId && user?.id) {
        queuePracticeOnboardingEmail(targetId, user.id);

        // Check if target practice has been onboarded before sending actor notification/email
        const isOnboarded = await isPracticeOnboarded(targetId);

        if (isOnboarded) {
          // Send actor email and create in-app notification (handled by server)
          // Await to ensure notification is created before invalidating
          await sendActorEmail({
            type: "campaigns_copied",
            userId: user.id,
            practiceId: targetId,
          });

          // Invalidate notifications to show the new actor notification
          qc.invalidateQueries({ queryKey: [DatabaseTables.Notifications] });
        }
      }
    },

    onError: (err: any) => {
      toast.error(err.message || "Failed to copy campaigns.");
    },
  });
}
