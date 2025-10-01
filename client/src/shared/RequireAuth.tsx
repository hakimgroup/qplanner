import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import { AppRoutes } from "@/shared/shared.models";

export function RequireAuth({ children }: { children: JSX.Element }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return null; // or a small spinner if you prefer

	if (!user) {
		return (
			<Navigate to={AppRoutes.Login} replace state={{ from: location }} />
		);
	}

	return children;
}
