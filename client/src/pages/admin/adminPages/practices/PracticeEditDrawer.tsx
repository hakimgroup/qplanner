import { useState, useEffect } from "react";
import {
	Button,
	Drawer,
	Stack,
	Text,
	TextInput,
	useMantineTheme,
} from "@mantine/core";
import {
	IconBuildings,
	IconMail,
	IconMap,
	IconMapPin,
	IconPhone,
	IconUser,
	IconWorld,
	IconWorldWww,
	IconId,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { DatabaseTables } from "@/shared/shared.models";

interface Props {
	practice: any;
	opened: boolean;
	onClose: () => void;
}

const PracticeEditDrawer = ({ practice, opened, onClose }: Props) => {
	const T = useMantineTheme().colors;
	const queryClient = useQueryClient();

	const [form, setForm] = useState({
		name: "",
		address: "",
		post_code: "",
		country: "",
		phone: "",
		email: "",
		website: "",
		buddy: "",
		uberall_business_id: "",
	});

	useEffect(() => {
		if (practice) {
			setForm({
				name: practice.name ?? "",
				address: practice.address ?? "",
				post_code: practice.post_code ?? "",
				country: practice.country ?? "",
				phone: practice.phone ?? "",
				email: practice.email ?? "",
				website: practice.website ?? "",
				buddy: practice.buddy ?? "",
				uberall_business_id: practice.uberall_business_id ?? "",
			});
		}
	}, [practice]);

	const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
		setForm((f) => ({ ...f, [key]: e.currentTarget.value }));

	const { mutate: save, isPending } = useMutation({
		mutationFn: async () => {
			const { error } = await supabase
				.from(DatabaseTables.Practices)
				.update({
					name: form.name || null,
					address: form.address || null,
					post_code: form.post_code || null,
					country: form.country || null,
					phone: form.phone || null,
					email: form.email || null,
					website: form.website || null,
					buddy: form.buddy || null,
					uberall_business_id: form.uberall_business_id || null,
				})
				.eq("id", practice.id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["practices_admin"] });
			onClose();
		},
	});

	const fields: {
		key: string;
		label: string;
		placeholder: string;
		icon: React.ReactNode;
	}[] = [
		{
			key: "name",
			label: "Practice Name",
			placeholder: "e.g. Hakim Optical London",
			icon: <IconBuildings size={16} color={T.gray[5]} />,
		},
		{
			key: "address",
			label: "Address",
			placeholder: "e.g. 123 High Street, London",
			icon: <IconMap size={16} color={T.gray[5]} />,
		},
		{
			key: "post_code",
			label: "Post Code",
			placeholder: "e.g. SW1A 1AA",
			icon: <IconMapPin size={16} color={T.gray[5]} />,
		},
		{
			key: "country",
			label: "Country",
			placeholder: "e.g. England",
			icon: <IconWorld size={16} color={T.gray[5]} />,
		},
		{
			key: "phone",
			label: "Phone",
			placeholder: "e.g. 020 7946 0958",
			icon: <IconPhone size={16} color={T.gray[5]} />,
		},
		{
			key: "email",
			label: "Email",
			placeholder: "e.g. practice@hakimgroup.co.uk",
			icon: <IconMail size={16} color={T.gray[5]} />,
		},
		{
			key: "website",
			label: "Website",
			placeholder: "e.g. www.hakimgroup.co.uk",
			icon: <IconWorldWww size={16} color={T.gray[5]} />,
		},
		{
			key: "buddy",
			label: "Buddy",
			placeholder: "e.g. John Smith",
			icon: <IconUser size={16} color={T.gray[5]} />,
		},
		{
			key: "uberall_business_id",
			label: "Uberall Business ID",
			placeholder: "e.g. 12345678",
			icon: <IconId size={16} color={T.gray[5]} />,
		},
	];

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			title={
				<Text fz="h4" fw={600}>
					<Text span fz="h4" fw={600} c="violet.5">
						Edit Practice
					</Text>{" "}
					&#9679; {practice?.name}
				</Text>
			}
			size="25rem"
			position="right"
			offset={8}
			radius={10}
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
		>
			<Stack gap={16}>
				{fields.map((f) => (
					<TextInput
						key={f.key}
						label={f.label}
						placeholder={f.placeholder}
						leftSection={f.icon}
						size="sm"
						radius={10}
						value={(form as any)[f.key]}
						onChange={set(f.key)}
					/>
				))}

				<Button
					fullWidth
					mt="md"
					radius={10}
					loading={isPending}
					onClick={() => save()}
				>
					Save Changes
				</Button>
			</Stack>
		</Drawer>
	);
};

export default PracticeEditDrawer;
