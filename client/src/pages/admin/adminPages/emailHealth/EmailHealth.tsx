import {
	Alert,
	Badge,
	Button,
	Card,
	Flex,
	Grid,
	Group,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
	useMantineTheme,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconMail,
	IconRefresh,
	IconSearch,
} from "@tabler/icons-react";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import api from "@/api/express";
import { toast } from "sonner";
import EmailHealthTable, {
	EmailAttemptRow,
	EmailHealthTableHandle,
} from "./EmailHealthTable";
import EmailDetailDrawer from "./EmailDetailDrawer";
import {
	useScopedPractices,
	usePracticesOfInterest,
} from "@/shared/PracticesOfInterestProvider";
import PoiEmptyState from "@/shared/PoiEmptyState";

type WindowKey = "24h" | "7d" | "30d";

const WINDOW_HOURS: Record<WindowKey, number> = {
	"24h": 24,
	"7d": 24 * 7,
	"30d": 24 * 30,
};

const STATUS_OPTIONS = [
	{ label: "All Status", value: "all" },
	{ label: "Attempted", value: "attempted" },
	{ label: "Dispatched", value: "dispatched" },
	{ label: "Sent", value: "sent" },
	{ label: "Failed", value: "failed" },
	{ label: "Bounced", value: "bounced" },
	{ label: "Complaint", value: "complaint" },
];

const SOURCE_OPTIONS = [
	{ label: "All Sources", value: "all" },
	{ label: "Client", value: "client" },
	{ label: "Server", value: "server" },
	{ label: "pg_net trigger", value: "pg_net" },
	{ label: "God Mode", value: "god_mode" },
	{ label: "Cron", value: "cron" },
];

const STUCK_GRACE_MS = 5 * 60 * 1000;

