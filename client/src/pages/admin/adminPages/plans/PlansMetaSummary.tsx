import { statusColors } from "@/shared/shared.const";
import { SelectionStatus } from "@/shared/shared.models";
import {
  Card,
  Group,
  Stack,
  Text,
  Title,
  Grid,
  Badge,
  Tooltip,
  Divider,
  useMantineTheme,
  rgba,
} from "@mantine/core";

type PlansMeta = {
  onPlan: number;
  requested: number;
  inProgress: number;
  awaitingApproval: number;
  confirmed: number;
  live: number;
};

type Props = {
  meta: PlansMeta | null | undefined;
  title?: string;
};

const STATUS_COPY: Record<
  keyof PlansMeta,
  { label: string; hint: string; color: string }
> = {
  onPlan: {
    label: "On Plan",
    hint: "Planned but not yet requested — consider kicking these off.",
    color: statusColors[SelectionStatus.OnPlan],
  },
  requested: {
    label: "Requested",
    hint: "Waiting on the practice to confirm assets/creative.",
    color: statusColors[SelectionStatus.Requested],
  },
  inProgress: {
    label: "In Progress",
    hint: "Practice has picked assets/creative. Now with designers.",
    color: statusColors[SelectionStatus.InProgress],
  },
  awaitingApproval: {
    label: "Awaiting Approval",
    hint: "Ready for practice review and sign-off.",
    color: statusColors[SelectionStatus.AwaitingApproval],
  },
  confirmed: {
    label: "Confirmed",
    hint: "Approved and ready to schedule or go live.",
    color: statusColors[SelectionStatus.Confirmed],
  },
  live: {
    label: "Live",
    hint: "Currently running.",
    color: statusColors[SelectionStatus.Live],
  },
};

function StatCard({ k, value }: { k: keyof PlansMeta; value: number }) {
  const info = STATUS_COPY[k];
  const T = useMantineTheme().colors;

  return (
    <Card
      withBorder
      radius="lg"
      p="md"
      shadow="xs"
      bg={rgba(info.color, 0.08)}
      style={{ border: `1px solid ${T.blue[1]}` }}
    >
      <Stack gap={6}>
        <Group gap={8} justify="space-between" align="center">
          <Text size="sm" fw={600}>
            {info.label}
          </Text>
          <Badge variant="light" color={info.color}>
            {value}
          </Badge>
        </Group>
        <Tooltip label={info.hint} withArrow>
          <Text size="xs" c="gray.6" lineClamp={2}>
            {info.hint}
          </Text>
        </Tooltip>
      </Stack>
    </Card>
  );
}

function NextAction({ meta }: { meta: PlansMeta }) {
  const T = useMantineTheme().colors;

  // simple priority messaging for admins
  const { awaitingApproval, requested, inProgress, onPlan, confirmed, live } =
    meta;

  let message = "All quiet for now.";
  let color: string = "gray.7";

  if (onPlan > 0) {
    message = `${onPlan} planned activit${
      onPlan === 1 ? "y" : "ies"
    } — consider requesting assets/creative.`;
    color = statusColors[SelectionStatus.OnPlan];
  } else if (requested > 0) {
    message = `${requested} planned activit${
      requested === 1 ? "y" : "ies"
    } waiting on practices to respond.`;
    color = statusColors[SelectionStatus.Requested];
  } else if (inProgress > 0) {
    message = `${inProgress} planned activit${
      inProgress === 1 ? "y" : "ies"
    } currently in progress with designers.`;
    color = statusColors[SelectionStatus.InProgress];
  } else if (awaitingApproval > 0) {
    message = `You have ${awaitingApproval} planned activit${
      awaitingApproval === 1 ? "y" : "ies"
    } awaiting your approval.`;
    color = statusColors[SelectionStatus.AwaitingApproval];
  } else if (confirmed > 0) {
    message = `${confirmed} confirmed — ready to schedule or go live.`;
    color = statusColors[SelectionStatus.Confirmed];
  } else if (live > 0) {
    message = `${live} live now.`;
    color = statusColors[SelectionStatus.Live];
  }

  return (
    <Card
      withBorder
      radius="lg"
      p="md"
      shadow="xs"
      bg={"gray.0"}
      style={{ borderColor: T.blue[1] }}
    >
      <Text size="sm" fw={700} c={color}>
        {message}
      </Text>
    </Card>
  );
}

export default function PlansMetaSummary({ meta, title = "Overview" }: Props) {
  const T = useMantineTheme().colors;

  if (!meta) {
    return (
      <Card withBorder radius="lg" p="lg" style={{ borderColor: T.blue[0] }}>
        <Text size="sm" c="gray.6">
          No summary available.
        </Text>
      </Card>
    );
  }

  const total =
    meta.onPlan +
    meta.requested +
    meta.inProgress +
    meta.awaitingApproval +
    meta.confirmed +
    meta.live;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Group gap={10} align="baseline">
          <Title order={3}>{title}</Title>
          <Text size="sm" c="gray.6">
            {total} selection{total === 1 ? "" : "s"}
          </Text>
        </Group>
      </Group>

      <NextAction meta={meta} />

      <Grid gutter="sm">
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 4 }}>
          <StatCard k="onPlan" value={meta.onPlan} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 4 }}>
          <StatCard k="requested" value={meta.requested} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 4 }}>
          <StatCard k="inProgress" value={meta.inProgress} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 4 }}>
          <StatCard k="awaitingApproval" value={meta.awaitingApproval} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 4 }}>
          <StatCard k="confirmed" value={meta.confirmed} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 4 }}>
          <StatCard k="live" value={meta.live} />
        </Grid.Col>
      </Grid>

      <Divider size={"xs"} color="blue.0" />

      <Text size="xs" c="gray.6">
        Tip: Click on the asset icon in the action column of the table below to
        request assets/creative.
      </Text>
    </Stack>
  );
}
