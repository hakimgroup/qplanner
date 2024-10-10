import { Navigate } from "react-router-dom";
import { AppRoutes } from "./shared.models";
import { useAuth } from "./AuthProvider";

export default function ProtectedWrapper({ children }) {
	const { auth } = useAuth();

	return auth ? <div>{children}</div> : <Navigate to={AppRoutes.Login} />;
}
