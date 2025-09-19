import { toast } from "sonner";
import { supabase } from "./supabase";

export const signin = async () => {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "azure",
		options: {
			scopes: "email",
			redirectTo: window.location.origin,
		},
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

export const getUser = async ({ userId }) => {
	const { data, error } = await supabase
		.from("users")
		.select()
		.eq("id", userId)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	if (!data) {
		toast.error("User not found", { position: "top-center" });
		throw new Error("User not found");
	}

	return data;
};
