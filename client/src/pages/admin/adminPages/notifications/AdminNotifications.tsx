import { useState, useMemo, useRef } from "react";
import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Grid,
  TextInput,
  Select,
  Button,
  useMantineTheme,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { usePractice } from "@/shared/PracticeProvider";
import { status as typeOptions, categories } from "@/filters.json";
import AdminNotificationsTable, {
  NotificationRow,
} from "./AdminNotificationsTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { DatabaseTables } from "@/shared/shared.models";

const AdminNotifications = () => {
  const T = useMantineTheme().colors;
  const { practices } = usePractice();

  // ---- local filter state
  const [query, setQuery] = useState<string>("");
  const [filters, setFilters] = useState<{
    practice: string | null;
    type: string | null; // map to "to_status"
    category: string | null; // (kept for UI parity; not server-filtered here)
  }>({
    practice: "all",
    type: "all",
    category: "all",
  });

  const handleChange = (
    key: "practice" | "type" | "category",
    value: string | null
  ) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const clearFilters = () =>
    setFilters({
      practice: "all",
      type: "all",
      category: "all",
    });

  // ---- options
  const practiceOptions = useMemo(
    () => [
      { label: "All Practices", value: "all" },
      ...(practices ?? []).map((p: any) => ({ label: p.name, value: p.id })),
    ],
    [practices]
  );

  const categoryOptions = [{ label: "All Activities", value: "all" }].concat(
    categories.map((ct: string) => ({ label: ct, value: ct }))
  );

  // ---- fetch selection_status_history
  const { data, isLoading, isError } = useQuery({
    queryKey: [DatabaseTables.CommunicationLogs],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(DatabaseTables.CommunicationLogs)
        .select()
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  // ---- client filtering + mapping to table rows
  const rows: NotificationRow[] = useMemo(() => {
    const list = (data ?? []) as any[];

    // map history row => NotificationRow the table expects
    const mapped: NotificationRow[] = list.map((r) => ({
      id: r.id,
      type: r.to_status ?? null, // use new status as the "type" label chip
      practice_id: r.practice?.id ?? null,
      practice_name: r.practice?.name ?? null,
      selection_id: r.selection_id ?? null,
      campaign_id: null, // not part of history row
      title: r.to_status ? r.to_status : "Status change",
      message: r.message ?? null,
      payload: null, // not used in history table version
      created_at: r.created_at ?? null,
      read_at: null, // history rows don’t track read state
      // extra fields used by the table:
      from_status: r.from_status ?? null,
      to_status: r.to_status ?? null,
      recipients: Array.isArray(r.recipient) ? r.recipient : [],
      note: r.note ?? null,
    }));

    // filters
    const practiceId =
      !filters.practice || filters.practice === "all" ? null : filters.practice;

    const toStatus =
      !filters.type || filters.type === "all" ? null : filters.type;

    const q = query.trim().toLowerCase();

    return mapped.filter((row) => {
      if (practiceId && row.practice_id !== practiceId) return false;
      if (toStatus && (row.to_status ?? "").toLowerCase() !== toStatus) {
        return false;
      }
      // category control is retained for UI parity but not applied (no category in history)

      if (q) {
        const hay = [
          row.practice_name ?? "",
          row.message ?? "",
          row.title ?? "",
          row.to_status ?? "",
          row.from_status ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, filters.practice, filters.type, query]);

  return (
    <Stack gap={25}>
      <Stack gap={0}>
        <Title order={1}>Notifications</Title>
        <Text c="gray.6">
          Log of outbound emails and in-app notices with resend capability
        </Text>
      </Stack>

      {/* Table Filters */}
      <Card
        p={25}
        radius={10}
        style={{ border: `1px solid ${T.blue[0]}` }}
        shadow="xs"
      >
        <Stack gap={10}>
          <Group align="center" justify="space-between" mb="xs">
            <Title order={4}>Filters & Search</Title>
            <Button variant="subtle" size="xs" onClick={clearFilters}>
              Clear filters
            </Button>
          </Group>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                radius={10}
                size="sm"
                fz="sm"
                placeholder="Search by message, status, or practice..."
                leftSection={<IconSearch size={18} />}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
            </Grid.Col>

            {/* Practice */}
            <Grid.Col span={2}>
              <Select
                radius={10}
                data={practiceOptions}
                searchable
                nothingFoundMessage="No practices found"
                value={filters.practice ?? "all"}
                onChange={(v) => handleChange("practice", v)}
                comboboxProps={{ width: 300, position: "bottom-end" }}
              />
            </Grid.Col>

            {/* Status (maps to to_status) */}
            <Grid.Col span={2}>
              <Select
                radius={10}
                data={[{ label: "All Status", value: "all" }].concat(
                  typeOptions
                )}
                value={filters.type ?? "all"}
                onChange={(v) => handleChange("type", v)}
                comboboxProps={{ width: 150, position: "bottom-end" }}
              />
            </Grid.Col>

            {/* Category (UI only – no category in history; kept for parity) */}
            <Grid.Col span={2}>
              <Select
                radius={10}
                data={[
                  { label: "All Activities", value: "all" },
                  ...categories.map((c: string) => ({ label: c, value: c })),
                ]}
                value={filters.category ?? "all"}
                onChange={(v) => handleChange("category", v)}
                comboboxProps={{ width: 150, position: "bottom-end" }}
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
        <Stack gap={30}>
          <Title order={3}>
            Communication Log{" "}
            <Text span fz={"h3"} fw={700} c={"blue.3"}>
              ({rows.length})
            </Text>
          </Title>
          <AdminNotificationsTable
            rows={rows}
            loading={isLoading}
            onOpen={() => {
              /* open/inspect if you have a modal; history rows are already summarized */
            }}
            onResend={undefined /* history rows are not “resend”-able */}
          />
          {isError && (
            <Text c="red.6" size="sm">
              Failed to load history.
            </Text>
          )}
        </Stack>
      </Card>
    </Stack>
  );
};

export default AdminNotifications;
