import { AllowedUser } from "@/api/auth";
import Table from "@/components/table/Table";
import {
	ActionIcon,
	Badge,
	Button,
	Flex,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { IconBuildings, IconSettings, IconUser } from "@tabler/icons-react";
import { ColDef } from "ag-grid-community";
import { roles } from "@/filters.json";
import { find, upperFirst } from "lodash";
import { userRoleColors } from "@/shared/shared.const";
import { format } from "date-fns";
import PeopleActions from "./PeopleActions";
import { useState } from "react";

interface Props {
	loading: boolean;
	users: AllowedUser[];
}

const PeopleAccessTable = ({ users, loading }: Props) => {
	const T = useMantineTheme().colors;
	const [row, setRow] = useState<AllowedUser>(null);
	const [mode, setMode] = useState("edit");

	const colDefs: ColDef[] = [
		{
			field: "first_name",
			headerName: "Name",
			flex: 1,
			cellRenderer: ({ value, data }) => (
				<Flex gap={5} align="center">
					<IconUser size={16} />
					<Text size="sm" c="gray.9">
						{upperFirst(value)} {upperFirst(data.last_name)}
					</Text>
				</Flex>
			),
		},
		{
			field: "email",
			flex: 1,
			sortable: false,
			cellRenderer: ({ value }) => (
				<Text size="sm" c="gray.4">
					{value}
				</Text>
			),
		},
		{
			field: "role",
			flex: 1,
			sortable: false,
			cellRenderer: ({ value }) => (
				<Badge
					variant="light"
					color={userRoleColors[value]}
					size="sm"
					fw={700}
					style={{ border: `1px solid ${T.blue[0]}` }}
				>
					{find(roles, { value }).label}
				</Badge>
			),
		},
		{
			field: "assigned_practices",
			flex: 1,
			sortable: false,
			cellRenderer: ({ value, data }) => (
				<Flex gap={5} align="center">
					<IconBuildings size={14} />
					<Text size="sm" c="gray.9">
						{value.length}
					</Text>
					<Button
						fw={400}
						size="xs"
						variant="transparent"
						color="blue.3"
						p={value.length === 0 ? "auto" : 0}
						mt={1}
						disabled={value.length === 0}
						onClick={() => {
							setRow(data);
							setMode("view");
						}}
					>
						View
					</Button>
				</Flex>
			),
		},
		{
			field: "status",
			flex: 1,
			sortable: false,
			cellRenderer: ({ value }) => (
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
			flex: 1,
			sortable: false,
			cellRenderer: ({ value }) => (
				<Text size="sm" c="gray.4">
					{format(value, "MMMM dd, yyyy")}
				</Text>
			),
		},
		{
			field: "",
			headerName: "Actions",
			sortable: false,
			flex: 1,
			filter: false,
			cellRenderer: (p) => (
				<Stack>
					<ActionIcon
						variant="subtle"
						size={"input-sm"}
						radius={10}
						color="violet.9"
						onClick={() => {
							setRow(p.data);
							setMode("edit");
						}}
					>
						<IconSettings size={23} />
					</ActionIcon>

					<PeopleActions
						mode={mode}
						opened={row?.id === p.data.id}
						row={row}
						closePanel={() => setRow(null)}
					/>
				</Stack>
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
