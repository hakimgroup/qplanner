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
import { useNavigate, useLocation } from "react-router-dom";
import { pushAuthNotice } from "./shared.utilities";
import { takeReturnTo, returnToWasClaimed } from "./returnTo";
import { isLandingPath } from "./landingAccess";

type Role = "user" | "admin" | "super_admin" | null;

interface AuthContextModel {
	user: User | null;
	loading: boolean;
	userError: boolean;
	role: Role;
	isAdmin: boolean;
	firstName: string | null;
	lastName: string | null;
	/**
	 * Whether this account is in `allowed_users` — i.e. may use the planner.
	 *
	 * A signed-in user is no longer automatically an authorised one. Landing
	 * pages are shareable across the Hakim tenant, so someone can hold a valid
	 * session without being provisioned. `null` means the check has not
	 * finished. Planner routes must require `allowed`, not merely `user`:
	 * RequireAuth does exactly that, and is the only thing standing between a
	 * landing-page viewer and the dashboard.
	 */
	allowed: boolean | null;
}
const AuthContext = createContext<AuthContextModel>({
	user: null,
	loading: true,
	userError: false,
	role: null,
	isAdmin: false,
	firstName: null,
	lastName: null,
	allowed: null,
});
export const useAuth = () => useContext(AuthContext);

