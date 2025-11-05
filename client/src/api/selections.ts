import {
  PlansFilter,
  Plans,
  RequestAssetsBulkResponse,
} from "@/models/selection.models";
import { RPCFunctions } from "@/shared/shared.models";
import { supabase } from "./supabase";

export async function fetchPlans(filters: PlansFilter = {}): Promise<Plans> {
  const { practiceIds, status, category, source, tier, isBespoke } = filters;

  const { data, error } = await supabase.rpc(
    RPCFunctions.GetPlans ?? "get_plans",
    {
      p_practice_ids: practiceIds ?? null,
      p_status: status ?? null,
      p_category: category ?? null,
      p_source: source ?? null,
      p_tier: tier ?? null,
      p_is_bespoke: isBespoke ?? false,
    }
  );

  if (error) throw error;
  return (data ?? {}) as Plans;
}

export async function requestAssetsBulk(
  selectionIds: string[]
): Promise<RequestAssetsBulkResponse> {
  const { data, error } = await supabase.rpc(RPCFunctions.RequestAssetsBulk, {
    p_selection_ids: selectionIds,
  });

  if (error) throw error;
  return (data ?? {}) as RequestAssetsBulkResponse;
}
