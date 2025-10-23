import { Card, Group, Text, Select, Box, Grid } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconFilter } from "@tabler/icons-react";
import { usePractice } from "@/shared/PracticeProvider";
import { useState } from "react";

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

export default function NotificationsFilters({
  onChange,
}: NotificationFiltersProps) {
  const { practices } = usePractice();
  const [filters, setFilters] = useState<NotificationFilterValues>({
    practice: null,
    type: null,
    status: null,
    campaign: null,
    startDate: null,
    endDate: null,
  });

  const handleChange = (key: keyof NotificationFilterValues, value: any) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onChange?.(next);
  };

  const practiceOptions = [
    { label: "All Practices", value: "all" },
    ...(practices ?? []).map((p: any) => ({
      label: p.name,
      value: p.id,
    })),
  ];

  const typeOptions = [
    { label: "All Types", value: "all" },
    { label: "System", value: "system" },
    { label: "Campaign", value: "campaign" },
    { label: "User", value: "user" },
  ];

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Read", value: "read" },
    { label: "Unread", value: "unread" },
  ];

  const campaignOptions = [
    { label: "All Campaigns", value: "all" },
    { label: "Guided", value: "guided" },
    { label: "Bespoke", value: "bespoke" },
  ];

  return (
    <Card
      withBorder
      radius={10}
      p="md"
      style={{
        borderColor: "#e9ecef",
        backgroundColor: "white",
      }}
      shadow="xs"
    >
      <Group align="center" gap={8} mb="xs">
        <IconFilter size={18} />
        <Text fw={600} size="md" c="blue.3">
          Filters
        </Text>
      </Group>

      <Grid gutter={10} mt={4}>
        {/* Practice */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
          <Select
            radius={10}
            data={practiceOptions}
            searchable
            nothingFoundMessage="No practices found"
            defaultValue="all"
            onChange={(v) => handleChange("practice", v)}
            placeholder="All Practices"
            label={
              <Text size="sm" fw={500} mb={5}>
                Practice
              </Text>
            }
            comboboxProps={{
              width: 300,
              position: "bottom-start",
            }}
          />
        </Grid.Col>

        {/* Type */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
          <Select
            radius={10}
            data={typeOptions}
            defaultValue="all"
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
            defaultValue="all"
            onChange={(v) => handleChange("status", v)}
            placeholder="All"
            label={
              <Text size="sm" fw={500} mb={5}>
                Status
              </Text>
            }
          />
        </Grid.Col>

        {/* Campaign */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
          <Select
            radius={10}
            data={campaignOptions}
            defaultValue="all"
            onChange={(v) => handleChange("campaign", v)}
            placeholder="All Campaigns"
            label={
              <Text size="sm" fw={500} mb={5}>
                Campaign
              </Text>
            }
            comboboxProps={{
              width: 400,
              position: "bottom-start",
            }}
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
