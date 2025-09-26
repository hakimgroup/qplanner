import {
	Stack,
	Title,
	Text,
	Card,
	Grid,
	Select,
	TextInput,
	useMantineTheme,
} from "@mantine/core";
import filtersData from "@/filters.json";
import { IconSearch } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useMemo, useState } from "react";
import PeopleAccessTable from "./PeopleAccessTable";
import useUsers from "@/pages/auth/auth.hooks";

const PeopleAccess = () => {
	const T = useMantineTheme().colors;
	const [role, setRole] = useState("all");

	// Local search (debounced)
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 200);

	// Server-side role filter (keeps API light)
	const { data: users = [], isFetching } = useUsers({
		role: role === "all" ? null : (role as any),
	});

	// Client-side text search over name + email
	const filteredUsers = useMemo(() => {
		const q = (debounced || "").trim().toLowerCase();
		if (!q) return users;

		return users.filter((u: any) => {
			const first = (u.first_name ?? "").toLowerCase();
			const last = (u.last_name ?? "").toLowerCase();
			const email = (u.email ?? "").toLowerCase();

			// match: "john", "john do", "doe", "john@acme.com", etc.
			const full = `${first} ${last}`.trim();
			return (
				first.includes(q) ||
				last.includes(q) ||
				full.includes(q) ||
				email.includes(q)
			);
		});
	}, [users, debounced]);

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Title order={1}>People & Access</Title>
				<Text c="gray.6">
					Manage user access and practice assignments
				</Text>
			</Stack>

			{/* Table Filters */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={10}>
					<Title order={4}>Filters & Search</Title>
					<Grid>
						<Grid.Col span={10}>
							<TextInput
								radius={10}
								size="sm"
								fz={"sm"}
								placeholder="Search by name or email"
								leftSection={<IconSearch size={18} />}
								value={query}
								onChange={(e) =>
									setQuery(e.currentTarget.value)
								}
							/>
						</Grid.Col>
						<Grid.Col span={2}>
							<Select
								size="sm"
								radius={10}
								data={[
									{ label: "All Roles", value: "all" },
								].concat(filtersData.roles)}
								value={role}
								onChange={(v) => setRole(v ?? "all")}
							/>
						</Grid.Col>
					</Grid>
				</Stack>
			</Card>

			{/* Table */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={30}>
					<Title order={3}>
						Users{" "}
						<Text span fz={"h3"} fw={700} c={"blue.3"}>
							({filteredUsers?.length ?? 0})
						</Text>
					</Title>
					<PeopleAccessTable
						users={filteredUsers}
						loading={isFetching}
					/>
				</Stack>
			</Card>
		</Stack>
	);
};

export default PeopleAccess;
