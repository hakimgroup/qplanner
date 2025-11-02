import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
} from "react";
import { ColDef } from "ag-grid-community";
import Table, { TableHandle } from "@/components/table/Table";
import {
  ActionIcon,
  Badge,
  Group,
  Stack,
  Text,
  useMantineTheme,
  Modal,
  Avatar,
  ScrollArea,
  Flex,
  Divider,
} from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { format } from "date-fns";
import { startCase } from "lodash";
import { statusColors } from "@/shared/shared.const";

export type NotificationRow = {
  id: string;
  type: string | null; // mapped to to_status
  practice_id: string | null;
  practice_name: string | null;
  selection_id: string | null;
  campaign_id: string | null; // not used here
  title: string | null; // mapped from to_status
  message: string | null; // history.message
  payload: any | null; // not used
  created_at: string | null;
  read_at: string | null; // not used (always null)
  // extra for history rendering:
  from_status: string | null;
  to_status: string | null;
  recipients: { name?: string | null; email?: string | null }[];
  note: string | null;
};

export type AdminNotificationsTableHandle = {
  exportCsv: TableHandle["exportCsv"];
  getSelectedIds: () => string[];
};

const AdminNotificationsTable = forwardRef<
  AdminNotificationsTableHandle,
  {
    rows: NotificationRow[];
    loading?: boolean;
    onOpen: (row: NotificationRow) => void;
    onResend?: (row: NotificationRow) => void; // not used for history but kept for signature parity
    onSelectionChange?: (ids: string[]) => void;
  }
