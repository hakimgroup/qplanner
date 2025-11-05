import Table from "@/components/table/Table";
import { usePlans } from "@/hooks/selection.hooks";
import { activityColors, statusColors } from "@/shared/shared.const";
import {
  currentStage,
  formatAvailabilityForUI,
} from "@/shared/shared.utilities";
import { Badge, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { ColDef } from "ag-grid-community";
import { format } from "date-fns";
import { startCase, toLower } from "lodash";

const CampaignStatusDashboard = () => {
  const T = useMantineTheme().colors;
  const { data, isLoading } = usePlans();

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
          color={activityColors[toLower(value)]}
          size="sm"
          fw={700}
          style={{ border: `1px solid ${T.blue[0]}` }}
        >
          {startCase(value)}
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
      field: "action",
      headerName: "Action",
      width: 150,
      minWidth: 140,
      sortable: false,
      filter: false,
      cellRenderer: (p) => (
        <Badge
          variant="light"
          color={currentStage(p?.data.status).color}
          size="sm"
          fw={700}
          style={{ border: `1px solid ${T.blue[0]}` }}
        >
          {currentStage(p?.data.status).label}
        </Badge>
      ),
    },
  ];

  return (
    <Stack>
      <Stack gap={7}>
        <Title order={2}>Campaign Status Dashboard</Title>
        <Text c={"gray.6"}>
          Track and manage campaign actions across all practices
        </Text>
      </Stack>

      <Table
        loading={isLoading}
        rows={data && data.data ? data.data : []}
        cols={colDefs}
        autoHeight
      />
    </Stack>
  );
};

export default CampaignStatusDashboard;
