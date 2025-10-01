import { AppRoutes } from "@/shared/shared.models";
import { Button, Text, Center, Card, Stack, rgba, Image } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useSignin } from "./auth.hooks";
import { useEffect } from "react";
import { useAuth } from "@/shared/AuthProvider";
import { Colors } from "@/shared/shared.const";
import Logo from "@/components/logo/Logo";
import Microsoft from "@/assets/microsoft.png";
import { toast } from "sonner";

const Login = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	const MESSAGES: Record<string, string> = {
		denied: "You’re not authorized to access this app.",
		failed: "Authorization check failed. Please try again.",
	};

	useEffect(() => {
		if (user) {
			navigate(AppRoutes.Dashboard);
		}
	}, [user]);

	useEffect(() => {
		const code = localStorage.getItem("auth_notice");
		if (!code) return;

		setTimeout(() => {
			toast.error(MESSAGES[code] ?? "Sign-in status changed.");
			localStorage.removeItem("auth_notice");
		}, 0);
	}, []);

	//API
	const { mutate: signin, isPending: loading } = useSignin();

	return (
		<Center style={{ height: "100vh", width: "100%" }}>
			<Card
				radius={10}
				w={450}
				pt={30}
				bg={rgba(Colors.cream, 0.3)}
				style={{ border: `1px solid ${Colors.cream}` }}
			>
				<Stack gap={0} align="center">
					<Logo />
					<Text
						fz={"h3"}
						fw={700}
						mt={15}
						variant="gradient"
						gradient={{ from: "blue.3", to: "red.4" }}
					>
						Marketing Planner
					</Text>

					<Text size="sm" c="gray.8" ta={"center"} mt={5}>
						Sign in to access your marketing campaigns and planning
						tools.
					</Text>

					<Button
						mt={40}
						fullWidth
						variant="light"
						color="violet"
						size="md"
						loading={loading}
						leftSection={
							<Image src={Microsoft} w={20} height={20} />
						}
						onClick={() => {
							signin();
						}}
					>
						Sign in with Microsoft
					</Button>

					<Card mt={20} radius={10} bg={"#f4f4f4"}>
						<Text size="xs" c="gray.3" ta={"center"}>
							By signing in with Microsoft, you consent to
							authentication managed by Microsoft Azure AD. Your
							login details are never collected or stored by us.
						</Text>
					</Card>
				</Stack>
			</Card>
		</Center>
	);
};

export default Login;
