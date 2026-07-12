import {
	Badge,
	Button,
	Card,
	Flex,
	Group,
	SegmentedControl,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { IconBug, IconPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useBugReports } from "@/hooks/bugReport.hooks";
import { BugReport, BugStatus } from "@/models/bug.models";
import BugReportsTable from "./BugReportsTable";
import BugReportFormModal from "./BugReportFormModal";
import BugReportDetailDrawer from "./BugReportDetailDrawer";

type Filter = BugStatus | "all";

export default function BugReports() {
	const T = useMantineTheme().colors;
	const [filter, setFilter] = useState<Filter>("open");
	const [formOpen, setFormOpen] = useState(false);
	const [selected, setSelected] = useState<BugReport | null>(null);

	const { data: bugs = [], isLoading } = useBugReports(filter);

	// Counters use an unfiltered fetch so the tiles are stable across filters.
	const { data: allBugs = [] } = useBugReports("all");
	const counts = useMemo(() => {
		const open = allBugs.filter((b) => b.status === "open").length;
		return { total: allBugs.length, open, closed: allBugs.length - open };
	}, [allBugs]);

	return (
		<Stack gap={25}>
			{/* Header */}
			<Stack gap={0}>
				<Title order={1}>Bug Reports</Title>
				<Text c="gray.6">
					File bugs with screenshots, recordings, or logs — tracked here until
					closed
				</Text>
			</Stack>

			{/* Counters */}
			<Flex gap={10} wrap="wrap">
				<Counter label="Total" value={counts.total} color="gray.9" />
				<Counter label="Open" value={counts.open} color="green.7" />
				<Counter label="Closed" value={counts.closed} color="gray.6" />
			</Flex>

			{/* Tickets */}
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
								<IconBug size={22} color={T.red[5]} />
								Tickets
								<Badge variant="light" color="blue.3" size="lg">
									{bugs.length}
								</Badge>
							</Group>
						</Title>

						<Group wrap="wrap" gap="xs">
							<SegmentedControl
								size="xs"
								value={filter}
								onChange={(v) => setFilter(v as Filter)}
								data={[
									{ value: "open", label: "Open" },
									{ value: "closed", label: "Closed" },
									{ value: "all", label: "All" },
								]}
							/>
							<Button
								color="red"
								radius={10}
								leftSection={<IconPlus size={14} />}
								onClick={() => setFormOpen(true)}
							>
								Report a Bug
							</Button>
						</Group>
					</Flex>

					<BugReportsTable
						loading={isLoading}
						rows={bugs}
						onRowClick={setSelected}
					/>
				</Stack>
			</Card>

			<BugReportFormModal
				opened={formOpen}
				onClose={() => setFormOpen(false)}
			/>
			<BugReportDetailDrawer
				bug={selected}
				opened={!!selected}
				onClose={() => setSelected(null)}
			/>
		</Stack>
	);
}

/** Matches the counter-card style used across the admin pages (e.g. Email Health). */
function Counter({
	label,
	value,
	color = "gray.9",
}: {
	label: string;
	value: number | undefined;
	color?: string;
}) {
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
}
