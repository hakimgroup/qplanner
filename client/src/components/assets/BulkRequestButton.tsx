import { useState, useMemo } from "react";
import {
  Button,
  Modal,
  Stack,
  Text,
  List,
  Group,
  Badge,
  Card,
  Divider,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconMessage,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useRequestAssetsBulk } from "@/hooks/notification.hooks";
import StyledButton from "../styledButton/StyledButton";

type BulkRequestButtonProps = {
  selectionIds: string[];
  onCompleted?: (result: any) => void;
};

export default function BulkRequestButton({
  selectionIds,
  onCompleted,
}: BulkRequestButtonProps) {
  const T = useMantineTheme().colors;
  const [opened, setOpened] = useState(false);

  // holds the server response after submit; when set, we render the results UI
  const [result, setResult] = useState<any | null>(null);

  const { mutate: requestBulk, isPending } = useRequestAssetsBulk();

  const count = selectionIds?.length ?? 0;
  const disabled = count === 0 || isPending;

  const triggerModal = () => {
    if (disabled) return;
    // reset prior results every time user (re)opens the modal
    setResult(null);
    setOpened(true);
  };

  const handleConfirm = () => {
    requestBulk(selectionIds, {
      onSuccess: (res: any) => {
        const success = res?.success ?? 0;
        const failed = res?.failed ?? 0;

        const skipped = Array.isArray(res?.results)
          ? res.results.filter(
              (r: any) =>
                typeof r?.status === "string" && r.status.startsWith("skipped")
            ).length
          : 0;

        const hasIssues = failed > 0 || skipped > 0;

        // always call callback
        onCompleted?.(res);

        if (hasIssues) {
          // keep modal open and show friendly UI
          setResult(res);
          toast.warning(
            `Bulk request partial: ${success} sent, ${skipped} skipped, ${failed} failed`
          );
        } else {
          // everything succeeded -> close modal
          setOpened(false);
          toast.success(`Bulk request complete: ${success} sent`);
        }
      },
      onError: (e: any) => {
        setOpened(false);
        toast.error(e?.message ?? "Bulk request failed");
      },
    });
  };

  const title = useMemo(
    () => (
      <Group gap={8}>
        {result ? (
          <IconCircleCheck size={18} style={{ color: T.indigo[7] }} />
        ) : (
          <IconAlertTriangle size={18} style={{ color: T.orange[7] }} />
        )}
        <Text fw={700} c={result ? "indigo.7" : "orange.7"}>
          {result
            ? "Bulk Request Summary"
            : "Bulk Request Assets/Creative — Review"}
        </Text>
      </Group>
    ),
    [T.yellow, result]
  );

  // Derived helpers for results rendering
  const summary = useMemo(() => {
    if (!result) return null;
    const success = result?.success ?? 0;
    const failed = result?.failed ?? 0;
    const skipped = Array.isArray(result?.results)
      ? result.results.filter(
          (r: any) =>
            typeof r?.status === "string" && r.status.startsWith("skipped")
        ).length
      : 0;
    return { success, failed, skipped };
  }, [result]);

  const skippedItems = useMemo(() => {
    if (!result?.results) return [];
    return (result.results as any[])
      .filter(
        (r) => typeof r?.status === "string" && r.status.startsWith("skipped")
      )
      .map((r) => ({
        id: r?.selection_id,
        name: r?.selection_name ?? "—",
        reason: r?.message ?? "Skipped",
        code: r?.status ?? "skipped",
      }));
  }, [result]);

  const errorItems = useMemo(() => {
    if (!result?.errors) return [];
    return (result.errors as any[]).map((e) => ({
      id: e?.selection_id,
      name: e?.selection_name ?? "—",
      error: e?.error ?? "error",
      reason: e?.message ?? "An error occurred",
    }));
  }, [result]);

  const hasIssues =
    !!result && ((summary?.failed ?? 0) > 0 || (summary?.skipped ?? 0) > 0);

  return (
    <>
      <StyledButton
        disabled={disabled}
        leftSection={<IconMessage size={16} />}
        onClick={triggerModal}
      >
        Trigger Request Assets/Creative
      </StyledButton>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        centered
        size="lg"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
        title={title}
      >
        {!result ? (
          // Phase 1: pre-flight warning
          <Stack gap="sm">
            <Text size="sm" c="gray.7">
              You’re about to request assets/creatives for{" "}
              <Text span fw={700}>
                {count}
              </Text>{" "}
              selection{count === 1 ? "" : "s"}. Please confirm you understand
              the following:
            </Text>

            <List spacing={6} size="sm" withPadding>
              <List.Item>
                <Text size="sm">
                  <Badge variant="light" color="violet">
                    Bespoke
                  </Badge>{" "}
                  selections will be{" "}
                  <Text span fw={700}>
                    ignored
                  </Text>{" "}
                  — request those individually.
                </Text>
              </List.Item>
              <List.Item>
                Only selections currently{" "}
                <Badge variant="light" color="green">
                  onPlan
                </Badge>{" "}
                will be processed; others are{" "}
                <Text span fw={700}>
                  skipped
                </Text>
                .
              </List.Item>
              <List.Item>
                Selections whose linked campaign has{" "}
                <Text span fw={700}>
                  no creatives
                </Text>{" "}
                will also be{" "}
                <Text span fw={700}>
                  skipped
                </Text>
                .
              </List.Item>
            </List>

            <Group justify="flex-end" mt="xs">
              <StyledButton variant="default" onClick={() => setOpened(false)}>
                Cancel
              </StyledButton>
              <Button onClick={handleConfirm} loading={isPending}>
                Proceed & send requests
              </Button>
            </Group>
          </Stack>
        ) : (
          // Phase 2: results / issues view
          <Stack gap="md">
            <Group gap="xs">
              <Badge color="green" variant="light">
                Sent: {summary?.success ?? 0}
              </Badge>
              <Badge color="yellow" variant="light">
                Skipped: {summary?.skipped ?? 0}
              </Badge>
              <Badge color="red" variant="light">
                Failed: {summary?.failed ?? 0}
              </Badge>
            </Group>

            {hasIssues ? (
              <>
                {!!skippedItems.length && (
                  <Card
                    withBorder
                    radius="md"
                    p="md"
                    shadow="xs"
                    bg={"gray.0"}
                    style={{ borderColor: T.blue[1] }}
                  >
                    <Text fw={700} mb={6} c="violet.9">
                      Skipped
                    </Text>
                    <Divider mb="xs" color="gray.1" />
                    <List spacing={8} size="sm" withPadding>
                      {skippedItems.map((s) => (
                        <List.Item key={`skip-${s.id ?? Math.random()}`}>
                          <Text size="sm">
                            <Text span fw={600}>
                              {s.name}
                            </Text>{" "}
                            —{" "}
                            <Text span c="yellow.8">
                              {s.reason}
                            </Text>
                          </Text>
                        </List.Item>
                      ))}
                    </List>
                  </Card>
                )}

                {!!errorItems.length && (
                  <Card withBorder radius="md" p="md">
                    <Text fw={700} mb={6} c="violet.9">
                      Failed
                    </Text>
                    <Divider mb="sm" />
                    <List spacing={8} size="sm" withPadding>
                      {errorItems.map((e) => (
                        <List.Item key={`err-${e.id ?? Math.random()}`}>
                          <Text size="sm">
                            <Text span fw={600}>
                              {e.name}
                            </Text>{" "}
                            <Text span c="gray.6">
                              ({e.id ?? "—"})
                            </Text>{" "}
                            —{" "}
                            <Text span c="red.8">
                              {e.reason} {e.error ? `(${e.error})` : ""}
                            </Text>
                          </Text>
                        </List.Item>
                      ))}
                    </List>
                  </Card>
                )}

                <Group justify="flex-end">
                  <StyledButton
                    variant="default"
                    onClick={() => setOpened(false)}
                  >
                    Close
                  </StyledButton>
                </Group>
              </>
            ) : (
              // Defensive: this state shouldn't be reachable (we auto-close on full success),
              // but keep a simple close CTA just in case.
              <Group justify="flex-end">
                <StyledButton onClick={() => setOpened(false)}>
                  Close
                </StyledButton>
              </Group>
            )}
          </Stack>
        )}
      </Modal>
    </>
  );
}
