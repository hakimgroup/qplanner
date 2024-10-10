import { toast } from "sonner";
import { supabase } from "./supabase";
import { AppRoutes } from "@/shared/shared.models";

export interface User {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	role?: string;
}

export const signup = async (user: User) => {
	const { data, error: signUpError } = await supabase.auth.signUp({
		email: user.email,
		password: user.password,
		options: {
			data: {
				first_name: user.first_name,
				last_name: user.last_name,
				isAdmin: false,
			},
		},
	});

	if (signUpError) {
		toast.error(signUpError.message);
		throw signUpError;
	}

	return data;
};

export const signin = async (email: string, password: string) => {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		toast.error(error.message);
		throw new Error(error.message);
	}

	return data;
};

export const signout = async () => {
	const { error } = await supabase.auth.signOut();

	if (error) {
		toast.error(error.message);
		throw error;
	}
};

export const resetPassword = async ({ email }) => {
	const url: string = import.meta.env.VITE_APP_BASE_URL;

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${url}${AppRoutes.Reset}`,
	});

	if (error) {
		toast.error(error.message);
		throw error;
	}
};

export const updatePassword = async ({ password }) => {
	const { error } = await supabase.auth.updateUser({ password });

	if (error) {
		toast.error(error.message);
		throw error;
	}
};
