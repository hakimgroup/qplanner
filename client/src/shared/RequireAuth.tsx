import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/shared/AuthProvider";
import { AppRoutes } from "@/shared/shared.models";
import { rememberReturnTo } from "@/shared/returnTo";
import { pushAuthNotice } from "@/shared/shared.utilities";

/**
 * The planner gate: a signed-in account that is also in `allowed_users`.
 *
 * Being signed in is no longer sufficient. Landing pages open for anyone in the
 * Hakim tenant, so a valid session can belong to someone with no planner access —
 * and without the `allowed` check here they could reach a landing page and then
 * walk straight into the dashboard. `AuthProvider` only runs its whitelist check
 * once per user id per session, so it would not catch them on the way through.
 */
export function RequireAuth({ children }: { children: JSX.Element }) {
	const { user, loading, allowed } = useAuth();
	const location = useLocation();

	// Signed in but not provisioned. The refusal used to live in AuthProvider,
	// unconditionally; it moved here so it applies to the planner and not to a
	// shared landing page link.
	const refused = Boolean(user) && allowed === false;
	useEffect(() => {
		if (!refused) return;
		pushAuthNotice("denied");
		supabase.auth.signOut().catch(() => {});
	}, [refused]);

	if (loading) return null; // or a small spinner if you prefer

	// `allowed === null` means the whitelist check has not answered yet. Waiting
	// avoids a flash of the login page for a perfectly valid user.
	if (user && allowed === null) return null;

	if (!user || !allowed) {
		// `state.from` is kept for anything already reading it, but it cannot
		// survive sign-in on its own: the OAuth hop to Microsoft is a full page
		// load, which empties React Router's in-memory state. The same
		// destination goes to sessionStorage, which does survive it — see
		// shared/returnTo.ts.
		if (!user) {
			rememberReturnTo(
				location.pathname + location.search + location.hash
			);
		}
		return (
			<Navigate to={AppRoutes.Login} replace state={{ from: location }} />
		);
	}

	return children;
}

/**
 * The landing gate: any signed-in Hakim tenant account, provisioned or not.
 *
 * See shared/landingAccess.ts for why this is a separate, lighter door.
 */
export function RequireSignedIn({ children }: { children: JSX.Element }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return null;

	if (!user) {
		rememberReturnTo(location.pathname + location.search + location.hash);
		return (
			<Navigate to={AppRoutes.Login} replace state={{ from: location }} />
		);
	}

	return children;
}
