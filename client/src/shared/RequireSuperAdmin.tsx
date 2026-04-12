import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import { AppRoutes, UserRoles } from "@/shared/shared.models";

type Props = { children: ReactNode };

export default function RequireSuperAdmin({ children }: Props) {
	const { loading, role } = useAuth();
	const location = useLocation();

	if (loading || role === null) return null;

	if (role !== UserRoles.SuperAdmin) {
		return (
			<Navigate
				to={`${AppRoutes.Admin}/${AppRoutes.Plans}`}
				replace
				state={{ from: location }}
			/>
		);
	}

	return <>{children}</>;
}
