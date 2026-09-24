// =====================================================================
// Uberall integration — server-side client + provisioning (Phase 2)
//
// ALL Uberall calls live here (server-side only). The account private key
// is read from process.env.UBERALL_API_KEY and NEVER reaches the client.
// Identity is correlated to the Planner user by EMAIL (link_current_user()
// rewrites allowed_users.id on login), and the numeric Uberall user id is
// stored as a plain column on allowed_users.
// =====================================================================
import { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Read env lazily (per-call): the server calls dotenv.config() AFTER this
// module is imported, so module-level reads would see empty values locally.
const getBase = () => process.env.UBERALL_BASE_URL || "https://uberall.com/api";
const getKey = () => process.env.UBERALL_API_KEY || "";

export const uberallEnabled = () => !!getKey();

type Json = any;

/** Low-level call. `login=true` uses the privateKey header (SSO); else X-API-KEY. */
async function uberall(
	method: string,
	path: string,
	body?: Json,
	opts: { login?: boolean } = {}
): Promise<Json> {
	const KEY = getKey();
	if (!KEY) throw new Error("UBERALL_API_KEY not set");
	const res = await fetch(`${getBase()}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			[opts.login ? "privateKey" : "X-API-KEY"]: KEY,
		},
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});
	const text = await res.text();
	let data: Json = {};
	try {
		data = text ? JSON.parse(text) : {};
	} catch {
		data = { _raw: text };
	}
	// Uberall signals success via a `status` field, not just HTTP codes.
	if (data?.status && data.status !== "SUCCESS") {
		const err: any = new Error(
			`Uberall ${method} ${path} → ${data.status}: ${data?.message || ""}`
		);
		err.uberallStatus = data.status;
		err.uberallBody = data;
		throw err;
	}
	if (!res.ok) {
		const err: any = new Error(`Uberall ${method} ${path} → HTTP ${res.status}`);
		err.httpStatus = res.status;
		err.uberallBody = data;
		throw err;
	}
	return data?.response ?? data;
}

const asArray = <T>(v: any): T[] => (Array.isArray(v) ? v : []);

/** Resolve an Uberall Location's numeric id from its external identifier. */
export async function resolveLocationId(identifier: string): Promise<string | null> {
	if (!identifier?.trim()) return null;
	const r = await uberall(
		"GET",
		`/locations?identifier=${encodeURIComponent(identifier.trim())}&max=3`
	);
	const locs = asArray<any>(r?.locations);
	const exact = locs.find(
		(l) => String(l?.identifier ?? "").trim().toLowerCase() === identifier.trim().toLowerCase()
	);
	const pick = exact || (locs.length === 1 ? locs[0] : null);
	return pick && String(pick.id).match(/^\d+$/) ? String(pick.id) : null;
}

/**
 * Find a pre-existing Uberall user for this email. Uberall's `?query=` matches
 * on email (the `?identifier=` filter only matches our own external id, which a
 * pre-existing user won't have). Only returns an EXACT email/identifier match —
 * never a fuzzy one — so we never adopt an unrelated account.
 */
async function findExistingUser(email: string): Promise<any | null> {
	const e = email.toLowerCase();
	try {
		const r = await uberall("GET", `/users?query=${encodeURIComponent(email)}&max=10`);
		const users = asArray<any>(r?.users);
		return (
			users.find((u) => String(u?.email ?? "").toLowerCase() === e) ||
			users.find((u) => String(u?.identifier ?? "").toLowerCase() === e) ||
			null
		);
	} catch {
		return null;
	}
}

/** Roles we must never silently re-scope/downgrade when adopting an existing user. */
const PROTECTED_ROLES = new Set(["ADMIN", "ACCOUNT_MANAGER", "API_ADMIN", "UBER_API_ADMIN"]);

export async function getUser(uberallUserId: string): Promise<any> {
	const r = await uberall("GET", `/users/${uberallUserId}`);
	return r?.user ?? r;
}

export async function patchUser(uberallUserId: string, patch: Json): Promise<any> {
	return uberall("PATCH", `/users/${uberallUserId}`, patch);
}

/** Mint a silent-login access token for a user (Basic SSO). */
export async function ssoLoginToken(uberallUserId: string): Promise<string | null> {
	const r = await uberall("POST", "/users/login", { userId: Number(uberallUserId) }, { login: true });
	return r?.access_token ?? null;
}

/** The URL the browser is redirected to after we mint the token. */
export function ssoRedirectUrl(accessToken: string): string {
	return `https://uberall.com/en/app/uberall?access_token=${encodeURIComponent(accessToken)}`;
}

export interface DesiredUser {
	email: string;
	firstName: string;
	lastName: string;
	managedLocations: number[];
}

/**
 * Compute the Uberall access a Planner user should have: the deduped set of
 * resolved Location ids across the practices they belong to. Practices with no
 * resolved uberall_location_id are silently skipped (spec requirement d).
 */
export async function computeDesiredScope(
	supabase: SupabaseClient,
	email: string
): Promise<number[]> {
	const { data, error } = await supabase
		.from("practice_members")
		.select("practices:practice_id(uberall_location_id)")
		.eq("email", email.toLowerCase());
	if (error) throw error;
	const ids = new Set<number>();
	for (const row of data ?? []) {
		const raw = (row as any)?.practices?.uberall_location_id;
		if (raw && String(raw).match(/^\d+$/)) ids.add(Number(raw));
	}
	return [...ids];
}

/** Write an audit row (best-effort; never throws). */
async function logSync(
	supabase: SupabaseClient,
	row: {
		user_email: string | null;
		uberall_user_id?: string | null;
		action: string;
		status: string;
		source: string;
		requested_scope?: any;
		error_message?: string | null;
	}
) {
	try {
		await supabase.from("uberall_sync_log").insert({ ...row, attempted_at: new Date().toISOString() });
	} catch (e) {
		console.warn("[uberall] logSync failed:", (e as any)?.message);
	}
}

export interface EnsureResult {
	success: boolean;
	email: string;
	uberallUserId?: string;
	scope?: number[];
	outcome?: "created" | "adopted" | "existing" | "synced" | "skipped" | "no_scope";
	protectedRole?: boolean;
	error?: string;
}

/**
 * Idempotently ensure a Planner user has exactly one Uberall account,
 * provisioned with their current Location scope. Safe to call repeatedly.
 */
export async function ensureUberallUser(
	supabase: SupabaseClient,
	email: string,
	source = "server"
): Promise<EnsureResult> {
	email = email.toLowerCase();
	const { data: au, error: auErr } = await supabase
		.from("allowed_users")
		.select("email, first_name, last_name, uberall_user_id")
		.eq("email", email)
		.maybeSingle();
	if (auErr) return { success: false, email, error: auErr.message };
	if (!au) return { success: false, email, error: "user not in allowed_users" };

	// Already linked → no-op (Phase 3 handles re-scoping).
	if (au.uberall_user_id) {
		return { success: true, email, uberallUserId: au.uberall_user_id, outcome: "existing" };
	}

	const scope = await computeDesiredScope(supabase, email);

	// Uberall rejects creating a user with no locations ("MISSING_PARAMETER:
	// managedLocations or locationGroupIds missing"). A Planner user with no
	// practice that maps to an Uberall Location has nothing to provision yet —
	// fail clearly instead of firing a doomed POST. They provision automatically
	// once a mapped practice is assigned (membership trigger / reconcile / next
	// open). Note: super_admins are scoped by explicit practice_members too, not
	// by their global "sees all practices" role.
	if (scope.length === 0) {
		await logSync(supabase, {
			user_email: email,
			action: "provision",
			status: "skipped",
			source,
			requested_scope: [],
			error_message: "no mapped Uberall locations — provisioning deferred",
		});
		return {
			success: false,
			email,
			outcome: "no_scope",
			error:
				"You don't have any practices linked to an Uberall location yet, so there's nothing to open. Ask an admin to add you to a practice that's connected to Uberall.",
		};
	}

	const firstName = au.first_name || email.split("@")[0];
	const lastName = au.last_name || "User";

	let uberallUserId: string | undefined;
	let outcome: EnsureResult["outcome"] = "created";
	let protectedRole = false;
	try {
		const created = await uberall("POST", "/users", {
			email,
			firstname: firstName,
			lastname: lastName,
			role: "LOCATION_MANAGER",
			status: "CREATED", // no invite email
			password: crypto.randomBytes(18).toString("base64url"),
			managedLocations: scope,
			identifier: email,
		});
		uberallUserId = String((created?.user ?? created)?.id ?? "");
	} catch (e: any) {
		// Uberall has no idempotency keys and rejects duplicate emails ("Not
		// unique"). Adopt the pre-existing user instead — but LINK ONLY: we must
		// never overwrite an existing user's role/scope here, or we'd downgrade an
		// admin. Scope sync (Phase 3) will also skip protected roles.
		const existing = await findExistingUser(email);
		if (existing?.id) {
			uberallUserId = String(existing.id);
			outcome = "adopted";
			protectedRole = PROTECTED_ROLES.has(String(existing.role || "").toUpperCase());
		} else {
			await logSync(supabase, {
				user_email: email,
				action: "provision",
				status: "failed",
				source,
				requested_scope: scope,
				error_message: e?.message?.slice(0, 500),
			});
			await supabase
				.from("allowed_users")
				.update({ uberall_provision_status: "failed" })
				.eq("email", email);
			return { success: false, email, error: e?.message };
		}
	}

	// Distinguish accounts the Planner CREATED (it manages their scope) from
	// pre-existing accounts it ADOPTED (linked for reference, but the Planner
	// must NOT overwrite their curated scope — would wipe manual assignments).
	const status =
		outcome === "adopted" ? (protectedRole ? "adopted_admin" : "adopted") : "created";

	await supabase
		.from("allowed_users")
		.update({
			uberall_user_id: uberallUserId,
			uberall_provision_status: status,
			uberall_synced_at: new Date().toISOString(),
		})
		.eq("email", email);

	await logSync(supabase, {
		user_email: email,
		uberall_user_id: uberallUserId,
		action: "provision",
		status: "synced",
		source,
		requested_scope: outcome === "created" ? scope : null,
		error_message:
			outcome === "adopted" ? "adopted pre-existing account — scope NOT modified" : null,
	});

	return { success: true, email, uberallUserId, scope, outcome, protectedRole };
}

/**
 * Sync a Planner user's Uberall Location access to their CURRENT practice
 * access — handles adds AND removes (PATCH replaces the full managedLocations
 * array; verified in the sandbox). Provisions first if the user isn't linked
 * yet. NEVER re-scopes a protected (admin) account.
 */
export async function syncUserScope(
	supabase: SupabaseClient,
	email: string,
	source = "server"
): Promise<EnsureResult> {
	email = email.toLowerCase();
	const { data: au, error: auErr } = await supabase
		.from("allowed_users")
		.select("email, uberall_user_id, uberall_provision_status")
		.eq("email", email)
		.maybeSingle();
	if (auErr) return { success: false, email, error: auErr.message };
	if (!au) return { success: false, email, error: "user not in allowed_users" };

	// Not linked yet → provisioning sets the scope on create.
	if (!au.uberall_user_id) return ensureUberallUser(supabase, email, source);

	// Never re-scope an ADOPTED account (pre-existing Uberall user). The Planner
	// only manages the scope of accounts it created; adopted ones keep their
	// curated Uberall access untouched.
	if (
		au.uberall_provision_status === "adopted" ||
		au.uberall_provision_status === "adopted_admin"
	) {
		await logSync(supabase, {
			user_email: email,
			uberall_user_id: au.uberall_user_id,
			action: "sync",
			status: "skipped",
			source,
			error_message: "adopted pre-existing account — scope not managed by Planner",
		});
		return { success: true, email, uberallUserId: au.uberall_user_id, outcome: "skipped" };
	}

	try {
		// Defensive re-check of the live role in case it changed since provisioning.
		const current = await getUser(au.uberall_user_id);
		const role = String(current?.role || "").toUpperCase();
		if (PROTECTED_ROLES.has(role)) {
			await supabase
				.from("allowed_users")
				.update({ uberall_provision_status: "adopted_admin" })
				.eq("email", email);
			await logSync(supabase, {
				user_email: email,
				uberall_user_id: au.uberall_user_id,
				action: "sync",
				status: "skipped",
				source,
				error_message: `protected role ${role} — scope not modified`,
			});
			return { success: true, email, uberallUserId: au.uberall_user_id, outcome: "skipped", protectedRole: true };
		}

		const desired = await computeDesiredScope(supabase, email);

		// Uberall rejects an empty managedLocations PATCH the same way it rejects
		// an empty create. A previously-scoped user who has since lost all mapped
		// locations should be offboarded via the deprovision path (status=INACTIVE),
		// not emptied here — leave their current scope and skip. Their existing
		// Uberall user is still valid, so callers (e.g. SSO) can proceed.
		if (desired.length === 0) {
			await logSync(supabase, {
				user_email: email,
				uberall_user_id: au.uberall_user_id,
				action: "sync",
				status: "skipped",
				source,
				error_message: "no mapped Uberall locations — scope left unchanged",
			});
			return {
				success: true,
				email,
				uberallUserId: au.uberall_user_id,
				outcome: "skipped",
			};
		}

		await patchUser(au.uberall_user_id, { managedLocations: desired });
		await supabase
			.from("allowed_users")
			.update({ uberall_synced_at: new Date().toISOString(), uberall_provision_status: "created" })
			.eq("email", email);
		await logSync(supabase, {
			user_email: email,
			uberall_user_id: au.uberall_user_id,
			action: "sync",
			status: "synced",
			source,
			requested_scope: desired,
		});
		return { success: true, email, uberallUserId: au.uberall_user_id, scope: desired, outcome: "synced" };
	} catch (e: any) {
		await logSync(supabase, {
			user_email: email,
			uberall_user_id: au.uberall_user_id,
			action: "sync",
			status: "failed",
			source,
			error_message: e?.message?.slice(0, 500),
		});
		return { success: false, email, uberallUserId: au.uberall_user_id, error: e?.message };
	}
}

/**
 * Resolve a practice's stored Uberall identifier to a numeric Location id and
 * store it on practices.uberall_location_id. Called when a practice is created
 * or its uberall_business_id changes, and by the reconcile. Behaviour:
 *  - no identifier            → clears uberall_location_id (practice unmaps).
 *  - identifier matches       → stores the numeric id (the existing
 *                               location-change trigger then re-syncs members).
 *  - identifier has NO match  → stores NULL (safely skipped + shown as
 *                               "unresolved" on the Health page); no error.
 */
export async function resolvePractice(
	supabase: SupabaseClient,
	practiceId: string,
	source = "trigger"
): Promise<{ resolved: boolean; locationId: string | null; error?: string }> {
	const { data: p, error } = await supabase
		.from("practices")
		.select("id, uberall_business_id, uberall_location_id")
		.eq("id", practiceId)
		.maybeSingle();
	if (error) return { resolved: false, locationId: null, error: error.message };
	if (!p) return { resolved: false, locationId: null, error: "practice not found" };

	const identifier = (p.uberall_business_id || "").trim();
	let locationId: string | null = null;
	if (identifier) {
		try {
			locationId = await resolveLocationId(identifier);
		} catch (e: any) {
			await logSync(supabase, {
				user_email: null,
				action: "resolve",
				status: "failed",
				source,
				error_message: `resolve "${identifier}": ${e?.message?.slice(0, 200)}`,
			});
			return { resolved: false, locationId: null, error: e?.message };
		}
	}

	if ((p.uberall_location_id || null) !== locationId) {
		await supabase
			.from("practices")
			.update({ uberall_location_id: locationId })
			.eq("id", practiceId);
	}

	await logSync(supabase, {
		user_email: null,
		action: "resolve",
		status: locationId ? "synced" : "skipped",
		source,
		requested_scope: locationId ? [Number(locationId)] : null,
		error_message:
			identifier && !locationId
				? `no Uberall Location matches identifier "${identifier}"`
				: null,
	});

	return { resolved: !!locationId, locationId };
}

/**
 * Deprovision (deactivate) a user's Uberall account when they're deleted in the
 * Planner. Sets status=INACTIVE (reversible, per the offboarding decision) and
 * kills live sessions. Called by the allowed_users DELETE trigger, which only
 * fires for accounts the Planner CREATED (status='created') — adopted accounts
 * are never deactivated. Takes the Uberall id from the trigger (the row is gone).
 */
export async function deprovisionUser(
	supabase: SupabaseClient,
	opts: { email?: string | null; uberallUserId?: string | null },
	source = "trigger"
): Promise<{ success: boolean; error?: string }> {
	const uid = opts.uberallUserId;
	if (!uid) return { success: true }; // nothing to deactivate
	try {
		await patchUser(uid, { status: "INACTIVE" });
		// Best-effort: end any live sessions so access stops immediately.
		try {
			await uberall("DELETE", `/users/${uid}/all-sessions`);
		} catch {
			/* non-fatal */
		}
		await logSync(supabase, {
			user_email: opts.email ?? null,
			uberall_user_id: uid,
			action: "deprovision",
			status: "synced",
			source,
		});
		return { success: true };
	} catch (e: any) {
		await logSync(supabase, {
			user_email: opts.email ?? null,
			uberall_user_id: uid,
			action: "deprovision",
			status: "failed",
			source,
			error_message: e?.message?.slice(0, 300),
		});
		return { success: false, error: e?.message };
	}
}

const sameSet = (a: number[], b: number[]) =>
	a.length === b.length && a.every((x) => b.includes(x));

const scopeOf = (u: any): number[] =>
	(u?.managedLocations ?? [])
		.map((x: any) => (typeof x === "object" ? x?.id : x))
		.filter((n: any) => Number.isFinite(Number(n)))
		.map((n: any) => Number(n));

export interface ReconcileSummary {
	dryRun: boolean;
	checked: number;
	provisioned: number;
	resynced: number;
	inSync: number;
	skipped: number;
	failed: number;
	resolvedPractices: number;
	wouldResolve: number;
	wouldProvision: number;
	wouldResync: number;
	drift: Array<{ email: string; current: number[]; desired: number[] }>;
	errors: Array<{ email: string; error: string }>;
	durationMs: number;
}

/**
 * Safety-net reconcile: the daily backstop for the trigger + sync-on-open.
 * - Provisions users that were never linked / whose provision failed (retry).
 * - For CREATED (managed) users, recomputes desired scope, compares to Uberall,
 *   and PATCHes on drift — this is what guarantees REMOVALS land even for users
 *   who never open Uberall (the security case sync-on-open can't cover).
 * - Skips ADOPTED accounts (never re-scoped).
 * dryRun reports what WOULD change without touching Uberall.
 */
export async function reconcileUberall(
	supabase: SupabaseClient,
	opts: { dryRun?: boolean; limit?: number } = {}
): Promise<ReconcileSummary> {
	const start = Date.now();
	const dryRun = !!opts.dryRun;
	const limit = Math.min(opts.limit ?? 1000, 5000);

	const out: ReconcileSummary = {
		dryRun,
		checked: 0,
		provisioned: 0,
		resynced: 0,
		inSync: 0,
		skipped: 0,
		failed: 0,
		resolvedPractices: 0,
		wouldResolve: 0,
		wouldProvision: 0,
		wouldResync: 0,
		drift: [],
		errors: [],
		durationMs: 0,
	};

	// 0. Resolve any practices with an identifier but no numeric Location id yet
	//    (catches new/edited practices whose resolve fire was missed).
	const { data: pending } = await supabase
		.from("practices")
		.select("id, uberall_business_id")
		.not("uberall_business_id", "is", null)
		.is("uberall_location_id", null)
		.limit(1000);
	for (const pr of pending ?? []) {
		if (!(pr.uberall_business_id || "").trim()) continue;
		if (dryRun) {
			out.wouldResolve++;
		} else {
			try {
				const r = await resolvePractice(supabase, pr.id, "cron");
				if (r.resolved) out.resolvedPractices++;
			} catch {
				/* logged inside resolvePractice */
			}
		}
	}

	const { data: users, error } = await supabase
		.from("allowed_users")
		.select("email, uberall_user_id, uberall_provision_status")
		.limit(limit);
	if (error) throw error;

	let n = 0;
	for (const u of users ?? []) {
		out.checked++;
		const email = (u.email || "").toLowerCase();
		const status = u.uberall_provision_status;

		// Never manage adopted (pre-existing) accounts.
		if (status === "adopted" || status === "adopted_admin") {
			out.skipped++;
			continue;
		}

		try {
			if (!u.uberall_user_id) {
				if (dryRun) {
					out.wouldProvision++;
				} else {
					const r = await ensureUberallUser(supabase, email, "cron");
					if (r.success) out.provisioned++;
					else {
						out.failed++;
						out.errors.push({ email, error: r.error || "provision failed" });
					}
					if (++n % 8 === 0) await new Promise((r) => setTimeout(r, 10000));
				}
				continue;
			}

			// Linked & managed → check for drift (this catches missed removals).
			const desired = await computeDesiredScope(supabase, email);
			const current = scopeOf(await getUser(u.uberall_user_id));
			if (sameSet(desired, current)) {
				out.inSync++;
			} else if (dryRun) {
				out.wouldResync++;
				if (out.drift.length < 200) out.drift.push({ email, current, desired });
			} else {
				await patchUser(u.uberall_user_id, { managedLocations: desired });
				await supabase
					.from("allowed_users")
					.update({ uberall_synced_at: new Date().toISOString() })
					.eq("email", email);
				await logSync(supabase, {
					user_email: email,
					uberall_user_id: u.uberall_user_id,
					action: "sync",
					status: "synced",
					source: "cron",
					requested_scope: desired,
				});
				out.resynced++;
			}
			if (++n % 20 === 0) await new Promise((r) => setTimeout(r, 1500));
		} catch (e: any) {
			out.failed++;
			out.errors.push({ email, error: e?.message?.slice(0, 300) || "error" });
		}
	}

	out.durationMs = Date.now() - start;
	return out;
}
