import { supabase } from "@/api/supabase";
import { LoadingOverlay } from "@mantine/core";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextModel {
	user: User | null;
	auth: boolean;
	loading: boolean;
	userError: boolean;
}

const AuthContext = createContext<AuthContextModel>({
	user: null,
	auth: false,
	loading: false,
	userError: false,
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [auth, setAuth] = useState(false);
	const [loading, setLoading] = useState(null);
	const [userError, setUserError] = useState(null);

	useEffect(() => {
		setLoading(true);
		setUserError(false);

		const getUser = async () => {
			const { data, error } = await supabase.auth.getUser();
			const { user: currentUser } = data;

			if (error) {
				setUserError(true);
			}

			setUser(currentUser);
			setLoading(false);
		};

		getUser();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				switch (event) {
					case "SIGNED_IN":
						setUser(session.user);
						setAuth(true);
						break;
					case "SIGNED_OUT":
						setUser(null);
						setAuth(false);
						break;
					case "PASSWORD_RECOVERY":
						setAuth(false);
						break;
					default:
				}
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	if (loading) {
		return (
			<LoadingOverlay
				visible={loading}
				zIndex={1000}
				overlayProps={{ radius: "sm", blur: 2 }}
			/>
		);
	}

	return (
		<AuthContext.Provider value={{ user, auth, loading, userError }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
