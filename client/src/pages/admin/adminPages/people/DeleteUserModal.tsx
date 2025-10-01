import { Modal, Stack, Text, Button, Group, Alert } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import StyledButton from "@/components/styledButton/StyledButton";
import { useDeleteAllowedUser } from "@/pages/auth/auth.hooks";

type Props = {
	opened: boolean;
	onClose: () => void;
	userId: string | null;
	userName?: string | null; // optional, for nicer copy
};

export default function DeleteUserModal({
	opened,
	onClose,
	userId,
	userName,
}: Props) {
	const { mutate: deleteUser, isPending } = useDeleteAllowedUser();

	const handleDelete = () => {
		if (!userId) return;
		deleteUser(userId, {
			onSuccess: onClose,
		});
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Text fw={700} c="red.4">
					Delete User
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
						You’re about to remove
						{userName ? (
							<>
								{" "}
								<Text span c="blue.3" fw={700}>
									{userName}
								</Text>
							</>
						) : (
							" this user"
						)}{" "}
						from access. They will no longer be able to sign in.
					</Text>
				</Alert>

				<Text size="sm" c="red.4">
					Are you sure you want to continue?
				</Text>

				<Group justify="flex-end" mt="xs">
					<StyledButton onClick={onClose} disabled={isPending}>
						Cancel
					</StyledButton>
					<Button
						color="red"
						radius="md"
						onClick={handleDelete}
						loading={isPending}
						disabled={!userId}
					>
						Delete
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
