import { useMemo, useState } from "react";
import {
	Alert,
	Badge,
	Button,
	Card,
	Flex,
	Group,
	Stack,
	Switch,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core";
import {
	IconMapPin,
	IconRefresh,
	IconAlertTriangle,
	IconUsers,
	IconPlugConnected,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	fetchUberallHealth,
	fetchUberallLog,
	runUberallReconcile,
} from "@/api/uberall";
import { RPCFunctions } from "@/shared/shared.models";
import UberallSyncLogTable, { UberallLogRow } from "./UberallSyncLogTable";

const Counter = ({
	label,
	value,
	color = "gray.9",
}: {
	label: string;
	value: number | string | undefined;
	color?: string;
}) => {
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

export default function UberallHealth() {
	const T = useMantineTheme().colors;
	const qc = useQueryClient();
	const [dryRun, setDryRun] = useState(true);
	const [running, setRunning] = useState(false);

	const { data: health } = useQuery({
		queryKey: [RPCFunctions.GetUberallHealth],
		queryFn: fetchUberallHealth,
	});
	const { data: log, isLoading: loadingLog } = useQuery({
		queryKey: ["uberall_sync_log"],
		queryFn: () => fetchUberallLog(200),
	});

	const users = health?.users ?? {};
	const practices = health?.practices ?? {};
	const logCounts = health?.log_counts ?? {};
	const unresolved: any[] = health?.unresolved_list ?? [];
	const rows: UberallLogRow[] = useMemo(() => log ?? [], [log]);

	const handleReconcile = async () => {
		setRunning(true);
		try {
			const r = await runUberallReconcile(dryRun);
			if (dryRun) {
				toast.success(
					`Dry run: ${r.checked} checked — ${r.wouldResolve} practices to resolve, ${r.wouldProvision} to provision, ${r.wouldResync} to re-sync, ${r.skipped} skipped.`
				);
			} else {
				toast.success(
					`Reconcile complete: ${r.resolvedPractices} practices resolved, ${r.provisioned} provisioned, ${r.resynced} re-synced, ${r.inSync} in sync, ${r.failed} failed.`
				);
			}
			qc.invalidateQueries({ queryKey: [RPCFunctions.GetUberallHealth] });
			qc.invalidateQueries({ queryKey: ["uberall_sync_log"] });
		} catch (e: any) {
			toast.error(e?.response?.data?.error || e?.message || "Reconcile failed.");
		} finally {
			setRunning(false);
		}
	};

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Group gap={10} align="center">
					<IconMapPin size={28} color={T.violet[6]} />
					<Title order={1}>Uberall Health</Title>
					<Badge color="violet" variant="light" size="lg">
						Super Admin
					</Badge>
				</Group>
				<Text c="gray.6">
					Provisioning and access-sync status for the Uberall integration. The
					reconcile is the safety net that guarantees removals land and retries
					failed syncs.
				</Text>
			</Stack>

			{/* Users */}
			<Stack gap={8}>
				<Group gap={8}>
					<IconUsers size={16} color={T.gray[6]} />
					<Title order={4}>Users</Title>
				</Group>
				<Flex gap={10} wrap="wrap">
					<Counter label="Total" value={users.total} color="gray.9" />
					<Counter label="Linked" value={users.linked} color="teal.6" />
					<Counter label="Created" value={users.created} color="blue.5" />
					<Counter label="Adopted" value={users.adopted} color="grape.6" />
					<Counter label="Failed" value={users.failed} color="red.6" />
					<Counter label="Unprovisioned" value={users.unprovisioned} color="orange.6" />
				</Flex>
			</Stack>

			{/* Practices & sync activity */}
			<Stack gap={8}>
				<Group gap={8}>
					<IconPlugConnected size={16} color={T.gray[6]} />
					<Title order={4}>Practices &amp; sync activity (30d)</Title>
				</Group>
				<Flex gap={10} wrap="wrap">
					<Counter label="Location resolved" value={practices.resolved} color="teal.6" />
					<Counter label="Unresolved" value={practices.unresolved} color="orange.6" />
					<Counter label="Synced" value={logCounts.synced} color="teal.6" />
					<Counter label="Skipped" value={logCounts.skipped} color="gray.7" />
					<Counter label="Failed" value={logCounts.failed} color="red.6" />
					<Counter label="With ID" value={practices.with_business_id} color="blue.5" />
				</Flex>
			</Stack>

			{/* Reconcile control */}
			<Card p={25} radius={10} shadow="xs" style={{ border: `1px solid ${T.violet[1]}` }}>
				<Group justify="space-between" wrap="wrap" gap="md">
					<Group gap="md">
						<Switch
							checked={dryRun}
							onChange={(e) => setDryRun(e.currentTarget.checked)}
							label="Dry run (report only)"
							color="violet"
						/>
						<Text size="xs" c="gray.6" maw={360}>
							{dryRun
								? "Reports what would change without touching Uberall."
								: "Will apply changes to Uberall — provisions, re-scopes, retries."}
						</Text>
					</Group>
					<Button
						color="violet"
						radius={10}
						loading={running}
						leftSection={<IconRefresh size={16} />}
						onClick={handleReconcile}
					>
						{dryRun ? "Run dry reconcile" : "Run reconcile"}
					</Button>
				</Group>
			</Card>

			{/* Unresolved practices */}
			{unresolved.length > 0 && (
				<Alert
					icon={<IconAlertTriangle size={18} />}
					color="orange.5"
					radius={10}
					variant="light"
					title={`${unresolved.length} practice${
						unresolved.length === 1 ? "" : "s"
					} with an unresolvable Uberall identifier`}
				>
					<Stack gap={8}>
						<Text size="sm" c="gray.7">
							Their stored value doesn't match any Uberall Location. Members won't
							get these locations until the value is corrected in the practice.
						</Text>
						<Stack gap={4} style={{ maxHeight: 200, overflowY: "auto" }}>
							{unresolved.map((p) => (
								<Group key={p.id} justify="space-between" wrap="nowrap">
									<Text size="xs" lineClamp={1} title={p.name}>
										{p.name}
									</Text>
									<Badge color="orange" variant="light" size="sm">
										{p.value}
									</Badge>
								</Group>
							))}
						</Stack>
					</Stack>
				</Alert>
			)}

			{/* Recent activity */}
			<Card p={25} radius={10} shadow="xs" style={{ border: `1px solid ${T.blue[0]}` }}>
				<Stack gap={20}>
					<Title order={3}>
						<Group gap={8} align="center">
							<IconPlugConnected size={22} color={T.violet[6]} />
							Recent Activity
							<Badge variant="light" color="blue.3" size="lg">
								{rows.length}
							</Badge>
						</Group>
					</Title>
					<UberallSyncLogTable rows={rows} loading={loadingLog} />
				</Stack>
			</Card>
		</Stack>
	);
}