>(function AdminNotificationsTable(
  { rows, loading, onOpen, onResend, onSelectionChange },
  ref
) {
  const T = useMantineTheme().colors;
  const tableRef = useRef<TableHandle>(null);
  const selectedIdsRef = useRef<string[]>([]);
  const [recipientsModalOpen, setRecipientsModalOpen] = useState(false);
  const [recipientsModalData, setRecipientsModalData] = useState<{
    title: string;
    recipients: { name?: string | null; email?: string | null }[];
  }>({ title: "Recipients", recipients: [] });

  useImperativeHandle(ref, () => ({
    exportCsv: (opts) => tableRef.current?.exportCsv?.(opts),
    getSelectedIds: () => selectedIdsRef.current,
  }));

  const openRecipientsModal = (row: NotificationRow) => {
    const list = Array.isArray(row.recipients) ? row.recipients : [];
    setRecipientsModalData({
      title: row.practice_name
        ? `Recipients · ${row.practice_name}`
        : "Recipients",
      recipients: list,
    });
    setRecipientsModalOpen(true);
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    const source = (name ?? email ?? "").trim();
    if (!source) return "—";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const cols: ColDef[] = [
    // When
    {
      field: "created_at",
      headerName: "Sent At",
      width: 190,
      minWidth: 170,
      valueGetter: (p) => {
        const d = p.data?.created_at ? new Date(p.data.created_at) : null;
        return d ? format(d, "dd/MM/yyyy, HH:mm:ss") : "—";
      },
      cellRenderer: ({ value }) => (
        <Text size="xs" c="gray.6" fw={500} title={value ?? ""}>
          {value ?? "—"}
        </Text>
      ),
    },

    // Recipients
    {
      field: "recipients",
      headerName: "Recipients",
      width: 260,
      minWidth: 220,
      valueGetter: (p) =>
        Array.isArray(p.data?.recipients) ? p.data.recipients.length : 0,
      cellRenderer: ({ data }) => {
        const list = Array.isArray(data?.recipients) ? data.recipients : [];
        const count = list.length;
        const first = count > 0 ? list[0] : null;

        if (!first) {
          return (
            <Text size="xs" c="gray.6">
              —
            </Text>
          );
        }

        const name = (first.name ?? "").trim();
        const email = (first.email ?? "").trim();
        const label = name || email || "—";

        return (
          <Stack gap={0}>
            <Text
              size="xs"
              fw={600}
              c="gray.9"
              lineClamp={1}
              title={[label, email].filter(Boolean).join(" ")}
            >
              {label}
            </Text>
            {email && (
              <Text size="xs" c="gray.6" title={email} lineClamp={1}>
                {email}
              </Text>
            )}
            {count > 1 && (
              <Text
                size="xs"
                c="blue.3"
                fw={600}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e?.stopPropagation?.();
                  openRecipientsModal(data);
                }}
              >
                + {count - 1} more
              </Text>
            )}
          </Stack>
        );
      },
    },

    // Practice
    {
      field: "practice_name",
      headerName: "Practice",
      flex: 1.2,
      minWidth: 220,
      tooltipField: "practice_name",
      cellRenderer: ({ data }) => (
        <Stack gap={2}>
          <Text
            size="sm"
            fw={600}
            lineClamp={1}
            title={data?.practice_name ?? ""}
          >
            {data?.practice_name || "—"}
          </Text>
        </Stack>
      ),
    },

    // Change (from → to)
    {
      field: "to_status",
      headerName: "Status",
      flex: 1,
      minWidth: 180,
      cellRenderer: ({ data }) => (
        <Group gap={6}>
          <Badge variant="light" color="gray" fw={600}>
            {startCase(data?.from_status ?? "—")}
          </Badge>
          <Text size="xs" c="gray.6">
            →
          </Text>
          <Badge
            variant="light"
            color={statusColors[data?.to_status]}
            fw={700}
            style={{ border: `1px solid ${T.blue[0]}` }}
          >
            {startCase(data?.to_status ?? "—")}
          </Badge>
        </Group>
      ),
    },

    // Message (human readable)
    {
      field: "message",
      headerName: "Message",
      flex: 1.6,
      minWidth: 280,
      tooltipField: "message",
      cellRenderer: ({ value }) => (
        <Text size="sm" fw={500} c="indigo" lineClamp={2} title={value ?? ""}>
          {value ?? "—"}
        </Text>
      ),
    },

    // Actions
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      width: 120,
      minWidth: 90,
      lockPinned: true,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }) => (
        <Group gap={6}>
          <ActionIcon
            variant="subtle"
            size="lg"
            radius={10}
            color="violet.9"
            onClick={() => onOpen(data)}
            aria-label="Open"
            title="Open"
          >
            <IconEye size={18} />
          </ActionIcon>
          {/* onResend intentionally not shown for history */}
        </Group>
      ),
    },
  ];

  const modalContent = useMemo(() => {
    const list = recipientsModalData.recipients ?? [];
    if (!list.length) {
      return (
        <Text size="sm" c="gray.6">
          No recipients
        </Text>
      );
    }
    return (
      <Stack gap="xs">
        <Divider color="gray.1" />
        <ScrollArea.Autosize mah={360}>
          <Stack gap="sm">
            {list.map((r, idx) => {
              const name = (r.name ?? "").trim();
              const email = (r.email ?? "").trim();
              const initials = getInitials(name, email);
              const display = name || email || "—";
              return (
                <Group key={`${display}-${idx}`} gap="md" wrap="nowrap">
                  <Avatar radius="xl" name={initials} color="initials" />

                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Text
                      size="sm"
                      fw={600}
                      c="gray.9"
                      lineClamp={1}
                      title={display}
                    >
                      {display}
                    </Text>
                    {email && (
                      <Text size="xs" c="gray.6" lineClamp={1} title={email}>
                        {email}
                      </Text>
                    )}
                  </Stack>
                </Group>
              );
            })}
          </Stack>
        </ScrollArea.Autosize>
      </Stack>
    );
  }, [recipientsModalData]);

  return (
    <>
      <Table
        ref={tableRef}
        rows={rows}
        cols={cols}
        loading={loading}
        height={550}
        onSelect={(selectedRows) => {
          const ids = (selectedRows ?? [])
            .map((r: NotificationRow) => r?.id)
            .filter(Boolean);
          selectedIdsRef.current = ids;
          onSelectionChange?.(ids);
        }}
      />

      <Modal
        opened={recipientsModalOpen}
        onClose={() => setRecipientsModalOpen(false)}
        title={<Text fw={700}>{recipientsModalData.title}</Text>}
        radius="lg"
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
      >
        {modalContent}
      </Modal>
    </>
  );
});

export default AdminNotificationsTable;
