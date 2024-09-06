import { toast } from "sonner";
import { supabase } from "./supabase";

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
