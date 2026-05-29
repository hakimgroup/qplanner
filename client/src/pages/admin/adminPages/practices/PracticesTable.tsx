import { useCallback, useMemo, useState } from "react";
import Table from "@/components/table/Table";
import {
	ActionIcon,
	Badge,
	Button,
	Flex,
	Text,
	useMantineTheme,
} from "@mantine/core";
import {
	IconBuildings,
	IconExternalLink,
	IconMail,
	IconPhone,
	IconSettings,
	IconStar,
	IconStarFilled,
	IconTrash,
	IconUsers,
} from "@tabler/icons-react";
import { ColDef } from "ag-grid-community";
import PracticeEditDrawer from "./PracticeEditDrawer";
import DeletePracticeModal from "./DeletePracticeModal";
import PracticeMembersDrawer from "./PracticeMembersDrawer";
import { useAuth } from "@/shared/AuthProvider";
import { UserRoles } from "@/shared/shared.models";
import { usePracticesOfInterest } from "@/shared/PracticesOfInterestProvider";
import { Tooltip } from "@mantine/core";

interface Props {
	loading: boolean;
	practices: any[];
}

const PracticesTable = ({ practices, loading }: Props) => {
	const T = useMantineTheme().colors;
	const { role } = useAuth();
	const isSuperAdmin = role === UserRoles.SuperAdmin;
	const {
		poiPracticeIdSet,
		addPractice,
		removePractice,
		isEnabled: poiEnabled,
	} = usePracticesOfInterest();
	const [editRow, setEditRow] = useState<any>(null);
	const [deleteRow, setDeleteRow] = useState<any>(null);
	const [membersRow, setMembersRow] = useState<any>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	const openEdit = useCallback((data: any) => setEditRow(data), []);
	const openDelete = useCallback((data: any) => setDeleteRow(data), []);
	const openMembers = useCallback((data: any) => setMembersRow(data), []);

	const handleToggleStar = useCallback(
		async (id: string, currentlyStarred: boolean) => {
			if (!poiEnabled) return;
			setBusyId(id);
			if (currentlyStarred) await removePractice(id);
			else await addPractice(id);
			setBusyId(null);
		},
		[poiEnabled, addPractice, removePractice],
	);

	const colDefs: ColDef[] = useMemo(
		() => [
			// Super-admin only — "Mine" star toggle column. Sorts so starred
			// practices float to the top by default.
			...(isSuperAdmin
				? [
						{
							field: "_poiStar",
							headerName: "",
							width: 56,
							minWidth: 56,
							sortable: true,
							filter: false,
							pinned: "left" as const,
							lockPinned: true,
							valueGetter: (p: any) =>
								poiPracticeIdSet.has(p.data?.id) ? 1 : 0,
							sort: "desc" as const,
							cellStyle: {
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							},
							cellRenderer: ({ data }: any) => {
								const starred = poiPracticeIdSet.has(data?.id);
								const busy = busyId === data?.id;
								return (
									<Tooltip
										label={
											starred
												? "Remove from Practices of Interest"
												: "Add to Practices of Interest"
										}
										withArrow
									>
										<ActionIcon
											variant="subtle"
											size="lg"
											radius={10}
											color={starred ? "yellow.6" : "gray.4"}
											disabled={busy}
											onClick={() =>
												handleToggleStar(data.id, starred)
											}
											aria-label={
												starred ? "Unstar practice" : "Star practice"
											}
										>
											{starred ? (
												<IconStarFilled size={18} />
											) : (
												<IconStar size={18} />
											)}
										</ActionIcon>
									</Tooltip>
								);
							},
						},
					]
				: []),
			{
				field: "name",
				headerName: "Practice Name",
				flex: 1.2,
				minWidth: 220,
				cellRenderer: ({ value }: any) => (
					<Flex gap={6} align="center">
						<IconBuildings size={16} />
						<Text size="sm" c="gray.9" fw={600} title={value || ""}>
							{value || "—"}
						</Text>
					</Flex>
				),
			},
			{
				field: "address",
				headerName: "Address",
				flex: 1.5,
				minWidth: 280,
				sortable: false,
				cellRenderer: ({ value, data }: any) => {
					const address = value || "";
					const postCode = data?.post_code || "";
					const full = [address, postCode].filter(Boolean).join(", ");
					return (
						<Flex gap={4} align="center" title={full} wrap="nowrap">
							<Text size="sm" c="gray.6" lineClamp={1}>
								{address || "—"}
							</Text>
							{postCode && (
								<Text size="xs" c="gray.5" fw={600} style={{ whiteSpace: "nowrap" }}>
									{postCode}
								</Text>
							)}
						</Flex>
					);
				},
			},
			{
				field: "country",
				headerName: "Country",
				width: 130,
				minWidth: 110,
				sortable: false,
				cellRenderer: ({ value }: any) =>
					value ? (
						<Badge
							variant="light"
							color="blue"
							size="sm"
							fw={700}
							style={{ border: `1px solid ${T.blue[1]}` }}
						>
							{value}
						</Badge>
					) : (
						<Text size="sm" c="gray.4">
							—
						</Text>
					),
			},
			{
				field: "phone",
				headerName: "Contact",
				flex: 1,
				minWidth: 240,
				sortable: false,
				cellRenderer: ({ data }: any) => {
					const phone = data?.phone;
					const email = data?.email;
					const website = data?.website;
					if (!phone && !email && !website) return <Text size="sm" c="gray.4">—</Text>;
					return (
						<Flex direction="column" gap={5} justify="center" py={10}>
							{phone && (
								<Flex gap={5} align="center" wrap="nowrap">
									<IconPhone size={13} color={T.teal[5]} style={{ flexShrink: 0 }} />
									<Text size="xs" c="gray.7" fw={500} style={{ whiteSpace: "nowrap" }}>
										{phone}
									</Text>
								</Flex>
							)}
							{email && (
								<Flex gap={5} align="center" wrap="nowrap">
									<IconMail size={13} color={T.blue[4]} style={{ flexShrink: 0 }} />
									<Text size="xs" c="gray.5" fw={500} title={email} style={{ whiteSpace: "nowrap" }}>
										{email.length > 28 ? email.slice(0, 28) + "..." : email}
									</Text>
								</Flex>
							)}
							{website && (
								<Flex gap={5} align="center" wrap="nowrap">
									<IconExternalLink size={13} color={T.violet[4]} style={{ flexShrink: 0 }} />
									<Text
										component="a"
										href={website.startsWith("http") ? website : `https://${website}`}
										target="_blank"
										rel="noopener noreferrer"
										size="xs"
										c="violet.5"
										fw={500}
										title={website}
										style={{ whiteSpace: "nowrap", textDecoration: "none" }}
									>
										Website
									</Text>
								</Flex>
							)}
						</Flex>
					);
				},
			},
			{
				field: "buddy",
				headerName: "Buddy",
				width: 150,
				minWidth: 120,
				sortable: false,
				cellRenderer: ({ value }: any) =>
					value ? (
						<Badge
							variant="light"
							color="violet"
							size="sm"
							fw={700}
							style={{ border: `1px solid ${T.violet[1]}` }}
						>
							{value}
						</Badge>
					) : (
						<Text size="sm" c="gray.4">
							—
						</Text>
					),
			},
			{
				field: "members",
				headerName: "Members",
				width: 140,
				minWidth: 120,
				sortable: false,
				cellRenderer: (p: any) => (
					<Button
						variant="light"
						color="blue"
						size="compact-xs"
						leftSection={<IconUsers size={13} />}
						onClick={() => openMembers(p.data)}
					>
						View
					</Button>
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
				cellRenderer: (p: any) => (
					<Flex align="center" gap={2}>
						<ActionIcon
							variant="subtle"
							size="lg"
							radius={10}
							color="violet.9"
							onClick={() => openEdit(p.data)}
						>
							<IconSettings size={18} />
						</ActionIcon>
						{role === UserRoles.SuperAdmin && (
							<ActionIcon
								variant="subtle"
								size="lg"
								radius={10}
								color="red.9"
								onClick={() => openDelete(p.data)}
							>
								<IconTrash size={18} />
							</ActionIcon>
						)}
					</Flex>
				),
			},
		],
		[
			T.blue,
			T.teal,
			T.violet,
			role,
			openEdit,
			openDelete,
			openMembers,
			isSuperAdmin,
			poiPracticeIdSet,
			busyId,
			handleToggleStar,
		]
	);

	return (
		<>
			<Table
				loading={loading}
				rows={practices && practices.length ? practices : []}
				cols={colDefs}
				enableSelection={false}
				height={600}
			/>

			<PracticeEditDrawer
				practice={editRow}
				opened={!!editRow}
				onClose={() => setEditRow(null)}
			/>

			<DeletePracticeModal
				practice={deleteRow}
				opened={!!deleteRow}
				onClose={() => setDeleteRow(null)}
			/>

			<PracticeMembersDrawer
				practice={membersRow}
				opened={!!membersRow}
				onClose={() => setMembersRow(null)}
			/>
		</>
	);
};

export default PracticesTable;
