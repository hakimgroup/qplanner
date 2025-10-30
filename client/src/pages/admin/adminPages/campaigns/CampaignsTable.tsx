import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { ColDef } from "ag-grid-community";
import Table, { TableHandle } from "@/components/table/Table";
import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import TierCell from "./TierCell";
import { activityColors } from "@/shared/shared.const";
import { BadgeList } from "@/components/badgeList/BadgeList";
import { formatAvailabilityForUI } from "@/shared/shared.utilities";
import { IconEdit } from "@tabler/icons-react";
import { isEmpty, startCase } from "lodash";
import AdminRequestAssetsButton from "@/components/assets/AdminRequestAssetsButton";

export type CampaignRow = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tiers?: string[] | null;
  status?: string | null;
  availability?: { from?: string | null; to?: string | null } | null;
  objectives?: string[];
  topics?: string[];
  updated_at?: string;
};

export type CampaignsTableHandle = {
  exportCsv: TableHandle["exportCsv"];
  getSelectedIds: () => string[];
};

const CampaignsTable = forwardRef<
  CampaignsTableHandle,
  {
    rows: CampaignRow[];
    loading?: boolean;
    onEdit: (row: CampaignRow) => void;
    onSelectionChange?: (ids: string[]) => void;
  }
>(function CampaignsTable({ rows, loading, onEdit, onSelectionChange }, ref) {
  const T = useMantineTheme().colors;
  const tableRef = useRef<TableHandle>(null);
  const selectedIdsRef = useRef<string[]>([]);

  useImperativeHandle(ref, () => ({
    exportCsv: (opts) => tableRef.current?.exportCsv?.(opts),
    getSelectedIds: () => selectedIdsRef.current,
  }));

  const cols: ColDef[] = [
    {
      field: "name",
      headerName: "Campaign",
      flex: 2, // grows on wide screens
      minWidth: 260, // don’t shrink below this
      tooltipField: "name",
      cellRenderer: ({ data }) => (
        <Stack gap={2}>
          <Text size="sm" fw={600} lineClamp={1} title={data?.name ?? ""}>
            {data?.name}
          </Text>
          <Text
            size="xs"
            c="gray.6"
            lineClamp={1}
            title={data?.description ?? ""}
          >
            {data?.description || "—"}
          </Text>
        </Stack>
      ),
    },

    {
      field: "category",
      headerName: "Activity",
      width: 160,
      minWidth: 140,
      tooltipField: "category",
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
      field: "tiers",
      headerName: "Tier",
      width: 200,
      minWidth: 170,
      sortable: false,
      filter: false,
      cellRenderer: (p) => <TierCell row={p.data} />,
    },

    {
      field: "objectives",
      headerName: "Objectives",
      flex: 1,
      minWidth: 200,
      sortable: false,
      filter: false,
      cellRenderer: ({ value }) => (
        <BadgeList items={Array.isArray(value) ? value : []} />
      ),
    },

    {
      field: "topics",
      headerName: "Topics",
      flex: 1,
      minWidth: 220,
      sortable: false,
      filter: false,
      cellRenderer: ({ value }) => (
        <BadgeList
          items={Array.isArray(value) ? value : []}
          firstBadgeColor="gray.1"
          firstBadgeVariant="outline"
          firstBadgeTextColor="gray.9"
        />
      ),
    },

    {
      field: "availability",
      headerName: "Dates",
      width: 220,
      minWidth: 200,
      sortable: false,
      filter: false,
      valueGetter: (p) => {
        const v = p.data?.availability ?? null;
        return (
          formatAvailabilityForUI({
            from: v?.from ?? null,
            to: v?.to ?? null,
          }) || "—"
        );
      },
      cellRenderer: ({ value }) => (
        <Text size="xs" c="gray.9" fw={500} title={value ?? ""}>
          {value ?? "—"}
        </Text>
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      width: 120,
      minWidth: 110,
      lockPinned: true,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }) => (
        <Flex align={"center"}>
          <AdminRequestAssetsButton
            selection={{
              id: null,
              name: data.name,
              isBespoke: false,
              campaign_id: data.id,
              bespoke_campaign_id: null,
              assets: data.assets,
              from_date: data.availability.from,
              to_date: data.availability.to,
              category: data.category,
              topics: data.topics,
              objectives: data.objectives,
              creatives: data.creatives,
            }}
          />

          <ActionIcon
            variant="subtle"
            size="xl"
            radius={10}
            color="violet.9"
            onClick={() => onEdit(data)}
            aria-label="Edit"
          >
            <IconEdit size={22} />
          </ActionIcon>
        </Flex>
      ),
    },
  ];

  return (
    <Table
      ref={tableRef}
      rows={rows}
      cols={cols}
      loading={loading}
      enableSelection
      height={550}
      onSelect={(selectedRows) => {
        const ids = (selectedRows ?? [])
          .map((r: CampaignRow) => r?.id)
          .filter(Boolean);
        selectedIdsRef.current = ids;
        onSelectionChange?.(ids); // ⬅️ trigger parent update
      }}
    />
  );
});

export default CampaignsTable;
