// RedirectAdminFromDashboard.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import { AppRoutes } from "@/shared/shared.models";

export default function RedirectAdminFromDashboard({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAdmin, loading } = useAuth();
	const location = useLocation();

	if (loading) return null;
	if (isAdmin) {
		return (
			<Navigate to={AppRoutes.Admin} replace state={{ from: location }} />
		);
	}
	return <>{children}</>;
}
