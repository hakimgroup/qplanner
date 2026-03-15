import {
	Modal,
	Stack,
	TextInput,
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
import {
	IconBuildings,
	IconId,
	IconMail,
	IconMap,
	IconMapPin,
	IconPhone,
	IconPlus,
	IconUser,
	IconWorld,
	IconWorldWww,
} from "@tabler/icons-react";
import StyledButton from "@/components/styledButton/StyledButton";
import { toast } from "sonner";
import { useIsMobile } from "@/shared/shared.hooks";

type FormValues = {
	name: string;
	address: string;
	post_code: string;
	country: string;
	phone: string;
	email: string;
	website: string;
	buddy: string;
	uberall_business_id: string;
};

const initialValues: FormValues = {
	name: "",
	address: "",
	post_code: "",
	country: "",
	phone: "",
	email: "",
	website: "",
	buddy: "",
	uberall_business_id: "",
};

export default function AddPracticeModal() {
	const T = useMantineTheme();
	const isMobile = useIsMobile();
	const [opened, { open, close }] = useDisclosure(false);
	const qc = useQueryClient();

	const form = useForm<FormValues>({
		initialValues,
		validateInputOnBlur: true,
		validate: {
			name: (v) => (v.trim() ? null : "Practice name is required"),
			email: (v) => {
				if (!v.trim()) return null; // optional
				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim().toLowerCase())
					? null
					: "Enter a valid email";
			},
		},
	});

	const { mutate: addPractice, isPending } = useMutation({
		mutationFn: async (vals: FormValues) => {
			const payload: Record<string, string | null> = {};
			for (const [key, value] of Object.entries(vals)) {
				payload[key] = value.trim() || null;
			}

			const { error } = await supabase
				.from(DatabaseTables.Practices)
				.insert(payload);

			if (error) throw error;
			return true;
		},
		onSuccess: () => {
			toast.success("Practice added successfully!");
			qc.invalidateQueries({ queryKey: ["practices_admin"] });
			form.reset();
			close();
		},
	});

	const handleSubmit = form.onSubmit((vals) => addPractice(vals));

	const iconColor = T.colors.gray[5];

	const fields: {
		key: keyof FormValues;
		label: string;
		placeholder: string;
		icon: React.ReactNode;
		required?: boolean;
	}[] = [
		{
			key: "name",
			label: "Practice Name",
			placeholder: "e.g. Hakim Optical London",
			icon: <IconBuildings size={16} color={iconColor} />,
			required: true,
		},
		{
			key: "address",
			label: "Address",
			placeholder: "e.g. 123 High Street, London",
			icon: <IconMap size={16} color={iconColor} />,
		},
		{
			key: "post_code",
			label: "Post Code",
			placeholder: "e.g. SW1A 1AA",
			icon: <IconMapPin size={16} color={iconColor} />,
		},
		{
			key: "country",
			label: "Country",
			placeholder: "e.g. England",
			icon: <IconWorld size={16} color={iconColor} />,
		},
		{
			key: "phone",
			label: "Phone",
			placeholder: "e.g. 020 7946 0958",
			icon: <IconPhone size={16} color={iconColor} />,
		},
		{
			key: "email",
			label: "Email",
			placeholder: "e.g. practice@hakimgroup.co.uk",
			icon: <IconMail size={16} color={iconColor} />,
		},
		{
			key: "website",
			label: "Website",
			placeholder: "e.g. www.hakimgroup.co.uk",
			icon: <IconWorldWww size={16} color={iconColor} />,
		},
		{
			key: "buddy",
			label: "Buddy",
			placeholder: "e.g. John Smith",
			icon: <IconUser size={16} color={iconColor} />,
		},
		{
			key: "uberall_business_id",
			label: "Uberall Business ID",
			placeholder: "e.g. 12345678",
			icon: <IconId size={16} color={iconColor} />,
		},
	];

	return (
		<>
			<StyledButton
				leftSection={<IconPlus size={14} />}
				onClick={open}
				fw={500}
			>
				Add Practice
			</StyledButton>

			<Modal
			fullScreen={isMobile}
			opened={opened}
				onClose={() => {
					form.reset();
					close();
				}}
				title={
					<Flex align="center" gap={10}>
						<IconPlus color={T.colors.blue[3]} size={20} />
						<Text fw={600}>Add Practice</Text>
					</Flex>
				}
				centered
				radius={10}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<form onSubmit={handleSubmit}>
					<Stack gap="md">
						{fields.map((f) => (
							<TextInput
								key={f.key}
								label={f.label}
								placeholder={f.placeholder}
								leftSection={f.icon}
								withAsterisk={!!f.required}
								size="sm"
								radius="md"
								{...form.getInputProps(f.key)}
							/>
						))}

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
								Add Practice
							</Button>
						</Group>
					</Stack>
				</form>
			</Modal>
		</>
	);
}
