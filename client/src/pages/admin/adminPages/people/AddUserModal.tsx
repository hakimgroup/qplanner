import {
	Modal,
	Stack,
	TextInput,
	Select,
	Group,
	Button,
	Text,
	Flex,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { DatabaseTables } from "@/shared/shared.models";
import { roles } from "@/filters.json";
import { IconPlus } from "@tabler/icons-react";
import StyledButton from "@/components/styledButton/StyledButton";
import { toast } from "sonner";

type FormValues = {
	first_name: string;
	last_name: string;
	email: string;
	role: string | null;
};

const initialValues: FormValues = {
	first_name: "",
	last_name: "",
	email: "",
	role: null,
};

export default function AddUserModal() {
	const T = useMantineTheme();
	const [opened, { open, close }] = useDisclosure(false);
	const qc = useQueryClient();

	const form = useForm<FormValues>({
		initialValues,
		validateInputOnBlur: true,
		validate: {
			first_name: (v) => (!!v.trim() ? null : "First name is required"),
			last_name: (v) => (!!v.trim() ? null : "Last name is required"),
			role: (v) => (!!v ? null : "Select a role"),
			email: (v) => {
				const e = v.trim().toLowerCase();
				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
					? null
					: "Enter a valid email";
			},
		},
	});

	const { mutate: addUser, isPending } = useMutation({
		mutationFn: async (vals: FormValues) => {
			const payload = {
				first_name: vals.first_name.trim(),
				last_name: vals.last_name.trim(),
				email: vals.email.trim().toLowerCase(),
				role: vals.role,
			};

			const { error } = await supabase
				.from(DatabaseTables.Allowed_Users)
				.insert(payload);

			if (error) throw error;
			return true;
		},
		onSuccess: () => {
			toast.success("User added successfully!!");
			qc.invalidateQueries({ queryKey: [DatabaseTables.Allowed_Users] });
			form.reset();
			close();
		},
	});

	const handleSubmit = form.onSubmit((vals) => addUser(vals));

	return (
		<>
			{/* Trigger button */}
			<StyledButton
				leftSection={<IconPlus size={14} />}
				onClick={open}
				fw={500}
			>
				Add user
			</StyledButton>

			{/* Modal */}
			<Modal
				opened={opened}
				onClose={() => {
					form.reset();
					close();
				}}
				title={
					<Flex align="center" gap={10}>
						<IconPlus color={T.colors.blue[3]} size={20} />
						<Text fw={600}>Add User</Text>
					</Flex>
				}
				centered
				radius={10}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<form onSubmit={handleSubmit}>
					<Stack gap="md">
						<Group grow>
							<TextInput
								label="First name"
								withAsterisk
								radius="md"
								{...form.getInputProps("first_name")}
							/>
							<TextInput
								label="Last name"
								withAsterisk
								radius="md"
								{...form.getInputProps("last_name")}
							/>
						</Group>

						<TextInput
							label="Email"
							withAsterisk
							radius="md"
							placeholder="name@company.com"
							{...form.getInputProps("email")}
						/>

						<Select
							label="Role"
							withAsterisk
							radius="md"
							data={roles} // expects [{label, value}]
							placeholder="Select a role"
							{...form.getInputProps("role")}
						/>

						<Group justify="flex-end" mt="sm">
							<StyledButton
								onClick={() => {
									form.reset();
									close();
								}}
							>
								Cancel
							</StyledButton>
							<Button
								type="submit"
								radius="md"
								loading={isPending}
							>
								Add User
							</Button>
						</Group>
					</Stack>
				</form>
			</Modal>
		</>
	);
}
