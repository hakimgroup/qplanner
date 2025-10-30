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
  PlansFilter,
  Selection,
  UpdateSelectionInput,
} from "@/models/selection.models";
import {
  DatabaseTables,
  RPCFunctions,
  SelectionStatus,
} from "@/shared/shared.models";
import { fetchPlans } from "@/api/selections";
import { useAuth } from "@/shared/AuthProvider";
import { toast } from "sonner";
import { GetAssetsResponse } from "@/models/general.models";
import { useAssets } from "./general.hooks";

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

  return useMutation({
    mutationFn: async (input: AddSelectionInput) => {
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
      return data as Selection;
    },
    onSuccess: () => {
      onSuccess && onSuccess();
      qc.invalidateQueries({
        queryKey: [DatabaseTables.CampaignsCatalog],
        exact: false,
      });
    },
  });
}

export function useUpdateSelection() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patch }: UpdateSelectionInput) => {
      const { data, error } = await supabase
        .from(DatabaseTables.Selections)
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Selection;
    },
    onSuccess: () => {
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
    },
  });
}

type DeleteSelectionArgs = {
  selectionId: string;
  bespokeId?: string | null;
};

export function useDeleteSelection() {
  const qc = useQueryClient();

  return useMutation({
    // ⬇️ accept object with optional bespokeId
    mutationFn: async ({ selectionId, bespokeId }: DeleteSelectionArgs) => {
      // 1️⃣ delete selection
      const { error: selError } = await supabase
        .from(DatabaseTables.Selections)
        .delete()
        .eq("id", selectionId);

      if (selError) throw selError;

      // 2️⃣ if bespokeId provided, also delete from bespoke_campaigns
      if (bespokeId) {
        const { error: bespokeError } = await supabase
          .from(DatabaseTables.BespokeCampaigns)
          .delete()
          .eq("id", bespokeId);

        if (bespokeError) throw bespokeError;
      }

      return { selectionId, bespokeId };
    },

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [DatabaseTables.CampaignsCatalog],
        exact: false,
      });
    },

    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to delete selection.");
    },
  });
}

export function usePlans<TData = PlanRow[]>(
  filters: PlansFilter = {},
  options?: UseQueryOptions<PlanRow[], unknown, TData, any[]>
) {
  return useQuery<PlanRow[], unknown, TData, any[]>({
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

    onSuccess: ({ sourceId, targetId }) => {
      toast.success(`Campaigns copied successfully!`);
      qc.invalidateQueries({
        queryKey: [DatabaseTables.CampaignsCatalog],
        exact: false,
      });
    },

    onError: (err: any) => {
      toast.error(err.message || "Failed to copy campaigns.");
    },
  });
}
