import { AppRoutes } from "@/shared/shared.models";
import "./auth.scss";
import { Button, Text, TextInput, PasswordInput } from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { Link, useNavigate } from "react-router-dom";
import { useSignin } from "./auth.hooks";
import { useEffect } from "react";
import { useAuth } from "@/shared/AuthProvider";
import Logo from "@assets/logo.svg";

const Login = () => {
	const navigate = useNavigate();
	const { auth } = useAuth();

	const form = useForm({
		mode: "controlled",
		initialValues: { email: "", password: "" },
		validate: {
			email: isEmail("Invalid email"),
			password: hasLength(
				{ min: 6 },
				"Password must have 6 or more characters."
			),
		},
	});

	useEffect(() => {
		if (auth) {
			navigate(AppRoutes.Calendar);
		}
	}, [auth]);

	//API
	const { mutate: signin, isPending: loading } = useSignin();

	const handleLogin = (values: typeof form.values) => {
		signin({ email: values.email, password: values.password });
	};

	return (
		<div className="auth">
			<div className="auth-content">
			<div className="logo-wrapper">
  <img src={Logo} alt="Logo" className="logo-main" />
</div>

				

				<form onSubmit={form.onSubmit(handleLogin)}>
					<TextInput
						{...form.getInputProps("email")}
						label="Email"
						placeholder="Email"
					/>

					<PasswordInput
						{...form.getInputProps("password")}
						mt="md"
						label="Password"
					/>

					<div className="form-right-link">
						<Link to={AppRoutes.Forgot}>
							<Text size="sm" c="blue">
								Forgot password?
							</Text>
						</Link>
					</div>

					<Button fullWidth type="submit" mt="md" loading={loading}>
						Login
					</Button>

					<Link to={AppRoutes.Signup}>
						<Text size="sm" c="blue" ta="center" fw={600} mt="sm">
							Don't have an account? Create account.
						</Text>
					</Link>
				</form>
			</div>
		</div>
	);
};

export default Login;
