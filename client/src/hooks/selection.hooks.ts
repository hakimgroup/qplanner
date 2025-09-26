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

const key = (activePracticeId: string | null, unitedView: boolean) => [
	DatabaseTables.Selections,
	{ p: activePracticeId, u: unitedView },
];

export function useSelections() {
	const { activePracticeId, unitedView } = usePractice();

	return useQuery({
		queryKey: key(activePracticeId, unitedView),
		enabled: unitedView || !!activePracticeId,
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
			if (!activePracticeId)
				throw new Error("No active practice selected");
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

export function useDeleteSelection() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase
				.from(DatabaseTables.Selections)
				.delete()
				.eq("id", id);
			if (error) throw error;
			return id;
		},
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [DatabaseTables.CampaignsCatalog],
				exact: false,
			});
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
