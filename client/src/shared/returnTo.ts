/**
 * Remembering where someone was headed when sign-in interrupted them.
 *
 * Sharing a link to a landing page — `/landing/q4-campaigns` — used to drop the
 * recipient on the dashboard instead. Three separate things discarded the
 * destination, and the middle one is why React Router state alone cannot fix it:
 *
 *   1. `RequireAuth` bounced to /login carrying `state.from`, which is React
 *      Router state held in memory.
 *   2. Signing in leaves the site entirely for Microsoft and comes back to
 *      `window.location.origin`. That is a full page load, so in-memory state is
 *      gone, and the return URL is the site root regardless of where they asked
 *      for.
 *   3. The login page then sent everyone to the dashboard.
 *
 * sessionStorage survives that round trip, is scoped to the one tab, and dies
 * with it — so a stale destination cannot resurface days later. It is the same
 * mechanism `signin()` already uses for `oauth_just_signed_in`.
 *
 * Putting the path in the OAuth `redirectTo` would be the other option, but each
 * distinct redirect URL has to be allowlisted in the Supabase dashboard. This
 * needs no configuration change.
 */

const KEY = "return_to";

/**
 * Only in-app paths, and never one that would bounce straight back to sign-in.
 *
 * The `//` check matters: `//evil.com` is a protocol-relative URL, so a browser
 * treats it as another origin. Without that guard this is an open redirect —
 * anyone could seed the key and send a signed-in user off-site.
 */
function isSafeInternalPath(path: string): boolean {
	if (!path.startsWith("/")) return false;
	if (path.startsWith("//")) return false;
	const [pathname] = path.split(/[?#]/);
	return pathname !== "/" && pathname !== "/login";
}

/** Remember an in-app destination across the OAuth round trip. */
export function rememberReturnTo(path: string): void {
	try {
		if (isSafeInternalPath(path)) sessionStorage.setItem(KEY, path);
	} catch {
		// Private browsing can refuse storage. Losing the destination is a
		// worse landing page, not a broken sign-in — never throw from here.
	}
}

/**
 * Take the destination back, once. Returns null when there is nothing safe to
 * return to, which is the normal case for someone signing in from the front door.
 */
export function takeReturnTo(): string | null {
	try {
		const path = sessionStorage.getItem(KEY);
		sessionStorage.removeItem(KEY);
		return path && isSafeInternalPath(path) ? path : null;
	} catch {
		return null;
	}
}
