import api from "./express";
import { supabase } from "./supabase";
import { RPCFunctions } from "@/shared/shared.models";

/** Aggregate counters + unresolved-practice list for the Health page (super-admin RPC). */
export async function fetchUberallHealth(): Promise<any> {
	const { data, error } = await supabase.rpc(RPCFunctions.GetUberallHealth);
	if (error) throw error;
	return data;
}

/** Recent sync-log rows (RLS: super-admin only). */
export async function fetchUberallLog(limit = 200): Promise<any[]> {
	const { data, error } = await supabase
		.from("uberall_sync_log")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(limit);
	if (error) throw error;
	return data ?? [];
}

/** Trigger the reconcile (super-admin session auth). dryRun reports without changing anything. */
export async function runUberallReconcile(dryRun: boolean): Promise<any> {
	const { data } = await supabase.auth.getSession();
	const token = data.session?.access_token;
	if (!token) throw new Error("You need to be signed in.");
	const res = await api.post(
		"/reconcile-uberall",
		{ dryRun },
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	return res.data;
}

/** The "Open Uberall" button only shows when this build flag is on. */
export const uberallEnabledClient = () =>
	import.meta.env.VITE_UBERALL_ENABLED === "true";

/**
 * Open Uberall for the current user (or, for super-admins, another user via
 * targetEmail). The server verifies the caller's session, mints a silent-login
 * token, and returns the dashboard redirect URL; we open it in a new tab.
 *
 * We open the blank tab SYNCHRONOUSLY (before the await) so popup blockers
 * don't block it, then point it at the redirect once the token is minted.
 */
export async function openUberall(targetEmail?: string): Promise<void> {
	const tab = window.open("", "_blank");
	if (tab) tab.opener = null; // sever the opener reference for safety
	try {
		const { data } = await supabase.auth.getSession();
		const token = data.session?.access_token;
		if (!token) throw new Error("You need to be signed in to open Uberall.");

		const res = await api.post(
			"/uberall/sso",
			targetEmail ? { targetEmail } : {},
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		const url = res.data?.redirectUrl;
		if (!url) throw new Error(res.data?.error || "Could not open Uberall.");

		if (tab) tab.location.href = url;
		else window.location.href = url; // fallback if the popup was blocked
	} catch (e: any) {
		if (tab) tab.close();
		throw new Error(
			e?.response?.data?.error || e?.message || "Could not open Uberall."
		);
	}
}
