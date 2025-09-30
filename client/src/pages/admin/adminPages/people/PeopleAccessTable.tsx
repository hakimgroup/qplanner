import { AllowedUser } from "@/api/auth";
import Table from "@/components/table/Table";
import {
	ActionIcon,
	Badge,
	Button,
	Flex,
	Group,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import {
	IconBuildings,
	IconSettings,
	IconTrash,
	IconUser,
} from "@tabler/icons-react";
import { ColDef } from "ag-grid-community";
import { roles } from "@/filters.json";
import { find, startCase, upperFirst } from "lodash";
import { userRoleColors } from "@/shared/shared.const";
import { format } from "date-fns";
import PeopleActions from "./PeopleActions";
import { useState } from "react";
import { useAuth } from "@/shared/AuthProvider";
import { UserRoles } from "@/shared/shared.models";
import DeleteUserModal from "./DeleteUserModal";

interface Props {
	loading: boolean;
	users: AllowedUser[];
}

const PeopleAccessTable = ({ users, loading }: Props) => {
	const T = useMantineTheme().colors;
	const [row, setRow] = useState<AllowedUser>(null);
	const [userIdToDelete, setUserIdToDelete] = useState(null);
	const [mode, setMode] = useState("edit");
	const { role } = useAuth();

	const colDefs: ColDef[] = [
		{
			field: "first_name",
			headerName: "Name",
			flex: 1,
			minWidth: 220,
			cellRenderer: ({ value, data }) => (
				<Flex gap={6} align="center">
					<IconUser size={16} />
					<Text
						size="sm"
						c="gray.9"
						title={`${upperFirst(value || "")} ${upperFirst(
							data?.last_name || ""
						)}`.trim()}
					>
						{upperFirst(value)} {upperFirst(data?.last_name)}
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
			cellRenderer: ({ value }) => (
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
			cellRenderer: ({ value }) => (
				<Badge
					variant="light"
					color={userRoleColors[value]}
					size="sm"
					fw={700}
					style={{ border: `1px solid ${T.blue[0]}` }}
				>
					{find(roles, { value })?.label || startCase(value) || "—"}
				</Badge>
			),
		},

		{
			field: "assigned_practices",
			headerName: "Practices",
			width: 200,
			minWidth: 180,
			sortable: false,
			cellRenderer: ({ value, data }) => {
				const count = Array.isArray(value) ? value.length : 0;
				return (
					<Flex gap={6} align="center">
						<IconBuildings size={14} />
						<Text size="sm" c="gray.9">
							{count}
						</Text>
						<Button
							fw={400}
							size="xs"
							variant="transparent"
							color="blue.3"
							p={count === 0 ? "auto" : 0}
							mt={1}
							disabled={count === 0}
							onClick={() => {
								setRow(data);
								setMode("view");
							}}
						>
							View
						</Button>
					</Flex>
				);
			},
		},

		{
			field: "status",
			headerName: "Status",
			width: 200,
			minWidth: 180,
			sortable: false,
			cellRenderer: () => (
				<Badge
					variant="light"
					color={"green.9"}
					size="sm"
					fw={700}
					style={{ border: `1px solid ${T.lime[3]}` }}
				>
					Active
				</Badge>
			),
		},

		{
			field: "last_login",
			headerName: "Last Login",
			width: 200,
			minWidth: 180,
			sortable: false,
			cellRenderer: ({ value }) => (
				<Text
					size="sm"
					c="gray.6"
					title={value ? format(new Date(value), "PPP") : ""}
				>
					{value ? format(new Date(value), "MMMM dd, yyyy") : "—"}
				</Text>
			),
		},

		{
			field: "actions",
			headerName: "Actions",
			pinned: "right",
			lockPinned: true,
			width: 120,
			minWidth: 100,
			sortable: false,
			filter: false,
			cellRenderer: (p) => (
				<Flex align="center">
					<ActionIcon
						variant="subtle"
						size={"lg"}
						radius={10}
						color="violet.9"
						onClick={() => {
							setRow(p.data);
							setMode("edit");
						}}
					>
						<IconSettings size={18} />
					</ActionIcon>

					{role === UserRoles.SuperAdmin && (
						<ActionIcon
							variant="subtle"
							size={"lg"}
							radius={10}
							color="red.9"
							onClick={() => {
								setUserIdToDelete(p.data.id);
							}}
						>
							<IconTrash size={18} />
						</ActionIcon>
					)}

					<PeopleActions
						mode={mode}
						opened={row?.id === p.data.id}
						row={row}
						closePanel={() => setRow(null)}
					/>

					<DeleteUserModal
						opened={p.data.id === userIdToDelete}
						onClose={() => setUserIdToDelete(null)}
						userId={userIdToDelete}
						userName={`${upperFirst(
							p.data.first_name
						)} ${upperFirst(p.data.last_name)}`}
					/>
				</Flex>
			),
		},
	];

	return (
		<Table
			loading={loading}
			rows={users && users.length ? users : []}
			cols={colDefs}
			enableSelection={false}
			height={550}
		/>
	);
};

export default PeopleAccessTable;
