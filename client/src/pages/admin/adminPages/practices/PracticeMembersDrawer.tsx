import { useMemo, useState } from "react";
import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Drawer,
	Flex,
	Loader,
	Stack,
	Text,
	TextInput,
	useMantineTheme,
} from "@mantine/core";
import {
	IconSearch,
	IconUser,
	IconUserMinus,
	IconUserPlus,
} from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { DatabaseTables, RPCFunctions } from "@/shared/shared.models";

interface Props {
	practice: any;
	opened: boolean;
	onClose: () => void;
}

const PracticeMembersDrawer = ({ practice, opened, onClose }: Props) => {
	const T = useMantineTheme().colors;
	const queryClient = useQueryClient();
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 150);
	const [mode, setMode] = useState<"view" | "add">("view");
	const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

	// Fetch current members of this practice
	const { data: members = [], isLoading: membersLoading } = useQuery({
		queryKey: ["practice_members", practice?.id],
		enabled: !!practice?.id && opened,
		queryFn: async () => {
			const { data, error } = await supabase
				.from(DatabaseTables.PracticeMembers)
				.select("email, role, user_id, created_at")
				.eq("practice_id", practice.id)
				.order("email", { ascending: true });
			if (error) throw error;

			// Enrich with user names from allowed_users
			const emails = (data ?? []).map((m: any) => m.email);
			if (emails.length === 0) return [];

			const { data: users } = await supabase
				.from(DatabaseTables.Allowed_Users)
				.select("email, first_name, last_name, role")
				.in("email", emails);

			const userMap = new Map(
				(users ?? []).map((u: any) => [u.email, u])
			);

			return (data ?? []).map((m: any) => ({
				...m,
				first_name: userMap.get(m.email)?.first_name ?? null,
				last_name: userMap.get(m.email)?.last_name ?? null,
				user_role: userMap.get(m.email)?.role ?? null,
			}));
		},
	});

	// Fetch all users for the "add" mode
	const { data: allUsers = [], isLoading: usersLoading } = useQuery({
		queryKey: ["all_users_for_assign"],
		enabled: opened && mode === "add",
		queryFn: async () => {
			const { data, error } = await supabase
				.from(DatabaseTables.Allowed_Users)
				.select("email, first_name, last_name, role")
				.order("first_name", { ascending: true });
			if (error) throw error;
			return data ?? [];
		},
	});

	// Filter current members by search
	const filteredMembers = useMemo(() => {
		const q = (debounced || "").trim().toLowerCase();
		if (!q) return members;
		return members.filter((m: any) => {
			const hay = [
				m.first_name ?? "",
				m.last_name ?? "",
				m.email ?? "",
			]
				.join(" ")
				.toLowerCase();
			return hay.includes(q);
		});
	}, [members, debounced]);

	// Filter out already-assigned users and apply search
	const availableUsers = useMemo(() => {
		const assignedEmails = new Set(members.map((m: any) => m.email));
		let list = allUsers.filter(
			(u: any) => !assignedEmails.has(u.email)
		);

		const q = (debounced || "").trim().toLowerCase();
		if (q) {
			list = list.filter((u: any) => {
				const hay = [
					u.first_name ?? "",
					u.last_name ?? "",
					u.email ?? "",
				]
					.join(" ")
					.toLowerCase();
				return hay.includes(q);
			});
		}

		return list;
	}, [allUsers, members, debounced]);

	// Assign user
	const { mutate: assignUser, isPending: assigning } = useMutation({
		mutationFn: async (email: string) => {
			const { error } = await supabase.rpc(
				RPCFunctions.AssignUserToPractice,
				{
					p_email: email,
					p_practice: practice.id,
				}
			);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["practice_members", practice?.id],
			});
		},
	});

	// Unassign user
	const { mutate: unassignUser, isPending: unassigning } = useMutation({
		mutationFn: async (email: string) => {
			const { error } = await supabase.rpc(
				RPCFunctions.UnAssignUserFromPractice,
				{
					p_email: email,
					p_practice: practice.id,
				}
			);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["practice_members", practice?.id],
			});
		},
	});

	const handleClose = () => {
		setMode("view");
		setQuery("");
		setConfirmRemove(null);
		onClose();
	};

	return (
		<Drawer
			opened={opened}
			onClose={handleClose}
			title={
				<Text fz="h4" fw={600}>
					<Text span fz="h4" fw={600} c="blue.4">
						Members
					</Text>{" "}
					&#9679; {practice?.name}
				</Text>
			}
			size="27rem"
			position="right"
			offset={8}
			radius={10}
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
		>
			<Stack h="100%" gap={16}>
				{/* Toggle between view/add */}
				<Flex gap={8}>
					<Button
						variant={mode === "view" ? "filled" : "light"}
						size="xs"
						radius={10}
						onClick={() => {
							setMode("view");
							setQuery("");
						}}
					>
						Current Members ({members.length})
					</Button>
					<Button
						variant={mode === "add" ? "filled" : "light"}
						color="teal"
						size="xs"
						radius={10}
						onClick={() => setMode("add")}
						leftSection={<IconUserPlus size={14} />}
					>
						Add Members
					</Button>
				</Flex>

				<TextInput
					radius={10}
					size="sm"
					fz="sm"
					placeholder={mode === "view" ? "Search current members..." : "Search users by name or email..."}
					leftSection={<IconSearch size={18} />}
					value={query}
					onChange={(e) => setQuery(e.currentTarget.value)}
				/>

				<Card
					radius={10}
					style={{
						border: `1px solid ${T.blue[0]}`,
						overflow: "auto",
						scrollbarWidth: "thin",
						scrollbarColor: `${T.gray[2]} transparent`,
					}}
					shadow="xs"
					bg="gray.0"
					h="100%"
					mah={550}
					p="sm"
				>
					{mode === "view" ? (
						membersLoading ? (
							<Flex justify="center" py="xl">
								<Loader size="sm" color="blue.3" />
							</Flex>
						) : filteredMembers.length === 0 ? (
							<Text size="sm" c="gray.5" ta="center" py="xl">
								{debounced ? "No matching members found." : "No members assigned to this practice."}
							</Text>
						) : (
							<Stack gap={12}>
								{filteredMembers.map((m: any) => {
									const name = [
										m.first_name,
										m.last_name,
									]
										.filter(Boolean)
										.join(" ");
									return (
										<Flex
											key={m.email}
											align="center"
											justify="space-between"
											gap={8}
											py={4}
											px={6}
											style={{
												borderRadius: 8,
												border: `1px solid ${T.gray[1]}`,
												background: "white",
											}}
										>
											<Flex
												gap={8}
												align="center"
												style={{
													overflow: "hidden",
												}}
											>
												<IconUser
													size={15}
													color={T.gray[5]}
													style={{
														flexShrink: 0,
													}}
												/>
												<Stack gap={0}>
													<Text
														size="sm"
														fw={500}
														c="gray.8"
													>
														{name || m.email}
													</Text>
													{name && (
														<Text
															size="xs"
															c="gray.5"
														>
															{m.email}
														</Text>
													)}
												</Stack>
											</Flex>

											<Flex
												gap={6}
												align="center"
												style={{
													flexShrink: 0,
												}}
											>
												{m.user_role && (
													<Badge
														variant="light"
														color="blue"
														size="xs"
													>
														{m.user_role}
													</Badge>
												)}
												{confirmRemove === m.email ? (
													<Flex gap={4} align="center">
														<Button
															variant="filled"
															color="red"
															size="compact-xs"
															loading={unassigning}
															onClick={() => {
																unassignUser(m.email, {
																	onSuccess: () => setConfirmRemove(null),
																});
															}}
														>
															Remove
														</Button>
														<Button
															variant="subtle"
															color="gray"
															size="compact-xs"
															onClick={() => setConfirmRemove(null)}
														>
															Cancel
														</Button>
													</Flex>
												) : (
													<ActionIcon
														variant="subtle"
														color="red.5"
														size="sm"
														onClick={() =>
															setConfirmRemove(m.email)
														}
														title="Remove from practice"
													>
														<IconUserMinus
															size={14}
														/>
													</ActionIcon>
												)}
											</Flex>
										</Flex>
									);
								})}
							</Stack>
						)
					) : usersLoading ? (
						<Flex justify="center" py="xl">
							<Loader size="sm" color="teal" />
						</Flex>
					) : availableUsers.length === 0 ? (
						<Text size="sm" c="gray.5" ta="center" py="xl">
							{debounced
								? "No matching users found."
								: "All users are already assigned."}
						</Text>
					) : (
						<Stack gap={10}>
							{availableUsers.map((u: any) => {
								const name = [u.first_name, u.last_name]
									.filter(Boolean)
									.join(" ");
								return (
									<Flex
										key={u.email}
										align="center"
										justify="space-between"
										gap={8}
										py={4}
										px={6}
										style={{
											borderRadius: 8,
											border: `1px solid ${T.gray[1]}`,
											background: "white",
										}}
									>
										<Flex
											gap={8}
											align="center"
											style={{
												overflow: "hidden",
											}}
										>
											<IconUser
												size={15}
												color={T.gray[5]}
												style={{ flexShrink: 0 }}
											/>
											<Stack gap={0}>
												<Text
													size="sm"
													fw={500}
													c="gray.8"
												>
													{name || u.email}
												</Text>
												{name && (
													<Text
														size="xs"
														c="gray.5"
													>
														{u.email}
													</Text>
												)}
											</Stack>
										</Flex>

										<Button
											variant="light"
											color="teal"
											size="compact-xs"
											loading={assigning}
											onClick={() =>
												assignUser(u.email)
											}
											leftSection={
												<IconUserPlus size={12} />
											}
										>
											Add
										</Button>
									</Flex>
								);
							})}
						</Stack>
					)}
				</Card>
			</Stack>
		</Drawer>
	);
};

export default PracticeMembersDrawer;
