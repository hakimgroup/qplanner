import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Group,
	Loader,
	MultiSelect,
	Stack,
	Text,
	Title,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import {
	IconBuilding,
	IconStar,
	IconStarFilled,
	IconX,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { usePractice } from "@/shared/PracticeProvider";
import { usePracticesOfInterest } from "@/shared/PracticesOfInterestProvider";
import { format } from "date-fns";

export default function PracticesOfInterest() {
	const T = useMantineTheme().colors;
	const { practices } = usePractice();
	const { poi, poiPracticeIdSet, loading, addPractice, removePractice } =
		usePracticesOfInterest();
	const [busyId, setBusyId] = useState<string | null>(null);
	const [pendingValue, setPendingValue] = useState<string[]>([]);

	// MultiSelect data — full practice list
	const data = useMemo(
		() =>
			(practices ?? []).map((p) => ({
				value: p.id,
				label: p.name,
			})),
		[practices],
	);

	// The MultiSelect value mirrors the saved POI list. Local pending state
	// lets the chip clear immediately while the RPC catches up.
	const value = useMemo(
		() => Array.from(poiPracticeIdSet),
		[poiPracticeIdSet],
	);

	const handleChange = async (next: string[]) => {
		const prev = new Set(value);
		const nextSet = new Set(next);

		const added = next.filter((id) => !prev.has(id));
		const removed = value.filter((id) => !nextSet.has(id));

		setPendingValue(next);
		for (const id of added) {
			setBusyId(id);
			await addPractice(id);
		}
		for (const id of removed) {
			setBusyId(id);
			await removePractice(id);
		}
		setBusyId(null);
	};

	const handleRemove = async (id: string) => {
		setBusyId(id);
		await removePractice(id);
		setBusyId(null);
	};

	const displayValue =
		pendingValue.length > 0 && busyId ? pendingValue : value;

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Title order={1}>Practices of Interest</Title>
				<Text c="gray.6">
					Select the practices you manage. When you switch the sidebar
					toggle to "Mine", every admin screen scopes its data to this
					list.
				</Text>
			</Stack>

			{/* Add / multi-select card */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.violet[1]}` }}
				shadow="xs"
			>
				<Stack gap={12}>
					<Group gap={8} align="center">
						<IconStar size={18} color={T.violet[5]} />
						<Title order={4}>Add or remove practices</Title>
					</Group>
					<Text size="sm" c="gray.6">
						Start typing a practice name to search. Click a chip's
						× to remove a practice from your list.
					</Text>
					<MultiSelect
						radius={10}
						size="md"
						placeholder={
							value.length === 0
								? "Search practices..."
								: "Add another practice..."
						}
						data={data}
						value={displayValue}
						onChange={handleChange}
						searchable
						clearable={false}
						maxDropdownHeight={320}
						nothingFoundMessage="No practices match"
						styles={{
							pill: {
								backgroundColor: T.violet[0],
								color: T.violet[8],
								border: `1px solid ${T.violet[2]}`,
							},
						}}
					/>
				</Stack>
			</Card>

			{/* Current list */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={15}>
					<Group justify="space-between" align="center">
						<Group gap={8}>
							<IconStarFilled size={18} color={T.violet[5]} />
							<Title order={4}>
								My Practices{" "}
								<Text span c="violet.5" fw={700}>
									({poi.length})
								</Text>
							</Title>
						</Group>
						{loading && <Loader size="sm" color="violet" />}
					</Group>

					{poi.length === 0 ? (
						<Box
							p="xl"
							style={{
								background: `linear-gradient(135deg, ${T.blue[0]}, ${T.violet[0]})`,
								borderRadius: 10,
								border: `1px dashed ${T.violet[2]}`,
								textAlign: "center",
							}}
						>
							<Stack align="center" gap={6}>
								<IconStar size={32} color={T.violet[4]} stroke={1.5} />
								<Text size="sm" c="violet.7" fw={600}>
									No practices added yet
								</Text>
								<Text size="xs" c="gray.6" maw={400}>
									Use the search above to pick practices you manage.
									They'll show up here, and the sidebar "Mine" toggle
									will start scoping admin screens to this list.
								</Text>
							</Stack>
						</Box>
					) : (
						<Stack gap={8}>
							{poi.map((p) => (
								<Card
									key={p.practice_id}
									p="sm"
									radius={10}
									style={{
										border: `1px solid ${T.gray[1]}`,
										background: "#fff",
									}}
								>
									<Flex
										justify="space-between"
										align="center"
										gap={10}
									>
										<Group gap={10} align="center" wrap="nowrap">
											<Box
												style={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													width: 32,
													height: 32,
													borderRadius: 8,
													background: T.violet[0],
												}}
											>
												<IconBuilding
													size={16}
													color={T.violet[5]}
												/>
											</Box>
											<Stack gap={0} style={{ minWidth: 0 }}>
												<Text fw={600} size="sm" lineClamp={1}>
													{p.practice_name}
												</Text>
												<Text
													size="xs"
													c="gray.6"
													lineClamp={1}
												>
													{[p.address, p.post_code]
														.filter(Boolean)
														.join(" · ") || "—"}
												</Text>
											</Stack>
										</Group>
										<Group gap={8} align="center" wrap="nowrap">
											<Badge
												size="xs"
												variant="light"
												color="violet"
												radius="sm"
											>
												Added{" "}
												{format(
													new Date(p.added_at),
													"dd MMM yyyy",
												)}
											</Badge>
											<Tooltip
												label="Remove from list"
												withArrow
											>
												<ActionIcon
													variant="subtle"
													color="red.5"
													radius="md"
													disabled={
														busyId === p.practice_id
													}
													onClick={() =>
														handleRemove(
															p.practice_id,
														)
													}
													aria-label="Remove"
												>
													<IconX size={16} />
												</ActionIcon>
											</Tooltip>
										</Group>
									</Flex>
								</Card>
							))}
						</Stack>
					)}
				</Stack>
			</Card>

			{/* Helper footer */}
			<Group gap={8} c="gray.6">
				<Button
					variant="subtle"
					color="violet"
					size="xs"
					leftSection={<IconStar size={14} />}
					component="a"
					href="#"
					onClick={(e) => e.preventDefault()}
					style={{ pointerEvents: "none" }}
				>
					Tip
				</Button>
				<Text size="xs" c="gray.6">
					You can also star a practice directly from the Practices directory.
				</Text>
			</Group>
		</Stack>
	);
}
