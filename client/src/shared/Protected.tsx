import { Navigate } from "react-router-dom";
import { AppRoutes } from "./shared.models";
import { useAuth } from "./AuthProvider";

export default function ProtectedWrapper({ children }) {
	const { user } = useAuth();

	return user ? <div>{children}</div> : <Navigate to={AppRoutes.Login} />;
}
