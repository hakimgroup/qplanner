// components/admin/allowed-users/AllowedUsersCsvUploader.tsx
import { useState, useMemo } from "react";
import {
	Badge,
	Button,
	Card,
	FileInput,
	Group,
	Modal,
	Stack,
	Text,
	Alert,
	ActionIcon,
	useMantineTheme,
} from "@mantine/core";
import {
	IconCloudUpload,
	IconExclamationCircle,
	IconTrash,
	IconDownload,
} from "@tabler/icons-react";
import Papa from "papaparse";
import { supabase } from "@/api/supabase";
import StyledButton from "@/components/styledButton/StyledButton";
import { DatabaseTables, UserRoles } from "@/shared/shared.models";
import { userRoleColors } from "@/shared/shared.const";
import { startCase } from "lodash";
import Table from "@/components/table/Table";
import { ColDef } from "ag-grid-community";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Row = {
	email: string;
	first_name?: string;
	last_name?: string;
	role?: "user" | "admin" | "super_admin";
	_row?: number; // UI only
	_error?: string | null; // UI only
};

const ALLOWED_ROLES = new Set(["user", "admin", "super_admin"]);

const templateCsv = `email,first_name,last_name,role
jane.doe@example.com,Jane,Doe,user
john.manager@company.com,John,Manager,admin
ops.lead@company.com,Ops,Lead,super_admin
viewer@company.com,View,Only,user
`;

function normalizeRow(r: any, idx: number): Row {
	const email = String(r.email ?? "")
		.trim()
		.toLowerCase();
	const first_name = (r.first_name ?? "").toString().trim();
	const last_name = (r.last_name ?? "").toString().trim();
	const roleRaw = (r.role ?? "user").toString().trim().toLowerCase();
	const role = (ALLOWED_ROLES.has(roleRaw) ? roleRaw : "user") as Row["role"];

	let _error: string | null = null;
	if (!email) _error = "Missing email";
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		_error = "Invalid email";
	else if (r.role && !ALLOWED_ROLES.has(roleRaw)) _error = "Invalid role";

	return { email, first_name, last_name, role, _row: idx + 1, _error };
}

