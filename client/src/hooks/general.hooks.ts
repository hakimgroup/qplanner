// hooks/useFilterOptions.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { RPCFunctions } from "@/shared/shared.models";
import { FilterOptions } from "@/models/general.models";
import { useAuth } from "@/shared/AuthProvider";

export const getFilterOptions = async () => {
	const { data, error } = await supabase.rpc(RPCFunctions.GetFilterOptions);
	if (error) throw new Error(error.message);
	return data as FilterOptions;
};

export const useFilterOptions = () => {
	const { user } = useAuth();
	return useQuery<FilterOptions>({
		queryKey: [RPCFunctions.GetFilterOptions],
		queryFn: () => getFilterOptions(),
		enabled: Boolean(user),
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	});
};
