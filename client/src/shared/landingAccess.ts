/**
 * Where the planner's two levels of access divide.
 *
 * The app has one sign-in but two audiences:
 *
 *   Landing pages   a valid Hakim tenant Microsoft account is enough. These are
 *                   campaign pages meant to be shared — a link sent to a practice
 *                   has to open for whoever receives it, including people who were
 *                   never provisioned in the planner.
 *
 *   Everything else  requires `allowed_users`, exactly as before.
 *
 * This is the whole of that boundary. It is deliberately one small function with
 * no imports: `AuthProvider` and `RequireAuth` both depend on it, and anything
 * richer would make them import each other.
 *
 * Note the SSO tenant is doing real work here. The Azure app is restricted to the
 * hakimgroup.co.uk tenant, so "signed in" already means "someone at Hakim Group".
 * If that restriction were ever relaxed to `common`, this would silently become
 * "anyone on the internet with a Microsoft account" — so if the Azure app
 * registration's supported account types change, revisit this file first.
 */

/**
 * Individual campaign pages only — `/landing/<slug>`.
 *
 * The `/landing` index itself is deliberately excluded. It carries the planner's
 * Nav and is an internal browsing surface; a viewer with no planner access would
 * see a menu of things they cannot open. The shareable artefact is the campaign
 * page, and that is what opens up.
 */
export function isLandingPath(pathname: string): boolean {
	return /^\/landing\/[^/]+/.test(pathname);
}
