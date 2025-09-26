import { AllowedUser, getUsers, Role, signin, signout } from "@/api/auth";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/shared/AuthProvider";
import {
	AppRoutes,
	DatabaseTables,
	RPCFunctions,
} from "@/shared/shared.models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UsersModel {
	id: string;
	created_at: string;
	first_name: string;
	last_name: string;
	role: "user" | "admin";
}

export const useSignin = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: () => signin(),
		onSuccess: () => {
			navigate(AppRoutes.Dashboard);
		},
	});
};

export const useSignout = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: () => signout(),
		onSuccess: () => {
			queryClient.removeQueries();
			navigate(AppRoutes.Login);
		},
	});
};

export default function useUsers(filters?: {
	id?: string | null;
	role?: Role | null;
}) {
	const { user } = useAuth();

	const id = filters?.id ?? null;
	const role = filters?.role ?? null;

	return useQuery<AllowedUser[]>({
		queryKey: [DatabaseTables.Allowed_Users, id, role],
		queryFn: async () => {
			const { data, error } = await supabase.rpc(RPCFunctions.GetUsers, {
				p_id: id,
				p_role: role,
			});
			if (error) throw new Error(error.message);
			return (data ?? []) as AllowedUser[];
		},
		enabled: !!user, // don’t run until we know auth state
	});
}

/** Optional convenience: get a single user by id (returns null if none) */
export function useUserById(id?: string | null) {
	const { data, ...rest } = useUsers({ id: id ?? null });
	return { data: (data && data[0]) ?? null, ...rest };
}

export type UpdateUserArgs = {
	id: string; // required
	first_name?: string | null;
	last_name?: string | null;
	email?: string | null;
	role?: Role | null;
	assigned_practices?: string[] | null; // array of practice IDs, pass null to leave unchanged
};

export function useUpdateUser() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (args: UpdateUserArgs) => {
			// Map to RPC parameter names exactly
			const { data, error } = await supabase.rpc("update_user", {
				p_id: args.id,
				p_first_name: args.first_name ?? null,
				p_last_name: args.last_name ?? null,
				p_email: args.email ?? null,
				p_role: args.role ?? null,
				p_assigned_practices: args.assigned_practices ?? null,
			});

			if (error) throw error;
			return data; // updated row w/ assigned_practices array
		},
		onSuccess: () => {
			// Invalidate any users lists/detail you use
			qc.invalidateQueries({ queryKey: [DatabaseTables.Allowed_Users] });
			toast.success("User updated");
		},
		onError: (e: any) => {
			toast.error(e?.message ?? "Failed to update user");
		},
	});
}
