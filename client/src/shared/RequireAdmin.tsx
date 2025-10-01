// RequireAdmin.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import { AppRoutes } from "@/shared/shared.models";

type Props = { children: ReactNode };

export default function RequireAdmin({ children }: Props) {
	const { loading, isAdmin, role } = useAuth();
	const location = useLocation();

	// Wait until auth bootstraps and role resolves to avoid false redirects on refresh
	if (loading || role === null) return null;

	// Non-admins are redirected to Dashboard
	if (!isAdmin) {
		return (
			<Navigate
				to={AppRoutes.Dashboard}
				replace
				state={{ from: location }}
			/>
		);
	}

	// Admins can view the page
	return <>{children}</>;
}
