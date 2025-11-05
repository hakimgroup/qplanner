import { Card, Group, Text, Select, Box, Grid, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconFilter } from "@tabler/icons-react";
import { usePractice } from "@/shared/PracticeProvider";
import { useMemo, useState, useCallback } from "react";
import { status as typeOptions, categories } from "@/filters.json";

interface NotificationFiltersProps {
  onChange?: (filters: NotificationFilterValues) => void;
}

export interface NotificationFilterValues {
  practice: string | null;
  type: string | null;
  status: string | null;
  campaign: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

const DEFAULT_FILTERS: NotificationFilterValues = {
  practice: "all",
  type: "all",
  status: "all",
  campaign: "all",
  startDate: null,
  endDate: null,
};

export default function NotificationsFilters({
  onChange,
}: NotificationFiltersProps) {
  const { practices } = usePractice();

  // Controlled filters state
  const [filters, setFilters] =
    useState<NotificationFilterValues>(DEFAULT_FILTERS);

  // Local date error states
  const [startErr, setStartErr] = useState<string | null>(null);
  const [endErr, setEndErr] = useState<string | null>(null);

  const practiceOptions = useMemo(
    () => [
      { label: "All Practices", value: "all" },
      ...(practices ?? []).map((p: any) => ({
        label: p.name,
        value: p.id,
      })),
    ],
    [practices]
  );

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Read", value: "read" },
    { label: "Unread", value: "unread" },
  ];

  const campaignOptions = [{ label: "All", value: "all" }].concat(
    categories.map((ct: string) => ({ label: ct, value: ct }))
  );

  const push = useCallback(
    (next: NotificationFilterValues) => {
      setFilters(next);
      onChange?.(next);
    },
    [onChange]
  );

  const handleChange = (key: keyof NotificationFilterValues, value: any) => {
    const next = { ...filters, [key]: value };

    // Validate dates whenever either date changes
    if (key === "startDate" || key === "endDate") {
      const { startDate, endDate } = next;

      // reset previous errors
      setStartErr(null);
      setEndErr(null);

      // rule: start must be <= end
      if (startDate && endDate && startDate > endDate) {
        if (key === "startDate") {
          // If user sets start after current end → flag start error
          setStartErr("Start date cannot be after end date");
        } else {
          // If user sets end before current start → flag end error
          setEndErr("End date cannot be before start date");
        }
      }
    }

    push(next);
  };

  const clearFilters = () => {
    setStartErr(null);
    setEndErr(null);
    push(DEFAULT_FILTERS);
  };

  return (
    <Card
      withBorder
      radius={10}
      p="md"
      style={{ borderColor: "#e9ecef", backgroundColor: "white" }}
      shadow="xs"
    >
      <Group align="center" justify="space-between" mb="xs">
        <Group gap={8}>
          <IconFilter size={18} />
          <Text fw={600} size="md" c="blue.3">
            Filters
          </Text>
        </Group>
        <Button variant="subtle" size="xs" onClick={clearFilters}>
          Clear filters
        </Button>
      </Group>

      <Grid gutter={10} mt={4}>
        {/* Practice */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
          <Select
            radius={10}
            data={practiceOptions}
            searchable
            nothingFoundMessage="No practices found"
            value={filters.practice ?? "all"}
            onChange={(v) => handleChange("practice", v)}
            placeholder="All Practices"
            label={
              <Text size="sm" fw={500} mb={5}>
                Practice
              </Text>
            }
            comboboxProps={{ width: 300, position: "bottom-start" }}
          />
        </Grid.Col>

        {/* Type */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
          <Select
            radius={10}
            data={typeOptions}
            value={filters.type ?? "all"}
            onChange={(v) => handleChange("type", v)}
            placeholder="All Types"
            label={
              <Text size="sm" fw={500} mb={5}>
                Type
              </Text>
            }
          />
        </Grid.Col>

        {/* Status */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
          <Select
            radius={10}
            data={statusOptions}
            value={filters.status ?? "all"}
            onChange={(v) => handleChange("status", v)}
            placeholder="All"
            label={
              <Text size="sm" fw={500} mb={5}>
                Status
              </Text>
            }
          />
        </Grid.Col>

        {/* Campaign (maps to category on server) */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
          <Select
            radius={10}
            data={campaignOptions}
            value={filters.campaign ?? "all"}
            onChange={(v) => handleChange("campaign", v)}
            placeholder="All Campaigns"
            label={
              <Text size="sm" fw={500} mb={5}>
                Campaign
              </Text>
            }
            comboboxProps={{ width: 400, position: "bottom-start" }}
          />
        </Grid.Col>

        {/* Start Date */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
          <Box>
            <DateInput
              radius={10}
              value={filters.startDate}
              onChange={(v) => handleChange("startDate", v)}
              placeholder="dd/mm/yyyy"
              valueFormat="DD/MM/YYYY"
              maxDate={filters.endDate ?? undefined} // prevent choosing start after end
              error={startErr || undefined}
              label={
                <Text size="sm" fw={500} mb={5}>
                  Start Date
                </Text>
              }
            />
          </Box>
        </Grid.Col>

        {/* End Date */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
          <Box>
            <DateInput
              radius={10}
              value={filters.endDate}
              onChange={(v) => handleChange("endDate", v)}
              placeholder="dd/mm/yyyy"
              valueFormat="DD/MM/YYYY"
              minDate={filters.startDate ?? undefined} // prevent choosing end before start
              error={endErr || undefined}
              label={
                <Text size="sm" fw={500} mb={5}>
                  End Date
                </Text>
              }
            />
          </Box>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