async function fetchWhitelistAndRole(
	email: string
): Promise<{ allowed: boolean; role: Role; firstName: string | null; lastName: string | null }> {
	const { data, error } = await supabase
		.from(DatabaseTables.Allowed_Users)
		.select("id, role, first_name, last_name")
		.eq("email", email.toLowerCase())
		.maybeSingle();

	if (error) throw error;
	return {
		allowed: !!data,
		role: (data?.role as Role) ?? null,
		firstName: data?.first_name ?? null,
		lastName: data?.last_name ?? null,
	};
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [user, setUser] = useState<User | null>(null);
	const [role, setRole] = useState<Role>(null);
	const [allowed, setAllowed] = useState<boolean | null>(null);
	const [firstName, setFirstName] = useState<string | null>(null);
	const [lastName, setLastName] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [userError, setUserError] = useState<boolean>(false);

	const justSignedInRef = useRef(false);
	const lastCheckedUserIdRef = useRef<string | null>(null);
	const linkedOnceRef = useRef<boolean>(false);

	useEffect(() => {
		let mounted = true;

		(async () => {
			setUserError(false);
			const { data, error } = await supabase.auth.getSession();
			if (!mounted) return;

			// Dev auto-login: if no session and dev credentials are set, sign in automatically
			if (
				!data.session &&
				import.meta.env.VITE_DEV_USER_EMAIL &&
				import.meta.env.VITE_DEV_USER_PASSWORD
			) {
				const { data: devData, error: devError } =
					await supabase.auth.signInWithPassword({
						email: import.meta.env.VITE_DEV_USER_EMAIL,
						password: import.meta.env.VITE_DEV_USER_PASSWORD,
					});
				if (!mounted) return;
				if (devError) {
					console.error("[Dev Auth] Auto-login failed:", devError.message);
					setLoading(false);
					return;
				}
				setUser(devData.session?.user ?? null);
				setLoading(false);
				return;
			}

			if (error) setUserError(true);
			setUser(data.session?.user ?? null);
			setLoading(false);
		})();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				if (!mounted) return;

				if (event === "SIGNED_IN") {
					justSignedInRef.current = true;
					lastCheckedUserIdRef.current = null;
					linkedOnceRef.current = false;
				}
				if (event === "SIGNED_OUT") {
					lastCheckedUserIdRef.current = null;
					linkedOnceRef.current = false;
					setRole(null);
					// Back to "not yet checked", not "refused". Leaving a stale
					// value here would have RequireAuth judge the next account
					// on the last one's answer.
					setAllowed(null);
				}

				setUser(session?.user ?? null);
			}
		);

		return () => {
			mounted = false;
			authListener.subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function checkOncePerUser() {
			const uid = user?.id ?? null;
			const email = user?.email ?? null;
			if (!uid || !email) return;

			if (
				lastCheckedUserIdRef.current === uid &&
				!justSignedInRef.current
			) {
				return;
			}

			try {
				const {
					allowed: isAllowed,
					role,
					firstName,
					lastName,
				} = await fetchWhitelistAndRole(email);
				if (cancelled) return;

				setAllowed(isAllowed);

				if (!isAllowed) {
					// Not provisioned for the planner — but a valid Hakim tenant
					// account, which is enough to read a landing page. The session
					// is kept rather than torn down, and RequireAuth turns them
					// away from everything else.
					//
					// Rejection used to happen here, unconditionally. It moved to
					// RequireAuth so it can depend on where they are going: this
					// code cannot know that, and signing them out here would make
					// a shared /landing/… link unopenable for exactly the people
					// it gets sent to.
					setRole(null);
					setFirstName(firstName);
					setLastName(lastName);
					justSignedInRef.current = false;

					// Send them where they were headed. With nothing stored they
					// came through the front door with no planner access, so the
					// old refusal is still the right answer.
					const returnTo = takeReturnTo();
					sessionStorage.removeItem("oauth_just_signed_in");
					if (returnTo) {
						navigate(returnTo, { replace: true });
					} else if (!returnToWasClaimed() && !isLandingPath(pathname)) {
						pushAuthNotice("denied");
						await supabase.auth.signOut().catch(() => {});
						if (cancelled) return;
						setUser(null);
						setAllowed(null);
						lastCheckedUserIdRef.current = null;
						linkedOnceRef.current = false;
						navigate(AppRoutes.Login, { replace: true });
					}
					return;
				}

				if (!linkedOnceRef.current) {
					try {
						await supabase.rpc(RPCFunctions.LinkUser);
					} catch {
						// ignore
					} finally {
						linkedOnceRef.current = true;
					}
				}

				setRole(role);
				setFirstName(firstName);
				setLastName(lastName);

				// ⭐ Redirect ONLY on fresh sign-in:
				if (justSignedInRef.current) {
					justSignedInRef.current = false;

					const startedOAuthHere =
						sessionStorage.getItem("oauth_just_signed_in") === "1";
					// only redirect if we really just kicked off OAuth from this tab
					if (startedOAuthHere) {
						sessionStorage.removeItem("oauth_just_signed_in");

						// Somewhere they asked for before sign-in interrupted
						// them — a shared /landing/… link, say — wins over the
						// role's default landing spot. Null for anyone signing
						// in from the front door, which is the common case.
						// See shared/returnTo.ts for why this cannot ride on
						// React Router state.
						const returnTo = takeReturnTo();

						const adminLike =
							role === "admin" || role === "super_admin";
						const target =
							returnTo ??
							(adminLike ? AppRoutes.Admin : AppRoutes.Dashboard);

						const alreadyOnAdmin = pathname.startsWith(
							AppRoutes.Admin
						);
						// Nothing left to claim and someone already used one —
						// the login page got here first and has sent them to the
						// page they asked for. Overwriting it with the role
						// default is exactly the bug this guards against.
						const standDown = !returnTo && returnToWasClaimed();
						if (
							!standDown &&
							(returnTo || !(adminLike && alreadyOnAdmin))
						) {
							navigate(target, { replace: true });
						}
					}
				}
			} catch (_err) {
				if (!cancelled) {
					setUserError(true);
					pushAuthNotice("failed");
					await supabase.auth.signOut().catch(() => {});
					if (!cancelled) {
						setUser(null);
						setRole(null);
						setFirstName(null);
						setLastName(null);
						lastCheckedUserIdRef.current = null;
						linkedOnceRef.current = false;
						navigate(AppRoutes.Login, { replace: true });
					}
				}
			} finally {
				lastCheckedUserIdRef.current = uid;
			}
		}

		checkOncePerUser();
		return () => {
			cancelled = true;
		};
	}, [user, navigate, pathname]);

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
				loading,
				userError,
				role,
				isAdmin: role === "admin" || role === "super_admin",
				firstName,
				lastName,
				allowed,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
