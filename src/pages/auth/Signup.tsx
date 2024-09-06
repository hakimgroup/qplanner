import { AppRoutes } from "@/shared/shared.models";
import "./auth.scss";
import { Button, Text, TextInput, PasswordInput } from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { Link, useNavigate } from "react-router-dom";
import { useSignup } from "./auth.hooks";
import { useEffect } from "react";
import { useAuth } from "@/shared/AuthProvider";

const Signup = () => {
	const navigate = useNavigate();
	const { auth } = useAuth();

	const form = useForm({
		mode: "controlled",
		initialValues: {
			email: "",
			password: "",
			user: {
				firstName: "",
				lastName: "",
			},
		},
		validate: {
			email: isEmail("Invalid email"),
			password: hasLength(
				{ min: 6 },
				"Password must have 6 or more characters."
			),
			user: {
				firstName: hasLength(
					{ min: 2 },
					"First Name must have 2 or more characters."
				),
				lastName: hasLength(
					{ min: 2 },
					"Last Name must have 2 or more characters."
				),
			},
		},
	});

	//API
	const { mutate: createAccount, isPending: creatingAccount } = useSignup();

	const handleSignup = (values: typeof form.values) => {
		createAccount({
			email: values.email,
			password: values.password,
			first_name: values.user.firstName,
			last_name: values.user.lastName,
		});
	};

	useEffect(() => {
		if (auth) {
			navigate(AppRoutes.Calendar);
		}
	}, [auth]);

	return (
		<div className="auth">
			<div className="auth-content">
				<Text fz="h1" fw={600} c="blue">
					Create Account
				</Text>
				<Text size="sm" mb="xl" c="dark">
					Sign up to create and manage your quarterly marketing
					campaigns effortlessly. Start now!
				</Text>

				<form
					onSubmit={form.onSubmit(handleSignup, (err) =>
						console.log(err)
					)}
				>
					<TextInput
						mt="md"
						{...form.getInputProps("user.firstName")}
						label="First Name"
					/>

					<TextInput
						mt="md"
						{...form.getInputProps("user.lastName")}
						label="Last Name"
					/>

					<TextInput
						mt="md"
						{...form.getInputProps("email")}
						label="Email"
						placeholder="Email"
					/>

					<PasswordInput
						{...form.getInputProps("password")}
						mt="md"
						label="Password"
					/>

					<Button
						fullWidth
						type="submit"
						mt="md"
						loading={creatingAccount}
					>
						Create account
					</Button>

					<Link to={AppRoutes.Login}>
						<Text size="sm" c="blue" ta="center" fw={600} mt="sm">
							Already have an account? Login.
						</Text>
					</Link>
				</form>
			</div>
		</div>
	);
};

export default Signup;