export default function EmailHealth() {
	const T = useMantineTheme().colors;
	const qc = useQueryClient();
	const tableRef = useRef<EmailHealthTableHandle>(null);

	const [windowKey, setWindowKey] = useState<WindowKey>("24h");
	const [query, setQuery] = useState<string>("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sourceFilter, setSourceFilter] = useState<string>("all");
	const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
	const { isPoiActive, isPoiEmpty } = useScopedPractices();
	const { poiPracticeIdSet } = usePracticesOfInterest();

	const since = useMemo(
		() =>
			new Date(
				Date.now() - WINDOW_HOURS[windowKey] * 60 * 60 * 1000
			).toISOString(),
		[windowKey]
	);

	const clearFilters = () => {
		setQuery("");
		setStatusFilter("all");
		setSourceFilter("all");
	};

	// Counters (group by status across the window)
	const { data: counters } = useQuery({
		queryKey: ["email_health_counts", windowKey],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("notification_emails_log")
				.select("status")
				.gte("created_at", since);
			if (error) throw error;
			const tally: Record<string, number> = { total: 0 };
			for (const row of data ?? []) {
				const s = (row as any).status as string;
				tally[s] = (tally[s] ?? 0) + 1;
				tally.total += 1;
			}
			return tally;
		},
	});

	// Raw rows for the window, then client-side filter
	const { data: rawRows, isLoading } = useQuery<EmailAttemptRow[]>({
		queryKey: ["email_health_rows", windowKey],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("notification_emails_log")
				.select(
					"id, notification_id, email_type, subject, recipient_email, status, attempt_source, attempted_at, sent_at, created_at, error_message, practice_id, practice_name, campaign_name, resend_message_id"
				)
				.gte("created_at", since)
				.order("created_at", { ascending: false })
				.limit(1000);
			if (error) throw error;
			return (data ?? []) as EmailAttemptRow[];
		},
	});

	const rows = useMemo(() => {
		const list = rawRows ?? [];
		const q = query.trim().toLowerCase();
		return list.filter((r) => {
			if (statusFilter !== "all" && r.status !== statusFilter) return false;
			if (
				sourceFilter !== "all" &&
				(r.attempt_source ?? "") !== sourceFilter
			)
				return false;
			// Hard-scope to POI when active
			if (
				isPoiActive &&
				r.practice_id &&
				!poiPracticeIdSet.has(r.practice_id)
			)
				return false;
			if (q) {
				const hay = [
					r.recipient_email ?? "",
					r.subject ?? "",
					r.practice_name ?? "",
					r.campaign_name ?? "",
					r.email_type ?? "",
					r.error_message ?? "",
					r.resend_message_id ?? "",
				]
					.join(" ")
					.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			return true;
		});
	}, [rawRows, query, statusFilter, sourceFilter, isPoiActive, poiPracticeIdSet]);

	// Stuck attempts derived from the same dataset
	const stuckCount = useMemo(() => {
		const cutoff = Date.now() - STUCK_GRACE_MS;
		return (rawRows ?? []).filter(
			(r) =>
				r.status === "attempted" &&
				r.attempted_at &&
				new Date(r.attempted_at).getTime() < cutoff
		).length;
	}, [rawRows]);

	const showStuckOnly = () => {
		setStatusFilter("attempted");
		setSourceFilter("all");
		setQuery("");
	};

	const { mutate: reconcile, isPending: reconciling } = useMutation({
		mutationFn: async () => {
			const { data } = await api.post("/reconcile-resend-emails", {
				hoursBack: WINDOW_HOURS[windowKey],
			});
			return data;
		},
		onSuccess: (data: any) => {
			const updated = data?.updated ?? 0;
			const errors = (data?.errors ?? []).length;
			const stuck = (data?.stuck_attempts ?? []).length;
			toast.success(
				`Reconciled — ${updated} updated, ${stuck} stuck, ${errors} errors`
			);
			qc.invalidateQueries({ queryKey: ["email_health_counts"] });
			qc.invalidateQueries({ queryKey: ["email_health_rows"] });
		},
		onError: (e: any) => toast.error(e?.message ?? "Reconcile failed"),
	});

	const Counter = ({
		label,
		value,
		color = "gray.9",
	}: {
		label: string;
		value: number | undefined;
		color?: string;
	}) => {
		// Derive a very subtle background + border from the accent color
		// (e.g. "teal.6" → bg "teal.0", border "teal.1").
		const family = color.split(".")[0];
		return (
			<Card
				p="md"
				radius={10}
				bg={`${family}.0`}
				style={{
					border: `1px solid var(--mantine-color-${family}-1)`,
					flex: 1,
					minWidth: 130,
				}}
				shadow="xs"
			>
				<Stack gap={2}>
					<Text size="xs" c="gray.6" fw={600} tt="uppercase">
						{label}
					</Text>
					<Text size="xl" fw={800} c={color}>
						{value ?? "—"}
					</Text>
				</Stack>
			</Card>
		);
	};

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Title order={1}>Email Health</Title>
				<Text c="gray.6">
					End-to-end log of every email attempt, with Resend reconciliation
				</Text>
			</Stack>

			{isPoiEmpty && <PoiEmptyState />}

			{/* Counters */}
			<Flex gap={10} wrap="wrap">
				<Counter label="Total" value={counters?.total} color="gray.9" />
				<Counter label="Attempted" value={counters?.attempted} color="gray.7" />
				<Counter
					label="Dispatched"
					value={counters?.dispatched}
					color="blue.5"
				/>
				<Counter label="Sent" value={counters?.sent} color="teal.6" />
				<Counter label="Failed" value={counters?.failed} color="red.6" />
				<Counter label="Bounced" value={counters?.bounced} color="orange.6" />
				<Counter
					label="Complaint"
					value={counters?.complaint}
					color="grape.6"
				/>
			</Flex>

			{/* Stuck attempts alert */}
			{stuckCount > 0 && (
				<Alert
					icon={<IconAlertTriangle size={18} />}
					color="red.5"
					radius={10}
					variant="light"
					title={`${stuckCount} stuck attempt${stuckCount === 1 ? "" : "s"}`}
				>
					<Group gap={8} align="center">
						<Text size="sm" c="gray.7">
							These rows are stuck on{" "}
							<Text span fw={700}>
								status=attempted
							</Text>{" "}
							with no response after 5 minutes — the server likely didn't
							respond.
						</Text>
						<Button
							size="xs"
							radius={10}
							variant="subtle"
							color="red.5"
							onClick={showStuckOnly}
						>
							Filter to stuck
						</Button>
					</Group>
				</Alert>
			)}

			{/* Filters */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={10}>
					<Group align="center" justify="space-between" mb="xs">
						<Title order={4}>Filters & Search</Title>
						<Group gap={6}>
							<SegmentedControl
								size="xs"
								value={windowKey}
								onChange={(v) => setWindowKey(v as WindowKey)}
								data={[
									{ value: "24h", label: "Last 24h" },
									{ value: "7d", label: "Last 7d" },
									{ value: "30d", label: "Last 30d" },
								]}
							/>
							<Button variant="subtle" size="xs" onClick={clearFilters}>
								Clear filters
							</Button>
						</Group>
					</Group>

					<Grid>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								radius={10}
								size="sm"
								fz="sm"
								placeholder="Search by recipient, subject, practice, campaign, error, Resend ID..."
								leftSection={<IconSearch size={18} />}
								value={query}
								onChange={(e) => setQuery(e.currentTarget.value)}
							/>
						</Grid.Col>

						<Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
							<Select
								radius={10}
								data={STATUS_OPTIONS}
								value={statusFilter}
								onChange={(v) => setStatusFilter(v ?? "all")}
								comboboxProps={{ position: "bottom-end" }}
							/>
						</Grid.Col>

						<Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
							<Select
								radius={10}
								data={SOURCE_OPTIONS}
								value={sourceFilter}
								onChange={(v) => setSourceFilter(v ?? "all")}
								comboboxProps={{ position: "bottom-end" }}
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
				<Stack gap={20}>
					<Flex justify="space-between" align="center" wrap="wrap" gap={10}>
						<Title order={3}>
							<Group gap={8} align="center">
								<IconMail size={22} color={T.blue[5]} />
								Recent Attempts
								<Badge variant="light" color="blue.3" size="lg">
									{rows.length}
								</Badge>
							</Group>
						</Title>

						<Button
							leftSection={<IconRefresh size={14} />}
							loading={reconciling}
							onClick={() => reconcile()}
							radius={10}
							color="blue.3"
						>
							Reconcile with Resend
						</Button>
					</Flex>

					<EmailHealthTable
						ref={tableRef}
						rows={rows}
						loading={isLoading}
						onRowClick={(row) => setSelectedLogId(row.id)}
					/>
				</Stack>
			</Card>

			<EmailDetailDrawer
				logId={selectedLogId}
				opened={Boolean(selectedLogId)}
				onClose={() => setSelectedLogId(null)}
			/>
		</Stack>
	);
}
