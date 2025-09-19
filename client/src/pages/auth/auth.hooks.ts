import { getUser, signin, signout } from "@/api/auth";
import { useAuth } from "@/shared/AuthProvider";
import { AppRoutes } from "@/shared/shared.models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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

export default function useUser() {
	const { user } = useAuth();

	return useQuery<UsersModel>({
		queryKey: ["users"],
		queryFn: () => getUser({ userId: user?.id }),
	});
}
