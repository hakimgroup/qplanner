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
import { DatabaseTables } from "@/shared/shared.models";
import Table from "@/components/table/Table";
import { ColDef } from "ag-grid-community";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Row = {
	name: string;
	address?: string;
	post_code?: string;
	country?: string;
	phone?: string;
	email?: string;
	website?: string;
	buddy?: string;
	uberall_business_id?: string;
	_row: number;
	_error: string | null;
};

const templateCsv = `name,address,post_code,country,phone,email,website,buddy,uberall_business_id
Hakim Optical London,"123 High Street, London",SW1A 1AA,England,020 7946 0958,london@hakimgroup.co.uk,www.hakimgroup.co.uk,John Smith,12345678
Hakim Optical Manchester,"456 Market Street, Manchester",M1 1AA,England,0161 234 5678,manchester@hakimgroup.co.uk,,Jane Doe,
`;

function normalizeRow(r: any, idx: number): Row {
	const name = (r.name ?? "").toString().trim();

	let _error: string | null = null;
	if (!name) _error = "Missing name";

	const email = (r.email ?? "").toString().trim();
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		_error = _error ?? "Invalid email";
	}

	return {
		name,
		address: (r.address ?? "").toString().trim() || undefined,
		post_code: (r.post_code ?? "").toString().trim() || undefined,
		country: (r.country ?? "").toString().trim() || undefined,
		phone: (r.phone ?? "").toString().trim() || undefined,
		email: email || undefined,
		website: (r.website ?? "").toString().trim() || undefined,
		buddy: (r.buddy ?? "").toString().trim() || undefined,
		uberall_business_id:
			(r.uberall_business_id ?? "").toString().trim() || undefined,
		_row: idx + 1,
		_error,
	};
}

export default function PracticesCsvUploader() {
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
					const normalized = parsed.map((r, i) =>
						normalizeRow(r, i)
					);
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
		a.download = "practices_upload_template.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleSave = async () => {
		const valid = rows.filter((r) => !r._error);
		if (valid.length === 0) return;

		setSaving(true);
		try {
			const payload = valid.map(
				({
					name,
					address,
					post_code,
					country,
					phone,
					email,
					website,
					buddy,
					uberall_business_id,
				}) => ({
					name,
					address: address || null,
					post_code: post_code || null,
					country: country || null,
					phone: phone || null,
					email: email || null,
					website: website || null,
					buddy: buddy || null,
					uberall_business_id: uberall_business_id || null,
				})
			);

			const { error } = await supabase
				.from(DatabaseTables.Practices)
				.insert(payload);

			if (error) throw error;

			toast.success(
				`Successfully added ${valid.length} practice${valid.length === 1 ? "" : "s"}.`
			);

			handleClear();
			setOpened(false);
			qc.invalidateQueries({ queryKey: ["practices_admin"] });
		} catch (e: any) {
			setParsingErr(e?.message ?? "Failed to save practices");
		} finally {
			setSaving(false);
		}
	};

	const colDefs: ColDef[] = useMemo(
		() => [
			{
				field: "name",
				headerName: "Name",
				flex: 1.2,
				minWidth: 180,
			},
			{
				field: "address",
				headerName: "Address",
				flex: 1.4,
				minWidth: 200,
			},
			{
				field: "post_code",
				headerName: "Post Code",
				width: 110,
			},
			{
				field: "country",
				headerName: "Country",
				width: 120,
			},
			{
				field: "phone",
				headerName: "Phone",
				width: 140,
			},
			{
				field: "email",
				headerName: "Email",
				flex: 1,
				minWidth: 180,
			},
			{
				field: "buddy",
				headerName: "Buddy",
				width: 130,
			},
			{
				field: "uberall_business_id",
				headerName: "Uberall ID",
				width: 120,
			},
			{
				field: "_error",
				headerName: "Issue",
				width: 140,
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
				<Button
					leftSection={<IconCloudUpload size={14} />}
					onClick={() => setOpened(true)}
					variant="light"
				>
					Upload Practices (CSV)
				</Button>
				<Button
					variant="subtle"
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
					<Text fz="h4" fw={700}>
						Bulk Upload — Practices
					</Text>
				}
				size="75rem"
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
							<b>name</b> (required), <b>address</b>,{" "}
							<b>post_code</b>, <b>country</b>, <b>phone</b>,{" "}
							<b>email</b>, <b>website</b>, <b>buddy</b>,{" "}
							<b>uberall_business_id</b>
						</Text>
						<Text size="sm" c="gray.7" mt={6}>
							Only <b>name</b> is required. All other columns are
							optional and can be left blank.
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
						<Button
							variant="default"
							onClick={() => setOpened(false)}
						>
							Close
						</Button>
						<Button
							onClick={handleSave}
							loading={saving}
							disabled={rows.length === 0 || stats.valid === 0}
						>
							Save {stats.valid} practice
							{stats.valid === 1 ? "" : "s"}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
