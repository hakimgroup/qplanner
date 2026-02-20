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

type Role = "user" | "admin" | "super_admin" | null;

interface AuthContextModel {
	user: User | null;
	loading: boolean;
	userError: boolean;
	role: Role;
	isAdmin: boolean;
	firstName: string | null;
	lastName: string | null;
}
const AuthContext = createContext<AuthContextModel>({
	user: null,
	loading: true,
	userError: false,
	role: null,
	isAdmin: false,
	firstName: null,
	lastName: null,
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
				const { allowed, role, firstName, lastName } = await fetchWhitelistAndRole(email);
				if (cancelled) return;

				if (!allowed) {
					pushAuthNotice("denied");
					await supabase.auth.signOut().catch(() => {});
					if (cancelled) return;
					setUser(null);
					setRole(null);
					setFirstName(null);
					setLastName(null);
					lastCheckedUserIdRef.current = null;
					linkedOnceRef.current = false;
					navigate(AppRoutes.Login, { replace: true });
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

						const adminLike =
							role === "admin" || role === "super_admin";
						const target = adminLike
							? AppRoutes.Admin
							: AppRoutes.Dashboard;

						const alreadyOnAdmin = pathname.startsWith(
							AppRoutes.Admin
						);
						if (!(adminLike && alreadyOnAdmin)) {
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
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
