// AuthProvider.tsx
import { supabase } from "@/api/supabase";
import { LoadingOverlay } from "@mantine/core";
import { User } from "@supabase/supabase-js";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	useRef,
	ReactNode,
} from "react";
import { AppRoutes, DatabaseTables, RPCFunctions } from "./shared.models";
import { useNavigate } from "react-router-dom";
import { pushAuthNotice } from "./shared.utilities";

type Role = "user" | "admin" | "super_admin" | null;

interface AuthContextModel {
	user: User | null;
	loading: boolean; // now: ONLY initial bootstrap loading
	userError: boolean;
	role: Role;
	isAdmin: boolean;
}
const AuthContext = createContext<AuthContextModel>({
	user: null,
	loading: true,
	userError: false,
	role: null,
	isAdmin: false,
});
export const useAuth = () => useContext(AuthContext);

// Single fetch for whitelist + role (reduces API calls)
async function fetchWhitelistAndRole(
	email: string
): Promise<{ allowed: boolean; role: Role }> {
	const { data, error } = await supabase
		.from(DatabaseTables.Allowed_Users)
		.select("id, role")
		.eq("email", email.toLowerCase())
		.maybeSingle();

	if (error) throw error;
	return { allowed: !!data, role: (data?.role as Role) ?? null };
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [role, setRole] = useState<Role>(null);
	const [loading, setLoading] = useState<boolean>(true); // <- only for initial getSession now
	const [userError, setUserError] = useState<boolean>(false);

	// Flags to prevent redundant checks & redirects
	const justSignedInRef = useRef(false);
	const lastCheckedUserIdRef = useRef<string | null>(null);
	const linkedOnceRef = useRef<boolean>(false);

	// 1) Initialize session and subscribe to auth changes
	useEffect(() => {
		let mounted = true;

		(async () => {
			setUserError(false);
			const { data, error } = await supabase.auth.getSession();
			if (!mounted) return;

			if (error) setUserError(true);
			setUser(data.session?.user ?? null);
			setLoading(false); // ✅ only initial bootstrap shows loader
		})();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				if (!mounted) return;

				if (event === "SIGNED_IN") {
					justSignedInRef.current = true;
					// reset dedupe flags for newly signed-in user
					lastCheckedUserIdRef.current = null;
					linkedOnceRef.current = false;
				}
				if (event === "SIGNED_OUT") {
					lastCheckedUserIdRef.current = null;
					linkedOnceRef.current = false;
					setRole(null);
				}

				setUser(session?.user ?? null);
			}
		);

		return () => {
			mounted = false;
			authListener.subscription.unsubscribe();
		};
	}, []);

	// 2) When a user appears, do whitelist/role/link once per user (no page loader here)
	useEffect(() => {
		let cancelled = false;

		async function checkOncePerUser() {
			const uid = user?.id ?? null;
			const email = user?.email ?? null;

			// No user -> nothing to check
			if (!uid || !email) return;

			// De-dupe: if we already checked this user id and no fresh sign-in, skip
			if (
				lastCheckedUserIdRef.current === uid &&
				!justSignedInRef.current
			) {
				return;
			}

			try {
				const { allowed, role } = await fetchWhitelistAndRole(email);
				if (cancelled) return;

				if (!allowed) {
					pushAuthNotice("denied");
					await supabase.auth.signOut().catch(() => {});
					if (cancelled) return;
					setUser(null);
					setRole(null);
					lastCheckedUserIdRef.current = null;
					linkedOnceRef.current = false;
					navigate(AppRoutes.Login, { replace: true });
					return;
				}

				// Link only once per session (idempotent on DB, but avoid extra RPCs)
				if (!linkedOnceRef.current) {
					try {
						await supabase.rpc(RPCFunctions.LinkUser);
					} catch {
						// Non-fatal; ignore
					} finally {
						linkedOnceRef.current = true;
					}
				}

				setRole(role);

				// Redirect only on fresh OAuth sign-in
				if (justSignedInRef.current) {
					justSignedInRef.current = false;
					const adminLike =
						role === "admin" || role === "super_admin";
					navigate(
						adminLike ? AppRoutes.Admin : AppRoutes.Dashboard,
						{
							replace: true,
						}
					);
				}
			} catch (_err) {
				if (!cancelled) {
					setUserError(true);
					pushAuthNotice("failed");
					await supabase.auth.signOut().catch(() => {});
					if (!cancelled) {
						setUser(null);
						setRole(null);
						lastCheckedUserIdRef.current = null;
						linkedOnceRef.current = false;
						navigate(AppRoutes.Login, { replace: true });
					}
				}
			} finally {
				// Mark this user as checked (regardless of outcome) to prevent re-running on route changes
				lastCheckedUserIdRef.current = uid;
			}
		}

		checkOncePerUser();
		return () => {
			cancelled = true;
		};
	}, [user, navigate]);

	// ✅ Loader only during initial bootstrap — no flashes on route changes
	if (loading) {
		return (
			<LoadingOverlay
				visible
				zIndex={1000}
				overlayProps={{ radius: "sm", blur: 2 }}
			/>
		);
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				loading, // now strictly "bootstrapping" state
				userError,
				role,
				isAdmin: role === "admin" || role === "super_admin",
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
