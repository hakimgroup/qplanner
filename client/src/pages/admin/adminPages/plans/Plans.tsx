import {
  Button,
  Card,
  Grid,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconSearch,
} from "@tabler/icons-react";
import { useContext, useEffect, useRef, useState } from "react";
import filtersData from "@/filters.json";
import { usePractice } from "@/shared/PracticeProvider";
import StyledButton from "@/components/styledButton/StyledButton";
import PlansTable, { PlansTableHandle } from "./PlansTable";
import { usePlans } from "@/hooks/selection.hooks";
import { PlansFilter } from "@/models/selection.models";
import { normalizeAllToNull } from "@/shared/shared.utilities";
import { useLocation } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";
import AppContext from "@/shared/AppContext";
import { startCase } from "lodash";
import PlansMetaSummary from "./PlansMetaSummary";
import BulkRequestButton from "@/components/assets/BulkRequestButton";

const PAGE_SIZES = [
  { label: "25 / page", value: "25" },
  { label: "50 / page", value: "50" },
  { label: "100 / page", value: "100" },
];

const Plans = () => {
  const T = useMantineTheme().colors;
  const { pathname } = useLocation();
  const { practices } = usePractice();
  const plansRef = useRef<PlansTableHandle>(null);
  const {
    state: { filtersOptions },
  } = useContext(AppContext);
  const [plansFilters, setPlansFilters] = useState<PlansFilter>({
    practiceIds: [],
    status: "all",
    category: "all",
    source: "all",
    tier: "all",
    isBespoke: false,
  });
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const isBespokeRoute = pathname === `${AppRoutes.Admin}/${AppRoutes.Bespoke}`;

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Server-side search (debounced)
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 300);

  const offset = (page - 1) * pageSize;

  // Server data (filtered + paginated + searched)
  const { data: plansResponse, isFetching } = usePlans(
    normalizeAllToNull({
      ...plansFilters,
      limit: pageSize,
      offset,
      search: debounced || null,
    })
  );

  const data = plansResponse?.data ?? [];
  const meta = plansResponse?.meta ?? null;
  const total = meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [plansFilters, debounced, pageSize]);

  useEffect(() => {
    setPlansFilters((prev) => {
      if (prev.isBespoke === isBespokeRoute) return prev;
      return { ...prev, isBespoke: isBespokeRoute };
    });
    setSelectedRowIds([]);
  }, [isBespokeRoute]);

  // Pagination info text
  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + pageSize, total);

  return (
    <Stack gap={25}>
      <Stack gap={0}>
        <Title order={1}>
          {isBespokeRoute ? "Bespoke" : "Planned Activities"}
        </Title>
        <Text c="gray.6">
          {isBespokeRoute
            ? "Filtered list of bespoke plan items for easy triage"
            : "Master table of all planned activities across practices"}
        </Text>
      </Stack>

      <PlansMetaSummary meta={meta} />

      {/* Table Filters */}
      <Card
        p={25}
        radius={10}
        style={{ border: `1px solid ${T.blue[0]}` }}
        shadow="xs"
      >
        <Stack gap={10}>
          <Title order={4}>Filters & Search</Title>
          <Grid>
            <Grid.Col span={8}>
              <TextInput
                radius={10}
                size="sm"
                fz={"sm"}
                placeholder="Search campaigns, practices..."
                leftSection={<IconSearch size={18} />}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <MultiSelect
                size="sm"
                searchable
                radius={10}
                placeholder="Select Practices"
                data={practices.map((p) => ({
                  label: p.name,
                  value: p.id,
                }))}
                value={plansFilters.practiceIds}
                onChange={(v) =>
                  setPlansFilters({
                    ...plansFilters,
                    practiceIds: v ?? null,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Select
                size="sm"
                radius={10}
                data={[{ label: "All Status", value: "all" }].concat(
                  filtersData.status
                )}
                value={plansFilters.status}
                onChange={(v) =>
                  setPlansFilters({
                    ...plansFilters,
                    status: v ?? "all",
                  })
                }
              />
            </Grid.Col>
            {!isBespokeRoute && (
              <>
                <Grid.Col span={1.5}>
                  <Select
                    size="sm"
                    radius={10}
                    data={[
                      {
                        label: "All Activities",
                        value: "all",
                      },
                    ].concat(
                      filtersOptions?.categories.map((a) => ({
                        label: startCase(a),
                        value: a,
                      }))
                    )}
                    value={plansFilters.category}
                    onChange={(v) =>
                      setPlansFilters({
                        ...plansFilters,
                        category: v ?? "all",
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={1.5}>
                  <Select
                    size="sm"
                    radius={10}
                    data={[
                      {
                        label: "All Sources",
                        value: "all",
                      },
                      {
                        label: "Bespoke",
                        value: "bespoke",
                      },
                    ].concat(filtersData.sources)}
                    value={plansFilters.source}
                    onChange={(v) =>
                      setPlansFilters({
                        ...plansFilters,
                        source: v ?? "all",
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={1.5}>
                  <StyledButton
                    leftSection={<IconDownload size={16} />}
                    onClick={() =>
                      plansRef.current?.exportCsv({
                        fileName: "plans.csv",
                        columnKeys: [
                          "practice",
                          "campaign",
                          "category",
                          "source",
                          "status",
                          "from",
                          "end",
                          "updated_at",
                        ],
                      })
                    }
                  >
                    Export CSV
                  </StyledButton>
                </Grid.Col>
              </>
            )}
          </Grid>
        </Stack>
      </Card>

      {/* Table Bulk Action */}
      {selectedRowIds.length > 0 && (
        <Card
          p={25}
          radius={10}
          bg={"violet.0"}
          style={{ border: `1px solid ${T.violet[1]}` }}
          shadow="xs"
        >
          <Group align="center" justify="space-between">
            <Text size="sm" fw={500}>
              {selectedRowIds.length} plans selected
            </Text>

            <Group align="center" gap={8}>
              <Select
                size="sm"
                radius={10}
                data={[{ label: "Change Status", value: "all" }].concat(
                  filtersData.status
                )}
                value="all"
                onChange={(v) => {}}
              />

              <BulkRequestButton selectionIds={selectedRowIds} />

              <Button
                variant="subtle"
                color="violet"
                c="gray.9"
                onClick={() => {
                  setSelectedRowIds([]);
                  plansRef.current?.clearSelection();
                }}
              >
                Clear selection
              </Button>
            </Group>
          </Group>
        </Card>
      )}

      {/* Table */}
      <Card
        p={25}
        radius={10}
        style={{ border: `1px solid ${T.blue[0]}` }}
        shadow="xs"
      >
        <Stack gap={30}>
          <Title order={3}>
            Plan Items{" "}
            <Text span fz={"h3"} fw={700} c={"blue.3"}>
              ({total})
            </Text>
          </Title>
          <Stack gap={12}>
            <PlansTable
              ref={plansRef}
              data={data}
              loading={isFetching}
              setSelectedRowIds={(ids) => setSelectedRowIds(ids)}
            />

            {/* Pagination Controls */}
            <Group justify="space-between" align="center">
              <Text size="sm" c="blue.8" fw={500}>
              {total > 0
                ? `Showing ${showingFrom}–${showingTo} of ${total}`
                : "No results"}
            </Text>

            <Group gap={8} align="center">
              <Select
                size="xs"
                radius={10}
                w={120}
                data={PAGE_SIZES}
                value={String(pageSize)}
                onChange={(v) => setPageSize(Number(v) || 50)}
                allowDeselect={false}
              />

              <Button
                variant="default"
                size="xs"
                radius={10}
                leftSection={<IconChevronLeft size={14} />}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>

              <Text size="sm" fw={600} c="gray.7">
                {page} / {totalPages}
              </Text>

              <Button
                variant="default"
                size="xs"
                radius={10}
                rightSection={<IconChevronRight size={14} />}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </Group>
          </Group>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};

export default Plans;
