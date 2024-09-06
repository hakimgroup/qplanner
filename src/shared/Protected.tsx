import { useNavigate } from "react-router-dom";
import { AppRoutes } from "./shared.models";
import { useAuth } from "./AuthProvider";
import { LoadingOverlay } from "@mantine/core";

export default function ProtectedWrapper({ children }) {
	const navigate = useNavigate();
	const { loading, userError } = useAuth();

	if (loading) {
		return (
			<LoadingOverlay
				visible={loading}
				zIndex={1000}
				overlayProps={{ radius: "sm", blur: 2 }}
			/>
		);
	}

	if (userError) {
		navigate(AppRoutes.Home);
		return (
			<LoadingOverlay
				visible={loading}
				zIndex={1000}
				overlayProps={{ radius: "sm", blur: 2 }}
			/>
		);
	}

	return <div>{children}</div>;
}
