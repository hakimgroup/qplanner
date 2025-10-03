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
	Flex,
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
import {
	DatabaseTables,
	RPCFunctions,
	UserRoles,
} from "@/shared/shared.models";
import { userRoleColors } from "@/shared/shared.const";
import { startCase } from "lodash";
import Table from "@/components/table/Table";
import { ColDef } from "ag-grid-community";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// -------------------------------
// Types / helpers
// -------------------------------
type Role = "user" | "admin" | "super_admin";
type Row = {
	email: string;
	first_name?: string;
	last_name?: string;
	role?: Role;

	// raw strings from CSV (optional)
	practice_ids_raw?: string; // e.g. "uuid1; uuid2" or '["uuid1","uuid2"]'
	practice_names_raw?: string; // e.g. "Downtown Clinic; West End"

	// normalized arrays sent to the RPC
	practice_ids?: string[]; // optional
	practice_names?: string[]; // optional

	_row?: number;
	_error?: string | null;
};

const ALLOWED_ROLES = new Set<Role>(["user", "admin", "super_admin"]);

// Columns (order matters). Keep both *_raw columns so non-technical admins can use names.
const templateCsv = `email,first_name,last_name,role,practice_names
john.manager@company.com,John,Manager,admin,"Downtown Clinic; West End Practice"
viewer@company.com,View,Only,user,
`;

const parseList = (v?: string): string[] | undefined => {
	const raw = (v ?? "").trim();
	if (!raw) return undefined;

	// JSON array?
	if (raw.startsWith("[") && raw.endsWith("]")) {
		try {
			const arr = JSON.parse(raw);
			if (Array.isArray(arr)) {
				return arr.map((x) => String(x).trim()).filter(Boolean);
			}
		} catch {
			// fall through to split
		}
	}

	// Semicolon or comma separated
	return raw
		.split(/[;,]/g)
		.map((s) => s.trim())
		.filter(Boolean);
};

function normalizeRow(r: any, idx: number): Row {
	const email = String(r.email ?? "")
		.trim()
		.toLowerCase();
	const first_name = (r.first_name ?? "").toString().trim();
	const last_name = (r.last_name ?? "").toString().trim();
	const roleRaw = (r.role ?? "user").toString().trim().toLowerCase();
	const role = (
		ALLOWED_ROLES.has(roleRaw as Role) ? roleRaw : "user"
	) as Role;

	const practice_ids_raw = (r.practice_ids ?? "").toString();
	const practice_names_raw = (r.practice_names ?? "").toString();

	const practice_ids = parseList(practice_ids_raw);
	const practice_names = parseList(practice_names_raw);

	let _error: string | null = null;
	if (!email) _error = "Missing email";
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		_error = "Invalid email";
	else if (r.role && !ALLOWED_ROLES.has(role)) _error = "Invalid role";

	return {
		email,
		first_name,
		last_name,
		role,
		practice_ids_raw,
		practice_names_raw,
		practice_ids,
		practice_names,
		_row: idx + 1,
		_error,
	};
}

// -------------------------------
// Component
// -------------------------------
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
		a.download = "allowed_users_with_practices_template.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleSave = async () => {
		const valid = rows.filter((r) => !r._error);
		if (valid.length === 0) return;

		setSaving(true);
		try {
			// RPC expects an array of rows with (email, first_name, last_name, role, practice_ids[], practice_names[])
			const payload = valid.map(
				({
					email,
					first_name,
					last_name,
					role,
					practice_ids,
					practice_names,
				}) => ({
					email,
					first_name: first_name || null,
					last_name: last_name || null,
					role: role || "user",
					practice_ids: practice_ids ?? null,
					practice_names: practice_names ?? null,
				})
			);

			const { data, error } = await supabase.rpc(
				RPCFunctions.BulkUploadUsers,
				{
					p_rows: payload,
				}
			);

			if (error) throw error;

			// Optional: surface summary returned by RPC (if you implemented counts)
			if (data?.summary) {
				toast.success(
					`Uploaded: ${data.summary.users_added} added, ${data.summary.users_updated} updated. Memberships: ${data.summary.memberships_added} added, ${data.summary.memberships_skipped} skipped.`
				);
			} else {
				toast.success("Users uploaded successfully.");
			}

			handleClear();
			setOpened(false);

			// Invalidate any queries that list allowed users
			qc.invalidateQueries({ queryKey: [DatabaseTables.Allowed_Users] });
		} catch (e: any) {
			setParsingErr(e?.message ?? "Failed to save users");
		} finally {
			setSaving(false);
		}
	};

	// Preview table columns (AG Grid)
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
				field: "practice_names_raw",
				headerName: "Practice Names",
				flex: 1.4,
				minWidth: 220,
				cellRenderer: ({ value }: any) => (
					<Text size="sm" c="gray.7" fw={500}>
						{value}
					</Text>
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
				size="70rem"
				radius="md"
				overlayProps={{ backgroundOpacity: 0.6, blur: 3 }}
			>
				<Stack gap="md">
					<Alert
						color="gray"
						styles={{ root: { alignItems: "start" } }}
					>
						<Text size="sm" c="gray.8" fw={600}>
							CSV Columns (header row required)
						</Text>
						<Text size="sm" c="gray.7">
							<b>email</b>, <b>first_name</b>, <b>last_name</b>,{" "}
							<b>role</b>, <b>practice_names</b>
						</Text>
						<Text size="sm" c="gray.7" mt={6}>
							• <b>role</b>:{" "}
							{["user", "admin", "super_admin"].join(", ")}{" "}
							(defaults to <i>user</i>)
						</Text>
						<Text size="sm" c="gray.7">
							• <b>practice_names</b>: either a JSON array (e.g.{" "}
							<code>["Practice 1","Practice 2"]</code>) or a
							semicolon/comma list (e.g.{" "}
							<code>Practice 1; Practice 2</code>)
						</Text>
						<Text size="sm" c="gray.7">
							• <b>practice_names</b> is optional if you don't
							want to assign any practice.
						</Text>
					</Alert>

					<Flex justify="space-between" align="center">
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
					</Flex>

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
								height={360}
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
