import { AppRoutes } from "@/shared/shared.models";
import "./auth.scss";
import {
	Button,
	Text,
	TextInput,
	PasswordInput,
	Box,
	Stack,
	Title,
} from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { Link, useNavigate } from "react-router-dom";
import { useResetPassword, useSignin } from "./auth.hooks";
import { Fragment, useEffect } from "react";
import { useAuth } from "@/shared/AuthProvider";
import { IconMailCheck } from "@tabler/icons-react";

const Forgot = () => {
	const navigate = useNavigate();
	const resetMutation = useResetPassword();

	const form = useForm({
		mode: "controlled",
		initialValues: {
			email: "",
		},
		validate: {
			email: isEmail("Invalid email"),
		},
	});

	const sendResetEmail = (values: typeof form.values) => {
		resetMutation.mutate(values.email);
	};

	return (
		<div className="auth">
			<div className="auth-content">
				{!resetMutation.isSuccess ? (
					<Fragment>
						<Text fz="h1" fw={600} c="dark">
							Forgot Password?
						</Text>

						<Text size="sm" opacity={0.85}>
							Forgot your password? No worries — we’ll help you
							reset it and get back to QPlanner in no time.
						</Text>

						<Text size="sm" opacity={0.85}>
							Enter the email associated with your account and we
							will send an email with instructions to reset your
							password.
						</Text>

						<form onSubmit={form.onSubmit(sendResetEmail)}>
							<TextInput
								variant="filled"
								{...form.getInputProps("email")}
								label="Email"
								placeholder="Email"
							/>

							<Button
								mt="md"
								type="submit"
								fullWidth
								loading={resetMutation.isPending}
							>
								Send instructions
							</Button>
						</form>
					</Fragment>
				) : (
					<Box>
						<Stack ta="center" align="center" gap={20}>
							<IconMailCheck size={50} />
							<Title order={3}>Reset email sent!!</Title>
							<Text>
								For security reasons, we've sent you an email
								that contains a link to update your password.
							</Text>
							<Button onClick={() => navigate(AppRoutes.Login)}>
								Back to Sign in
							</Button>
						</Stack>
					</Box>
				)}
			</div>
		</div>
	);
};

export default Forgot;
