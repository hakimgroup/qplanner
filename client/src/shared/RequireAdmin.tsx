// RequireAdmin.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import { AppRoutes } from "@/shared/shared.models";

type Props = { children: ReactNode };

/**
 * Wrap admin-only pages with <RequireAdmin>...</RequireAdmin>.
 * If the user is not an admin, they’re redirected to the Dashboard.
 * Assumes authentication is already enforced (e.g., with <RequireAuth>).
 */
export default function RequireAdmin({ children }: Props) {
	const { isAdmin, loading } = useAuth();
	const location = useLocation();

	// While the auth context is bootstrapping, render nothing (or a small placeholder if you prefer)
	if (loading) return null;

	if (!isAdmin) {
		// not an admin -> send to dashboard, preserving where they came from
		return (
			<Navigate
				to={AppRoutes.Dashboard}
				replace
				state={{ from: location }}
			/>
		);
	}

	return <>{children}</>;
}