export default function AllowedUsersCsvUploader() {
	const qc = useQueryClient();
	const T = useMantineTheme().colors;
	const [opened, setOpened] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [rows, setRows] = useState<Row[]>([]);
	const [parsingErr, setParsingErr] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const stats = useMemo(() => {
		const total = rows.length;
		const invalid = rows.filter((r) => r._error).length;
		const valid = total - invalid;
		return { total, valid, invalid };
	}, [rows]);

	const handleParse = (f: File | null) => {
		setFile(f);
		setRows([]);
		setParsingErr(null);
		if (!f) return;

		Papa.parse(f, {
			header: true,
			skipEmptyLines: true,
			transformHeader: (h) => h.trim().toLowerCase(),
			complete: (res) => {
				try {
					const parsed = Array.isArray(res.data) ? res.data : [];
					const normalized = parsed.map((r, i) => normalizeRow(r, i));
					setRows(normalized);
					if (res.errors?.length) {
						setParsingErr(
							res.errors.map((e) => e.message).join("; ")
						);
					}
				} catch (e: any) {
					setParsingErr(e?.message ?? "Failed to parse CSV");
				}
			},
			error: (err) => {
				setParsingErr(err?.message ?? "Failed to parse CSV");
			},
		});
	};

	const handleClear = () => {
		setFile(null);
		setRows([]);
		setParsingErr(null);
	};

	const handleDownloadTemplate = () => {
		const blob = new Blob([templateCsv], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "allowed_users_template.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleSave = async () => {
		const valid = rows.filter((r) => !r._error);
		if (valid.length === 0) return;

		setSaving(true);
		try {
			const payload = valid.map(
				({ email, first_name, last_name, role }) => ({
					email,
					first_name: first_name || null,
					last_name: last_name || null,
					role: role || "user",
				})
			);

			const { error } = await supabase
				.from(DatabaseTables.Allowed_Users)
				.upsert(payload, {
					onConflict: "email",
					ignoreDuplicates: false,
				});

			if (error) throw error;

			handleClear();
			setOpened(false);
			toast.success("User added successfully!!");
			qc.invalidateQueries({ queryKey: [DatabaseTables.Allowed_Users] });
		} catch (e: any) {
			setParsingErr(e?.message ?? "Failed to save users");
		} finally {
			setSaving(false);
		}
	};

	// 🔹 AG Grid columns for the preview
	const colDefs: ColDef[] = useMemo(
		() => [
			{
				field: "email",
				headerName: "Email",
				flex: 1.6,
				minWidth: 220,
				tooltipField: "email",
			},
			{
				field: "first_name",
				headerName: "First name",
				flex: 1,
				minWidth: 140,
			},
			{
				field: "last_name",
				headerName: "Last name",
				flex: 1,
				minWidth: 140,
			},
			{
				field: "role",
				headerName: "Role",
				width: 140,
				sortable: false,
				filter: false,
				cellRenderer: ({ value }: any) => (
					<Badge variant="light" color={userRoleColors[value]}>
						{startCase(value)}
					</Badge>
				),
			},
			{
				field: "_error",
				headerName: "Issue",
				flex: 1,
				minWidth: 160,
				sortable: false,
				filter: false,
				cellRenderer: ({ value }: any) =>
					value ? (
						<Text size="xs" c="red.6" fw={700}>
							{value}
						</Text>
					) : (
						<Text size="xs" c="green.7" fw={700}>
							OK
						</Text>
					),
			},
		],
		[]
	);

	return (
		<>
			<Group>
				<StyledButton
					leftSection={<IconCloudUpload size={14} />}
					onClick={() => setOpened(true)}
				>
					Upload Allowed Users (CSV)
				</StyledButton>
				<Button
					variant="light"
					leftSection={<IconDownload size={16} />}
					onClick={handleDownloadTemplate}
				>
					Download template
				</Button>
			</Group>

			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				title={
					<Text fz={"h4"} fw={700}>
						Bulk Upload — Allowed Users
					</Text>
				}
				size="50rem"
				radius="md"
				overlayProps={{ backgroundOpacity: 0.6, blur: 3 }}
			>
				<Stack gap="md">
					<Text size="sm" c="gray.7">
						Upload a CSV with headers:{" "}
						<b>email, first_name, last_name, role</b>. Roles:{" "}
						{[
							UserRoles.User,
							UserRoles.Admin,
							UserRoles.SuperAdmin,
						].map((u) => (
							<Badge
								ml={6}
								variant="light"
								color={userRoleColors[u]}
								key={u}
							>
								{startCase(u)}
							</Badge>
						))}
					</Text>

					<Group justify="space-between" align="center">
						<FileInput
							placeholder="Select CSV file"
							accept=".csv,text/csv"
							leftSection={<IconCloudUpload size={16} />}
							value={file}
							onChange={handleParse}
							radius="md"
							w="100%"
						/>
						{file && (
							<ActionIcon
								variant="subtle"
								color="red"
								title="Clear"
								onClick={handleClear}
							>
								<IconTrash size={18} />
							</ActionIcon>
						)}
					</Group>

					{parsingErr && (
						<Alert
							color="red"
							icon={<IconExclamationCircle size={16} />}
						>
							{parsingErr}
						</Alert>
					)}

					{rows.length > 0 && (
						<Card
							radius={10}
							style={{ border: `1px solid ${T.blue[0]}` }}
							shadow="xs"
						>
							<Group justify="space-between" mb="sm">
								<Text fw={600}>Preview</Text>
								<Group gap="xs">
									<Badge variant="light">
										Total: {stats.total}
									</Badge>
									<Badge variant="light" color="green">
										Valid: {stats.valid}
									</Badge>
									<Badge variant="light" color="red">
										Issues: {stats.invalid}
									</Badge>
								</Group>
							</Group>

							<Table
								rows={rows}
								cols={colDefs}
								enableSelection={false}
								autoHeight
								height={300}
								spacing={12}
								loading={false}
							/>
						</Card>
					)}

					<Group justify="flex-end">
						<StyledButton
							variant="default"
							onClick={() => setOpened(false)}
						>
							Close
						</StyledButton>
						<Button
							onClick={handleSave}
							loading={saving}
							disabled={rows.length === 0 || stats.valid === 0}
						>
							Save {stats.valid} user
							{stats.valid === 1 ? "" : "s"}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
