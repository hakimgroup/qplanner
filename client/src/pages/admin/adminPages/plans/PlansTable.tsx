import Table, { TableHandle } from "@/components/table/Table";
import { PlanRow } from "@/models/selection.models";
import {
  activityColors,
  sourceColors,
  statusColors,
} from "@/shared/shared.const";
import { formatAvailabilityForUI } from "@/shared/shared.utilities";
import {
  ActionIcon,
  Badge,
  Flex,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconAsset, IconEye } from "@tabler/icons-react";
import { ColDef } from "ag-grid-community";
import { format } from "date-fns";
import { isEmpty, startCase, upperFirst } from "lodash";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import PlansActions from "./PlansActions";
import AdminRequestAssetsButton from "@/components/assets/AdminRequestAssetsButton";

interface Props {
  loading: boolean;
  data: PlanRow[];
  setSelectedRowIds: (ids: string[]) => void;
}

// Re-export a handle so parent can call exportCsv()
export type PlansTableHandle = TableHandle;

const PlansTable = forwardRef<PlansTableHandle, Props>(
  ({ loading, data, setSelectedRowIds }, ref) => {
    const T = useMantineTheme().colors;
    const tableRef = useRef<TableHandle>(null);
    const [row, setRow] = useState<PlanRow>(null);

    // 🔁 Forward the inner table's methods (like exportCsv) to the parent
    useImperativeHandle(ref, () => ({
      exportCsv: (overrides) => tableRef.current?.exportCsv(overrides),
      clearSelection: () => tableRef.current?.clearSelection(),
    }));

    const colDefs: ColDef[] = [
      {
        field: "practice",
        headerName: "Practice",
        flex: 1.2, // grows on wide screens
        minWidth: 200, // but never collapse below this
        cellRenderer: ({ value }) => (
          <Text size="sm" c="gray.9" title={value ?? ""}>
            {value}
          </Text>
        ),
      },

      {
        field: "campaign",
        headerName: "Campaign",
        flex: 2, // primary text column can grow
        minWidth: 260,
        cellRenderer: ({ value }) => (
          <Text size="sm" c="gray.9" title={value ?? ""} lineClamp={1}>
            {value}
          </Text>
        ),
      },

      {
        field: "category",
        headerName: "Activity",
        width: 160,
        minWidth: 140,
        sortable: false,
        cellRenderer: ({ value }) => (
          <Badge
            variant="light"
            color={activityColors[value]}
            size="sm"
            fw={700}
            style={{ border: `1px solid ${T.blue[0]}` }}
          >
            {startCase(value)}
          </Badge>
        ),
      },

      {
        field: "source",
        headerName: "Source",
        width: 130,
        minWidth: 120,
        sortable: false,
        cellRenderer: ({ value }) => (
          <Badge
            variant="light"
            color={sourceColors[value]}
            size="sm"
            fw={700}
            style={{ border: `1px solid ${T.blue[0]}` }}
          >
            {upperFirst(value)}
          </Badge>
        ),
      },

      {
        field: "status",
        headerName: "Status",
        width: 160,
        minWidth: 140,
        sortable: false,
        cellRenderer: ({ value }) => (
          <Badge
            variant="light"
            color={statusColors[value]}
            size="sm"
            fw={700}
            style={{ border: `1px solid ${T.blue[0]}` }}
          >
            {startCase(value)}
          </Badge>
        ),
      },

      // keep raw dates hidden (useful if you filter later)
      { field: "from", headerName: "From", hide: true },
      { field: "end", headerName: "To", hide: true },

      {
        field: "av",
        headerName: "Dates",
        width: 200,
        minWidth: 180,
        sortable: false,
        filter: false,
        valueGetter: (p) => {
          const from = p?.data?.from ?? null;
          const to = p?.data?.end ?? null;

          if (p?.data?.category === "Event") {
            return from ? format(new Date(from), "MMMM dd, yyyy") : "—";
          }
          return formatAvailabilityForUI({
            from: from ? new Date(from) : null,
            to: to ? new Date(to) : null,
          });
        },
        cellRenderer: ({ value }) => (
          <Text size="xs" c="gray.9" fw={500} title={value ?? ""}>
            {value ?? "—"}
          </Text>
        ),
      },

      {
        field: "updated_at",
        headerName: "Last Updated",
        width: 150,
        minWidth: 140,
        sortable: false,
        filter: false,
        valueFormatter: (p) =>
          p.value ? format(new Date(p.value), "MMM dd, yyyy") : "—",
        cellRenderer: ({ value }) => (
          <Text size="xs" c="gray.9" fw={500}>
            {" "}
            {format(value, "MMM dd, yyyy")}{" "}
          </Text>
        ),
      },

      {
        field: "actions",
        headerName: "Actions",
        pinned: "right",
        lockPinned: true,
        width: 120,
        minWidth: 110,
        sortable: false,
        filter: false,
        cellRenderer: (p) => (
          <Stack align="flex-end" gap={6}>
            <Flex>
              <AdminRequestAssetsButton
                selection={{
                  id: p.data.id,
                  name: p.data.campaign,
                  isBespoke: !isEmpty(p.data.bespoke_id),
                  bespoke_campaign_id: p.data.bespoke_id,
                  assets: p.data.assets, // Assets object
                  from_date: p.data.from,
                  to_date: p.data.end,
                  category: p.data.category,
                }}
              />

              <ActionIcon
                variant="subtle"
                size="xl"
                radius={10}
                color="violet.9"
                onClick={() => setRow(p.data)}
                aria-label="View"
              >
                <IconEye size={24} />
              </ActionIcon>
            </Flex>

            <PlansActions
              opened={row?.id === p.data.id}
              row={row}
              closePanel={() => setRow(null)}
            />
          </Stack>
        ),
      },
    ];

    return (
      <Table
        ref={tableRef}
        loading={loading}
        rows={data && data.length ? data : []}
        cols={colDefs}
        enableSelection={true}
        height={550}
        onSelect={(r) => {
          setSelectedRowIds(r.map((cp) => cp.id));
        }}
      />
    );
  }
);

export default PlansTable;
