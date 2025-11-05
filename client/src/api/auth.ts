import { toast } from "sonner";
import { supabase } from "./supabase";
import { AppRoutes, DatabaseTables } from "@/shared/shared.models";
import { Practice } from "@/shared/PracticeProvider";

export const signin = async () => {
  // mark that we are intentionally starting OAuth now
  sessionStorage.setItem("oauth_just_signed_in", "1");

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

// OPTIONAL: set this to your Azure tenant/logout flow.
// Use your tenant ID if you don’t want “common”.
const MS_LOGOUT_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/logout";

// If you want to return to your app after Microsoft logout:
const POST_LOGOUT_REDIRECT_URI = window.location.origin + "/login";

/** Aggressively clear local auth state so the user is actually logged out. */
async function safeLocalSignout() {
  // Clear Supabase local session (cookies/localStorage for this client)
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});

  // Extra hardening: remove any sb-* auth tokens (helps with multi-client/storageKey cases)
  try {
    const keysToKill: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || "";
      if (k.startsWith("sb-") && k.endsWith("-auth-token")) {
        keysToKill.push(k);
      }
    }
    keysToKill.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }

  // Your app’s own flags
  sessionStorage.removeItem("oauth_just_signed_in");
}

/** Optional: sign out of Microsoft as well, to prevent immediate re-login via IdP. */
function signOutOfMicrosoft() {
  // Only do this if you actually want to end the IdP session, too.
  const url = new URL(MS_LOGOUT_URL);
  url.searchParams.set("post_logout_redirect_uri", POST_LOGOUT_REDIRECT_URI);
  // Full redirect (use replace so back button doesn't return to a dead session)
  window.location.replace(url.toString());
}

export const signout = async ({
  alsoLogoutMicrosoft = false,
}: { alsoLogoutMicrosoft?: boolean } = {}) => {
  try {
    // 1) Do we have a local session?
    const { data: sessionData } = await supabase.auth.getSession();
    const hasSession = Boolean(sessionData?.session);

    if (!hasSession) {
      // Nothing to revoke server-side → do local cleanup and optionally IdP logout
      await safeLocalSignout();
      if (alsoLogoutMicrosoft) signOutOfMicrosoft();
      return;
    }

    // 2) Try global sign-out (revokes refresh token on Supabase)
    const { error } = await supabase.auth.signOut();

    if (error) {
      // Common benign case: server no longer has that session
      const msg = (error as any)?.message || "";
      if (msg.includes("session_not_found")) {
        await safeLocalSignout();
        if (alsoLogoutMicrosoft) signOutOfMicrosoft();
        return;
      }
      throw error;
    }

    // 3) Successful global sign-out → still clear local (belt & braces)
    await safeLocalSignout();
    if (alsoLogoutMicrosoft) signOutOfMicrosoft();
  } catch (err: any) {
    await safeLocalSignout(); // ensure logout UX even if API throws
    toast.error(err?.message ?? "Failed to sign out");
    // Rethrow so caller can handle navigation/state reset
    throw err;
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
