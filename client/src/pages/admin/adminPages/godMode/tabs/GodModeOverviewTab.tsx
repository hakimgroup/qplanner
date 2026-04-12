import {
	Stack,
	SimpleGrid,
	Text,
	Badge,
	Group,
	Box,
	useMantineTheme,
	rgba,
	ThemeIcon,
	Avatar,
	Button,
} from "@mantine/core";
import {
	IconClipboardList,
	IconBuildingStore,
	IconCalendar,
	IconUsers,
	IconLink,
	IconNote,
	IconEdit,
} from "@tabler/icons-react";
import { useState } from "react";
import { GodModeSelectionDetails } from "@/hooks/godMode.hooks";
import { format, parseISO } from "date-fns";
import { startCase } from "lodash";
import { statusColors } from "@/shared/shared.const";
import GodModeEditSelectionModal from "../modals/GodModeEditSelectionModal";
import GodModeEditBespokeModal from "../modals/GodModeEditBespokeModal";

interface Props {
	data: GodModeSelectionDetails;
}

const formatDate = (d?: string | null) => {
	if (!d) return "—";
	try {
		return format(parseISO(d), "d MMM yyyy");
	} catch {
		return d;
	}
};

const formatDateTime = (d?: string | null) => {
	if (!d) return "—";
	try {
		return format(parseISO(d), "d MMM yyyy, HH:mm");
	} catch {
		return d;
	}
};

