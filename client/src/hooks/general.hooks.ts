// hooks/useFilterOptions.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { RPCFunctions } from "@/shared/shared.models";
import { FilterOptions, GetAssetsResponse } from "@/models/general.models";
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

export const getAssets = async (): Promise<GetAssetsResponse> => {
  const { data, error } = await supabase.rpc(RPCFunctions.GetAssets);
  if (error) throw new Error(error.message);
  return data as GetAssetsResponse;
};

export const useAssets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [RPCFunctions.GetAssets],
    queryFn: getAssets,
    staleTime: 1000 * 60 * 5, // ✅ cache for 5 minutes
  });
};
