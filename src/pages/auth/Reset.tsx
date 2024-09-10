import { Button, Text, PasswordInput } from "@mantine/core";
import { useForm, matchesField, matches } from "@mantine/form";
import "./auth.scss";
import { useUpdatePassword } from "./auth.hooks";

const ResetPassword = () => {
	const updatePasswordMutation = useUpdatePassword();

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			password: "",
			confirmPassword: "",
		},

		validate: {
			password: matches(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
				"Please make sure your password has a minimum of 6 characters, an uppercase, lowercase, a number and a special character"
			),
			confirmPassword: matchesField("password", "Passwords do not match"),
		},
	});

	const updatePassword = (values: typeof form.values) => {
		updatePasswordMutation.mutate(values.password);
	};

	return (
		<div className="auth">
			<div className="auth-content">
				<Text fz="h1" fw={600} c="dark">
					Create new password.
				</Text>

				<Text size="sm" opacity={0.85}>
					Your new password must be different from previously used
					passwords.
				</Text>

				<form onSubmit={form.onSubmit(updatePassword)}>
					<PasswordInput
						variant="filled"
						{...form.getInputProps("password")}
						label="Password"
					/>

					<PasswordInput
						mt="md"
						variant="filled"
						{...form.getInputProps("confirmPassword")}
						label="Confirm Password"
					/>

					<Button
						mt="md"
						type="submit"
						fullWidth
						loading={updatePasswordMutation.isPending}
					>
						Reset password
					</Button>
				</form>
			</div>
		</div>
	);
};

export default ResetPassword;
