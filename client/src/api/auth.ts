import { toast } from "sonner";
import { supabase } from "./supabase";
import { AppRoutes, DatabaseTables } from "@/shared/shared.models";
import { Practice } from "@/shared/PracticeProvider";

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

export async function signOutSafe(redirectTo: string = AppRoutes.Login) {
	try {
		// 1) Check current session
		const { data } = await supabase.auth.getSession();
		const hasSession = !!data.session;

		if (hasSession) {
			// 2) Try global sign-out first (logs out all devices)
			const { error } = await supabase.auth.signOut({ scope: "global" });
			if (error && error.code !== "session_not_found") {
				// Unknown error → fall back to local
				await supabase.auth.signOut({ scope: "local" });
			}
		} else {
			// No session on server → clear local tokens silently
			await supabase.auth.signOut({ scope: "local" });
		}
	} catch {
		// Any unexpected issue → still clear local cache
		await supabase.auth.signOut({ scope: "local" });
	} finally {
		// Your app-specific cleanup here if needed
		// e.g., reset stores, clear query cache, etc.
		window.location.replace(redirectTo);
	}
}

export type Role = "user" | "admin" | "super_admin";
export type AllowedUser = {
	id: string;
	first_name: string | null;
	last_name: string | null;
	email: string | null;
	role: Role;
	created_at: string;
	last_login?: string | null;
	assigned_practices?: Practice[];
};

export const getUsers = async (opts?: {
	id?: string | null;
	role?: Role | null;
}) => {
	const { id = null, role = null } = opts ?? {};

	let query = supabase.from(DatabaseTables.Allowed_Users).select("*");

	if (id) query = query.eq("id", id);
	if (role) query = query.eq("role", role);

	const { data, error } = await query;

	if (error) {
		throw new Error(error.message);
	}

	// Keep UX feedback, but don't throw on "no matches" — return [] instead.
	if (!data || data.length === 0) {
		return [];
	}

	return data as AllowedUser[];
};
