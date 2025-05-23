import {
	getUser,
	resetPassword,
	signin,
	signout,
	signup,
	updatePassword,
	User,
} from "@/api/auth";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/shared/AuthProvider";
import { AppRoutes } from "@/shared/shared.models";
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

export const useSignup = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (user: User) => signup(user),
		onSuccess: async ({ user }) => {
			const { data: insertData, error: insertError } = await supabase
				.from("users")
				.insert({
					id: user.id,
					first_name: user.user_metadata.first_name,
					last_name: user.user_metadata.last_name,
					role: user.user_metadata.isAdmin ? "admin" : "user",
				});

			if (insertError) {
				toast.error(insertError.message);
				throw insertError;
			}

			navigate(`${AppRoutes.Calendar}/1`);

			return insertData;
		},
	});
};

export const useSignin = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (user: { email: string; password: string }) =>
			signin(user.email, user.password),
		onSuccess: () => {
			navigate(`${AppRoutes.Calendar}/1`);
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

export const useResetPassword = () => {
	return useMutation({
		mutationFn: (email: string) => resetPassword({ email }),
	});
};

export const useUpdatePassword = () => {
	const navigate = useNavigate();
	const { auth } = useAuth();

	return useMutation({
		mutationFn: (password: string) => updatePassword({ password }),
		onSuccess: () => {
			toast.success("Password updated successfully!", {
				position: "top-center",
			});

			if (!auth) {
				navigate(AppRoutes.Login);
			}
		},
	});
};

export default function useUser() {
	const { user } = useAuth();

	return useQuery<UsersModel>({
		queryKey: ["users"],
		queryFn: () => getUser({ userId: user?.id }),
	});
}
