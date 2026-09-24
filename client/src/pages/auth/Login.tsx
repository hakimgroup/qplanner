import { AppRoutes } from "@/shared/shared.models";
import {
	Button,
	Text,
	Center,
	Card,
	Stack,
	rgba,
	Image,
	TextInput,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useSignin } from "./auth.hooks";
import { useEffect, useState } from "react";
import { useAuth } from "@/shared/AuthProvider";
import { Colors } from "@/shared/shared.const";
import { supabase } from "@/api/supabase";
import Logo from "@/components/logo/Logo";
import Microsoft from "@/assets/microsoft.png";
import { toast } from "sonner";

const Login = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	// Staging uses a lightweight email-only sign-in instead of Microsoft SSO
	// (no Azure redirect URIs to configure per environment). Any planner email
	// that has a staging account is signed in with the shared staging password;
	// everyone else is rejected. Prod is unaffected — VITE_ENV is only "staging"
	// on the staging build, so the Microsoft flow renders everywhere else.
	const isStaging = import.meta.env.VITE_ENV === "staging";
	const [stagingEmail, setStagingEmail] = useState("");
	const [stagingSubmitting, setStagingSubmitting] = useState(false);

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

	const handleStagingLogin = async (e?: React.FormEvent) => {
		e?.preventDefault();
		const email = stagingEmail.trim().toLowerCase();
		if (!email) return;
		setStagingSubmitting(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password: import.meta.env.VITE_STAGING_LOGIN_PASSWORD ?? "",
		});
		setStagingSubmitting(false);
		if (error) {
			toast.error(
				"That email doesn't have access to the staging planner."
			);
			return;
		}
		// Success → AuthProvider runs the allowed_users check and the `user`
		// effect above navigates in. A signed-in-but-unprovisioned account is
		// still turned away by RequireAuth, exactly as on prod.
	};

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

					{isStaging ? (
						<>
							<form
								onSubmit={handleStagingLogin}
								style={{ width: "100%" }}
							>
								<Stack gap={12} mt={40} w="100%">
									<TextInput
										type="email"
										placeholder="you@hakimgroup.co.uk"
										value={stagingEmail}
										onChange={(e) =>
											setStagingEmail(e.currentTarget.value)
										}
										radius={10}
										size="md"
										autoFocus
										required
									/>
									<Button
										type="submit"
										fullWidth
										color="violet"
										size="md"
										radius={10}
										loading={stagingSubmitting}
									>
										Sign in
									</Button>
								</Stack>
							</form>

							<Card mt={20} radius={10} bg={"#f4f4f4"}>
								<Text size="xs" c="gray.5" ta={"center"}>
									Staging environment. Enter your planner email
									to sign in — access is limited to provisioned
									staging users.
								</Text>
							</Card>
						</>
					) : (
						<>
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
									authentication managed by Microsoft Azure AD.
									Your login details are never collected or
									stored by us.
								</Text>
							</Card>
						</>
					)}
				</Stack>
			</Card>
		</Center>
	);
};

export default Login;
