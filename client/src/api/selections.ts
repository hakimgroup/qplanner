import { PlansFilter, PlanRow } from "@/models/selection.models";
import { RPCFunctions } from "@/shared/shared.models";
import { supabase } from "./supabase";

export async function fetchPlans(
	filters: PlansFilter = {}
): Promise<PlanRow[]> {
	const { practiceId, status, category, source, tier, isBespoke } = filters;

	const { data, error } = await supabase.rpc(
		RPCFunctions.GetPlans ?? "get_plans",
		{
			p_practice_id: practiceId ?? null,
			p_status: status ?? null,
			p_category: category ?? null,
			p_source: source ?? null,
			p_tier: tier ?? null,
			p_is_bespoke: isBespoke ?? false,
		}
	);

	if (error) throw error;
	return (data ?? []) as PlanRow[];
}
