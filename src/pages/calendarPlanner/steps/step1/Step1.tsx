import { Button, Text, TextInput } from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import "./step1.scss";
import { useAuth } from "@/shared/AuthProvider";
import { useCreateCampaign } from "../../campaign.hooks";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";

const Step1 = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	//API
	const { mutate: createCampaign, isPending: loading } = useCreateCampaign(
		(id) => {
			navigate(`${AppRoutes.Calendar}/${2}/${id}`);
		}
	);

	const form = useForm({
		mode: "controlled",
		initialValues: {
			name: `${user?.user_metadata.first_name} ${user?.user_metadata.last_name}`,
			practiceName: "",
			email: user?.email,
			practiceBuddy: "",
			strategyName: "",
		},
		validate: {
			email: isEmail("Invalid email"),
			name: hasLength({ min: 6 }, "Name must have 3 or more characters."),
			practiceName: hasLength(
				{ min: 6 },
				"Practice name must have 3 or more characters."
			),
			practiceBuddy: hasLength(
				{ min: 6 },
				"Practice buddy must have 3 or more characters."
			),
			strategyName: hasLength(
				{ min: 1 },
				"Strategy name cannot be empty"
			),
		},
	});

	const handleSubmit = (values: typeof form.values) => {
		createCampaign({
			creator_id: user.id,
			personal_details: {
				name: values.name,
				email: values.email,
				practiceName: values.practiceName,
				practiceBuddy: values.practiceBuddy,
				strategyName: values.strategyName,
			},
		});
	};

	return (
		<div className="planner-step-1">
			<div className="ps1-content">
				<Text fw={800} c="pink">
					STEP 1
				</Text>
				<Text fz="h1" fw={600} c="dark">
					Personal Details
				</Text>
				<Text size="sm" c="dimmed" maw={600}>
					To personalize your experience and optimize your campaign
					strategy, we need a few details from you. Please fill out
					the form below, and let's get you ready to conquer your
					campaigns!
				</Text>

				<div className="step-1-content">
					<form onSubmit={form.onSubmit(handleSubmit)}>
						<TextInput
							mt="xl"
							variant="filled"
							{...form.getInputProps("name")}
							label="Name"
						/>

						<TextInput
							mt="md"
							variant="filled"
							{...form.getInputProps("email")}
							label="Email"
							placeholder="Email"
						/>

						<TextInput
							mt="md"
							variant="filled"
							{...form.getInputProps("practiceName")}
							label="Practice Name"
						/>

						<TextInput
							mt="md"
							variant="filled"
							{...form.getInputProps("strategyName")}
							label="Strategy Name"
							placeholder="Overall campaign strategy name"
						/>

						<TextInput
							mt="md"
							variant="filled"
							{...form.getInputProps("practiceBuddy")}
							label="Practice Buddy"
						/>

						<Button type="submit" mt="xl" loading={loading}>
							Proceed
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Step1;
