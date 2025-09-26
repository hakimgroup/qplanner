import { AllowedUser } from "@/api/auth";
import { userRoleColors } from "@/shared/shared.const";
import {
	Badge,
	Button,
	Card,
	Checkbox,
	Drawer,
	Flex,
	Stack,
	Text,
	TextInput,
	useMantineTheme,
} from "@mantine/core";
import { find, upperFirst } from "lodash";
import { roles } from "@/filters.json";
import { usePractice } from "@/shared/PracticeProvider";
import { IconCircle, IconCircleFilled, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { useUpdateUser } from "@/pages/auth/auth.hooks";

interface Props {
	row: AllowedUser;
	opened: boolean;

	mode?: string;
	closePanel: () => void;
}

const PeopleActions = ({ row, opened, closePanel, mode }: Props) => {
	const isView = mode === "view";
	const T = useMantineTheme().colors;
	const { practices } = usePractice();
	const name = `${upperFirst(row?.first_name)} ${upperFirst(row?.last_name)}`;
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 150);
	const [assignedPractices, setAssignedPractices] = useState(
		row?.assigned_practices?.map((p) => p.id)
	);

	//API
	const { mutate: updateUser, isPending } = useUpdateUser();

	const filteredPractices = useMemo(() => {
		const q = debounced.trim().toLowerCase();
		if (!q) return practices;

		return practices.filter((p) => {
			const name = (p.name ?? "").toLowerCase();
			const code = p.id?.toLowerCase?.() ?? "";
			return name.includes(q) || code.includes(q);
		});
	}, [practices, debounced]);

	return (
		<Drawer
			opened={opened}
			onClose={closePanel}
			title={
				<Text fz={"h4"} fw={600}>
					<Text span fz={"h4"} fw={600} c="blue.4">
						Manage Access
					</Text>{" "}
					&#9679; {name}
				</Text>
			}
			size={"25rem"}
			position="right"
			offset={8}
			radius={10}
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
		>
			<Stack h={"100%"}>
				<Text fw={700}>User Details</Text>
				<Stack gap={0}>
					<Text size="sm" fw={500}>
						Name
					</Text>

					<Text size="sm" c="gray.8">
						{name}
					</Text>
				</Stack>

				<Stack gap={0}>
					<Text size="sm" fw={500}>
						Email
					</Text>

					<Text size="sm" c="gray.8">
						{row?.email}
					</Text>
				</Stack>

				<Stack gap={5}>
					<Text size="sm" fw={500}>
						Role
					</Text>

					<Badge
						variant="light"
						color={userRoleColors[row?.role]}
						size="sm"
						fw={700}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						{find(roles, { value: row?.role })?.label}
					</Badge>
				</Stack>

				<Text mt={10} fw={700}>
					Practice Access
				</Text>
				{!isView && (
					<TextInput
						radius={10}
						size="sm"
						fz={"sm"}
						placeholder="Search practice"
						leftSection={<IconSearch size={18} />}
						value={query}
						onChange={(e) => setQuery(e.currentTarget.value)}
					/>
				)}
				<Card
					radius={10}
					style={{
						border: `1px solid ${T.blue[0]}`,
						overflow: "auto",
						scrollbarWidth: "thin",
						scrollbarColor: `${T.gray[2]} transparent`,
					}}
					shadow="xs"
					bg={"gray.0"}
					h={"100%"}
					mah={490}
				>
					{isView ? (
						<Stack>
							{row?.assigned_practices.map((p, i) => (
								<Stack mt={i === 0 ? 0 : 15} gap={5} key={p.id}>
									<Flex align="center" gap={5}>
										<IconCircleFilled
											size={10}
											color={T.red[4]}
										/>
										<Text size="sm" fw={500}>
											{p.name}
										</Text>
									</Flex>
									{p.numberOfPlans > 0 && (
										<Text size="xs" fw={700} c="green.9">
											{p.numberOfPlans} plans already
											under this practice
										</Text>
									)}
								</Stack>
							))}
						</Stack>
					) : (
						<Checkbox.Group
							defaultValue={assignedPractices}
							value={assignedPractices}
							onChange={setAssignedPractices}
						>
							<Stack mt={"xs"}>
								{filteredPractices.length === 0 ? (
									<Text size="sm" c="gray.6" mt={10}>
										No practices match “{debounced}”.
									</Text>
								) : (
									filteredPractices.map((p, i) => {
										let numberOfPlans = find(
											row?.assigned_practices,
											{ id: p.id }
										)?.numberOfPlans;
										return (
											<Checkbox
												mt={15}
												radius={50}
												size="xs"
												color="blue.3"
												key={p.id}
												value={p.id}
												label={
													<Stack gap={0} mt={-10}>
														<Text
															size="sm"
															fw={500}
														>
															{p.name}
														</Text>
														<Text
															size="xs"
															c="gray.4"
														>
															{/* simple visual code; retains existing look */}
															PR0
															{i < 9
																? `0${i + 1}`
																: i + 1}
														</Text>
														{numberOfPlans > 0 && (
															<Text
																size="xs"
																fw={700}
																c="green.9"
															>
																{numberOfPlans}{" "}
																plans already
																under this
																practice
															</Text>
														)}
													</Stack>
												}
											/>
										);
									})
								)}
							</Stack>
						</Checkbox.Group>
					)}
				</Card>
				{!isView && (
					<Button
						fullWidth
						loading={isPending}
						onClick={() =>
							updateUser(
								{
									id: row?.id,
									assigned_practices: assignedPractices,
								},
								{
									onSuccess: closePanel,
								}
							)
						}
					>
						Save Changes
					</Button>
				)}
			</Stack>
		</Drawer>
	);
};

export default PeopleActions;
