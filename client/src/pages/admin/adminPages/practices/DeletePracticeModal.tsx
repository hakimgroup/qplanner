import { Modal, Stack, Text, Button, Group, Alert } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { DatabaseTables } from "@/shared/shared.models";

type Props = {
	opened: boolean;
	onClose: () => void;
	practice: any;
};

export default function DeletePracticeModal({
	opened,
	onClose,
	practice,
}: Props) {
	const queryClient = useQueryClient();

	const { mutate: deletePractice, isPending } = useMutation({
		mutationFn: async () => {
			const { error } = await supabase
				.from(DatabaseTables.Practices)
				.delete()
				.eq("id", practice.id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["practices_admin"] });
			onClose();
		},
	});

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Text fw={700} c="red.4">
					Delete Practice
				</Text>
			}
			centered
			radius={10}
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
		>
			<Stack gap="md">
				<Alert
					color="red"
					icon={<IconAlertTriangle size={18} />}
					variant="light"
					radius="md"
				>
					<Text fw={600}>This action is permanent.</Text>
					<Text c="gray.7" size="sm" mt={4}>
						You're about to delete{" "}
						<Text span c="blue.3" fw={700}>
							{practice?.name}
						</Text>
						. All associated data including member assignments will
						be removed.
					</Text>
				</Alert>

				<Text size="sm" c="red.4">
					Are you sure you want to continue?
				</Text>

				<Group justify="flex-end" mt="xs">
					<Button
						variant="default"
						radius="md"
						onClick={onClose}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						color="red"
						radius="md"
						onClick={() => deletePractice()}
						loading={isPending}
					>
						Delete
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
