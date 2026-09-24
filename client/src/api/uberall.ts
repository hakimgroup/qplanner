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
 * A lightweight "Opening Uberall…" splash painted into the new tab the instant
 * it opens. Without it the tab sits blank-white for the couple of seconds it
 * takes to verify the session, run the SSO handshake, and mint the token —
 * which reads as "nothing is happening" and gets closed. Self-contained inline
 * HTML/CSS so it renders immediately with no network of its own.
 */
const UBERALL_SPLASH_HTML = `<!doctype html><html><head><meta charset="utf-8">
<title>Opening Uberall…</title><style>
html,body{height:100%;margin:0}
body{display:flex;align-items:center;justify-content:center;
  background:#faf9ff;color:#3b3b52;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
.box{text-align:center;padding:24px}
.spinner{width:46px;height:46px;margin:0 auto 20px;border:4px solid #e5e2f5;
  border-top-color:#12b5b0;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
h1{font-size:18px;font-weight:600;margin:0 0 6px}
p{font-size:13px;color:#8a8aa0;margin:0}
</style></head><body><div class="box"><div class="spinner"></div>
<h1>Opening Uberall…</h1><p>One moment while we sign you in.</p></div></body></html>`;

/**
 * Open Uberall for the current user (or, for super-admins, another user via
 * targetEmail). The server verifies the caller's session, mints a silent-login
 * token, and returns the dashboard redirect URL; we open it in a new tab.
 *
 * We open the blank tab SYNCHRONOUSLY (before the await) so popup blockers
 * don't block it, immediately paint a loading splash into it, then point it at
 * the redirect once the token is minted.
 */
export async function openUberall(targetEmail?: string): Promise<void> {
	const tab = window.open("", "_blank");
	if (tab) {
		tab.opener = null; // sever the opener reference for safety
		try {
			tab.document.write(UBERALL_SPLASH_HTML);
			tab.document.close();
		} catch {
			// If we can't write to the tab, it just stays blank — no worse than before.
		}
	}
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
