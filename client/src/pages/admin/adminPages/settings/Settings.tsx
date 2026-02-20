import { useMemo } from "react";
import {
	Stack,
	Title,
	Text,
	Card,
	Switch,
	Badge,
	Flex,
	Group,
	Loader,
	useMantineTheme,
} from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { ColDef } from "ag-grid-community";
import { find, startCase, upperFirst } from "lodash";
import { useAuth } from "@/shared/AuthProvider";
import { UserRoles } from "@/shared/shared.models";
import { userRoleColors } from "@/shared/shared.const";
import { roles } from "@/filters.json";
import Table from "@/components/table/Table";
import useUsers, { useToggleEmailNotifications } from "@/pages/auth/auth.hooks";

const Settings = () => {
	const T = useMantineTheme().colors;
	const { user, role: currentUserRole } = useAuth();
	const { data: allUsers = [], isLoading } = useUsers();
	const toggleMutation = useToggleEmailNotifications();

	const isSuperAdmin = currentUserRole === UserRoles.SuperAdmin;

	const adminUsers = useMemo(
		() =>
			allUsers.filter(
				(u) => u.role === "admin" || u.role === "super_admin"
			),
		[allUsers]
	);

	const currentUser = useMemo(
		() => allUsers.find((u) => u.id === user?.id) ?? null,
		[allUsers, user?.id]
	);

	const colDefs: ColDef[] = [
		{
			field: "first_name",
			headerName: "Name",
			flex: 1,
			minWidth: 220,
			cellRenderer: ({ value, data }: any) => (
				<Flex gap={6} align="center">
					<IconUser size={16} />
					<Text size="sm" c="gray.9">
						{upperFirst(value || "")} {upperFirst(data?.last_name || "")}
					</Text>
				</Flex>
			),
		},
		{
			field: "email",
			headerName: "Email",
			flex: 1.2,
			minWidth: 280,
			sortable: false,
			tooltipField: "email",
			cellRenderer: ({ value }: any) => (
				<Text size="sm" c="gray.6" title={value || ""}>
					{value || "—"}
				</Text>
			),
		},
		{
			field: "role",
			headerName: "Role",
			width: 200,
			minWidth: 180,
			sortable: false,
			cellRenderer: ({ value }: any) => (
				<Badge
					variant="light"
					color={userRoleColors[value as UserRoles]}
					size="sm"
					fw={700}
					style={{ border: `1px solid ${T.blue[0]}` }}
				>
					{find(roles, { value })?.label || startCase(value) || "—"}
				</Badge>
			),
		},
		{
			field: "email_notifications_enabled",
			headerName: "Email Notifications",
			width: 200,
			minWidth: 160,
			sortable: false,
			filter: false,
			cellRenderer: ({ value, data }: any) => (
				<Switch
					checked={value !== false}
					onChange={(e) =>
						toggleMutation.mutate({
							userId: data.id,
							enabled: e.currentTarget.checked,
						})
					}
				/>
			),
		},
	];

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Title order={1}>Settings</Title>
				<Text c="gray.6">Manage system preferences</Text>
			</Stack>

			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={20}>
					<Stack gap={4}>
						<Title order={3}>Email Notifications</Title>
						<Text size="sm" c="gray.6">
							{isSuperAdmin
								? "Control which admins receive email notifications for campaign workflow events (submissions, confirmations, revision requests). In-app notifications are not affected."
								: "Toggle whether you receive email notifications for campaign workflow events. In-app notifications are not affected."}
						</Text>
					</Stack>

					{isSuperAdmin ? (
						<Table
							loading={isLoading}
							rows={adminUsers}
							cols={colDefs}
							enableSelection={false}
							height={450}
							pagination={false}
						/>
					) : isLoading ? (
						<Flex justify="center" py={30}>
							<Loader size="sm" />
						</Flex>
					) : currentUser ? (
						<Group justify="space-between" align="center">
							<Group gap={12}>
								<IconUser size={18} color={T.gray[6]} />
								<Text size="sm" fw={500}>
									{upperFirst(currentUser.first_name || "")}{" "}
									{upperFirst(currentUser.last_name || "")}
								</Text>
								<Text size="sm" c="gray.5">
									{currentUser.email}
								</Text>
							</Group>
							<Switch
								label="Receive email notifications"
								checked={currentUser.email_notifications_enabled !== false}
								onChange={(e) =>
									toggleMutation.mutate({
										userId: currentUser.id,
										enabled: e.currentTarget.checked,
									})
								}
							/>
						</Group>
					) : null}
				</Stack>
			</Card>
		</Stack>
	);
};

export default Settings;
