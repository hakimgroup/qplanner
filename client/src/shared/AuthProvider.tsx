// AuthProvider.tsx
import { supabase } from "@/api/supabase";
import { LoadingOverlay } from "@mantine/core";
import { User } from "@supabase/supabase-js";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { AppRoutes, DatabaseTables, RPCFunctions } from "./shared.models";
import { useNavigate } from "react-router-dom";
import { pushAuthNotice } from "./shared.utilities";

interface AuthContextModel {
	user: User | null;
	loading: boolean;
	userError: boolean;
}
const AuthContext = createContext<AuthContextModel>({
	user: null,
	loading: true,
	userError: false,
});
export const useAuth = () => useContext(AuthContext);

async function isWhitelisted(email: string): Promise<boolean> {
	const { data, error } = await supabase
		.from(DatabaseTables.Allowed_Users)
		.select("id")
		.eq("email", email.toLowerCase())
		.maybeSingle();
	if (error) throw error;
	return !!data;
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [userError, setUserError] = useState<boolean>(false);

	// 1) Initialize session (no whitelist yet) and subscribe to auth changes
	useEffect(() => {
		let mounted = true;

		(async () => {
			setUserError(false);
			const { data, error } = await supabase.auth.getSession();
			if (!mounted) return;

			if (error) setUserError(true);
			setUser(data.session?.user ?? null);
			setLoading(false); // ✅ always clear loader after initial session read
		})();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				if (!mounted) return;
				// Don’t toggle loading here; whitelist check happens in the next effect
				setUser(session?.user ?? null);
			}
		);

		return () => {
			mounted = false;
			authListener.subscription.unsubscribe();
		};
	}, []);

	// 2) When a user appears, run the whitelist check (+ link_current_user on success)
	useEffect(() => {
		let cancelled = false;

		async function check() {
			if (!user?.email) return; // no user -> nothing to check

			try {
				setLoading(true);

				const allowed = await isWhitelisted(user.email);
				if (cancelled) return;

				if (!allowed) {
					// Not whitelisted → sign out and notify
					pushAuthNotice("denied");
					await supabase.auth.signOut().catch(() => {});
					if (cancelled) return;
					setUser(null);
					navigate(AppRoutes.Login, { replace: true });
					return; // stop here
				}

				// ✅ Whitelisted → link allowed_users.id (and practice_members.user_id) to auth.uid()
				// This RPC is security definer on the DB side and idempotent.
				try {
					await supabase.rpc(RPCFunctions.LinkUser);
				} catch {
					// Non-fatal: don't block the user if the link fails
					// You can optionally log this for observability
				}
			} catch (_err) {
				if (!cancelled) {
					setUserError(true);
					pushAuthNotice("failed");

					// Fail-safe: sign out to avoid half-authorized state
					await supabase.auth.signOut().catch(() => {});
					if (!cancelled) {
						setUser(null);
						navigate(AppRoutes.Login, { replace: true });
					}
				}
			} finally {
				if (!cancelled) setLoading(false); // ✅ always clear loader
			}
		}

		check();
		return () => {
			cancelled = true;
		};
	}, [user, navigate]);

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
		<AuthContext.Provider value={{ user, loading, userError }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