function Section({
	icon,
	title,
	tint,
	action,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	tint: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	const T = useMantineTheme().colors;
	const palette = T[tint as keyof typeof T] as any;
	return (
		<Box
			p="lg"
			style={{
				background: rgba(palette[0], 0.5),
				borderRadius: 14,
				border: `1px solid ${rgba(palette[3], 0.25)}`,
			}}
		>
			<Group gap={10} mb="md" align="center" justify="space-between">
				<Group gap={10} align="center">
					<ThemeIcon
						size={32}
						radius="md"
						variant="light"
						color={tint}
					>
						{icon}
					</ThemeIcon>
					<Text fw={700} size="md" c={`${tint}.8` as any}>
						{title}
					</Text>
				</Group>
				{action}
			</Group>
			{children}
		</Box>
	);
}

function Field({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	const isPrimitive =
		value === null ||
		value === undefined ||
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean";
	return (
		<Stack gap={3}>
			<Text size="xs" c="gray.6" fw={600} tt="uppercase" style={{ letterSpacing: 0.4 }}>
				{label}
			</Text>
			{isPrimitive ? (
				<Text size="sm" fw={500} c="gray.9">
					{(value as any) ?? "—"}
				</Text>
			) : (
				<Box>{value}</Box>
			)}
		</Stack>
	);
}

export default function GodModeOverviewTab({ data }: Props) {
	const T = useMantineTheme().colors;
	const sel = data.selection;
	const camp = data.bespoke_campaign ?? data.campaign;
	const isBespoke = !!data.bespoke_campaign;
	const practice = data.practice;
	const statusColor = sel?.status
		? (statusColors as any)[sel.status] ?? T.gray[6]
		: T.gray[6];

	const [editSelectionOpen, setEditSelectionOpen] = useState(false);
	const [editBespokeOpen, setEditBespokeOpen] = useState(false);

	return (
		<Stack gap="lg">
			<Section
				icon={<IconClipboardList size={18} />}
				title="Selection"
				tint="violet"
				action={
					<Button
						size="xs"
						variant="light"
						color="violet"
						radius="md"
						leftSection={<IconEdit size={13} />}
						onClick={() => setEditSelectionOpen(true)}
					>
						Edit
					</Button>
				}
			>
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
					<Field
						label="Status"
						value={
							<Badge
								variant="light"
								size="md"
								radius="sm"
								style={{
									background: rgba(statusColor, 0.12),
									color: statusColor,
								}}
							>
								{startCase(sel?.status)}
							</Badge>
						}
					/>
					<Field
						label="Type"
						value={
							<Badge
								variant="light"
								color={isBespoke ? "violet" : "blue"}
								size="md"
								radius="sm"
							>
								{isBespoke ? "Bespoke" : "Catalog"}
							</Badge>
						}
					/>
					<Field
						label="Source"
						value={sel?.source ? startCase(sel.source) : "—"}
					/>
					<Field label="From" value={formatDate(sel?.from_date)} />
					<Field label="To" value={formatDate(sel?.to_date)} />
					<Field
						label="Self Print"
						value={
							sel?.self_print ? (
								<Badge size="sm" color="teal" variant="light">
									Yes
								</Badge>
							) : (
								<Text size="sm" c="gray.6">
									No
								</Text>
							)
						}
					/>
					<Field label="Last Updated" value={formatDateTime(sel?.updated_at)} />
				</SimpleGrid>

				{(sel?.markup_link || sel?.assets_link) && (
					<Box
						mt="md"
						p="md"
						style={{
							background: "white",
							borderRadius: 10,
							border: `1px solid ${rgba(T.violet[3], 0.25)}`,
						}}
					>
						<Stack gap="sm">
							{sel?.markup_link && (
								<Group gap="sm" wrap="nowrap" align="center">
									<ThemeIcon
										size="sm"
										variant="light"
										color="violet"
										radius="xl"
									>
										<IconLink size={12} />
									</ThemeIcon>
									<Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
										<Text
											size="xs"
											c="gray.6"
											fw={600}
											tt="uppercase"
											style={{ letterSpacing: 0.4 }}
										>
											Markup Link
										</Text>
										<a
											href={sel.markup_link}
											target="_blank"
											rel="noopener noreferrer"
											style={{
												color: T.violet[6],
												fontSize: 13,
												fontWeight: 500,
												textDecoration: "none",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{sel.markup_link}
										</a>
									</Stack>
								</Group>
							)}
							{sel?.assets_link && (
								<Group gap="sm" wrap="nowrap" align="center">
									<ThemeIcon
										size="sm"
										variant="light"
										color="teal"
										radius="xl"
									>
										<IconLink size={12} />
									</ThemeIcon>
									<Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
										<Text
											size="xs"
											c="gray.6"
											fw={600}
											tt="uppercase"
											style={{ letterSpacing: 0.4 }}
										>
											Assets Link
										</Text>
										<a
											href={sel.assets_link}
											target="_blank"
											rel="noopener noreferrer"
											style={{
												color: T.teal[6],
												fontSize: 13,
												fontWeight: 500,
												textDecoration: "none",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{sel.assets_link}
										</a>
									</Stack>
								</Group>
							)}
						</Stack>
					</Box>
				)}

				{sel?.notes && (
					<Box
						mt="md"
						p="md"
						style={{
							background: "white",
							borderRadius: 10,
							border: `1px solid ${rgba(T.violet[3], 0.25)}`,
						}}
					>
						<Group gap="sm" align="flex-start">
							<ThemeIcon size="sm" variant="light" color="gray" radius="xl">
								<IconNote size={12} />
							</ThemeIcon>
							<Stack gap={2} style={{ flex: 1 }}>
								<Text
									size="xs"
									c="gray.6"
									fw={600}
									tt="uppercase"
									style={{ letterSpacing: 0.4 }}
								>
									Notes
								</Text>
								<Text size="sm" c="gray.8">
									{sel.notes}
								</Text>
							</Stack>
						</Group>
					</Box>
				)}
			</Section>

			<Section
				icon={<IconCalendar size={18} />}
				title={isBespoke ? "Bespoke Campaign" : "Catalog Campaign"}
				tint="blue"
				action={
					isBespoke ? (
						<Button
							size="xs"
							variant="light"
							color="blue"
							radius="md"
							leftSection={<IconEdit size={13} />}
							onClick={() => setEditBespokeOpen(true)}
						>
							Edit
						</Button>
					) : (
						<Badge
							variant="light"
							color="gray"
							size="xs"
							radius="sm"
						>
							Read-only
						</Badge>
					)
				}
			>
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
					<Field label="Name" value={camp?.name} />
					<Field label="Category" value={camp?.category} />
					{camp?.tier && <Field label="Tier" value={startCase(camp.tier)} />}
					{camp?.event_type && (
						<Field label="Event Type" value={startCase(camp.event_type)} />
					)}
				</SimpleGrid>

				{camp?.description && (
					<Box mt="md">
						<Field label="Description" value={camp.description} />
					</Box>
				)}
				{camp?.requirements && (
					<Box mt="md">
						<Field label="Requirements" value={camp.requirements} />
					</Box>
				)}

				{(camp?.objectives?.length ?? 0) > 0 && (
					<Box mt="md">
						<Text
							size="xs"
							c="gray.6"
							fw={600}
							tt="uppercase"
							mb={6}
							style={{ letterSpacing: 0.4 }}
						>
							Objectives
						</Text>
						<Group gap={6}>
							{camp.objectives.map((o: string) => (
								<Badge
									key={o}
									variant="light"
									color="blue"
									size="sm"
									radius="sm"
								>
									{startCase(o)}
								</Badge>
							))}
						</Group>
					</Box>
				)}

				{(camp?.topics?.length ?? 0) > 0 && (
					<Box mt="md">
						<Text
							size="xs"
							c="gray.6"
							fw={600}
							tt="uppercase"
							mb={6}
							style={{ letterSpacing: 0.4 }}
						>
							Topics
						</Text>
						<Group gap={6}>
							{camp.topics.map((t: string) => (
								<Badge
									key={t}
									variant="light"
									color="gray"
									c="gray.8"
									size="sm"
									radius="sm"
								>
									{startCase(t)}
								</Badge>
							))}
						</Group>
					</Box>
				)}
			</Section>

			<Section
				icon={<IconBuildingStore size={18} />}
				title="Practice"
				tint="teal"
			>
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
					<Field label="Name" value={practice?.name} />
					<Field label="Email" value={practice?.email} />
					<Field label="Phone" value={practice?.phone} />
					<Field label="Buddy" value={practice?.buddy} />
				</SimpleGrid>

				{practice?.address && (
					<Box mt="md">
						<Field label="Address" value={practice.address} />
					</Box>
				)}
			</Section>

			<Section
				icon={<IconUsers size={18} />}
				title={`Practice Members (${data.practice_members.length})`}
				tint="indigo"
			>
				{data.practice_members.length === 0 ? (
					<Text size="sm" c="gray.6">
						No members assigned to this practice.
					</Text>
				) : (
					<Stack gap={8}>
						{data.practice_members.map((m) => {
							const fullName =
								[m.first_name, m.last_name].filter(Boolean).join(" ") ||
								m.email;
							return (
								<Group
									key={m.user_id ?? m.email}
									gap="md"
									p="sm"
									style={{
										background: "white",
										borderRadius: 10,
										border: `1px solid ${rgba(T.indigo[3], 0.25)}`,
									}}
								>
									<Avatar
										name={fullName}
										size="sm"
										color="indigo"
										radius="xl"
									/>
									<Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
										<Text size="sm" fw={600} c="gray.9">
											{fullName}
										</Text>
										<Text size="xs" c="gray.6">
											{m.email}
										</Text>
									</Stack>
									<Badge
										size="xs"
										variant="light"
										color="indigo"
										radius="sm"
									>
										{m.role}
									</Badge>
								</Group>
							);
						})}
					</Stack>
				)}
			</Section>

			<GodModeEditSelectionModal
				opened={editSelectionOpen}
				onClose={() => setEditSelectionOpen(false)}
				selection={sel}
			/>

			{isBespoke && data.bespoke_campaign && (
				<GodModeEditBespokeModal
					opened={editBespokeOpen}
					onClose={() => setEditBespokeOpen(false)}
					bespokeCampaign={data.bespoke_campaign}
					selectionId={sel.id}
				/>
			)}
		</Stack>
	);
}
