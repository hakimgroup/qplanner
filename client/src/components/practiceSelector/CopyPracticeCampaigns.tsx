import { Alert, Group, Stack, Text, Select, Collapse } from "@mantine/core";
import { useContext, useState } from "react";
import { usePractice } from "@/shared/PracticeProvider";
import { IconCopy, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import StyledButton from "@/components/styledButton/StyledButton";
import { useCopyPracticeCampaigns } from "@/hooks/selection.hooks";
import { useDisclosure } from "@mantine/hooks";
import AppContext from "@/shared/AppContext";

export default function CopyPracticeCampaigns() {
  const {
    state: {
      allCampaigns: { data },
    },
  } = useContext(AppContext);
  const { practices, activePracticeId } = usePractice();
  const [targetId, setTargetId] = useState<string | null>(null);
  const { mutate: copyCampaigns, isPending } = useCopyPracticeCampaigns();
  const [opened, { toggle }] = useDisclosure(false);

  const practiceOptions =
    practices?.map((p) => ({ label: p.name, value: p.id })) ?? [];

  const handleCopy = () => {
    if (!activePracticeId || !targetId) return;
    copyCampaigns({ sourceId: activePracticeId, targetId });
  };

  return (
    <Stack gap={8} align="flex-end">
      <Group justify="flex-end" align="flex-end" gap={12}>
        <Collapse in={opened}>
          <Select
            w={250}
            radius={10}
            label={
              <Text size="sm" fw={700} c="lime.9">
                Target practice
              </Text>
            }
            placeholder="Select practice to copy into..."
            data={practiceOptions.filter((p) => p.value !== activePracticeId)}
            value={targetId}
            onChange={setTargetId}
            searchable
            clearable
            color="blue.3"
          />
        </Collapse>

        <StyledButton
          leftSection={
            !opened ? <IconPlus size={14} /> : <IconCopy size={14} />
          }
          onClick={opened ? handleCopy : toggle}
          loading={isPending}
          disabled={(opened && (!targetId || !activePracticeId)) || !data.length}
        >
          {opened ? "Copy Calendar" : "Replicate This Calendar"}
        </StyledButton>
      </Group>

      {opened && (
        <Alert
          icon={<IconInfoCircle size={14} />}
          color="blue.3"
          radius={10}
          variant="light"
          maw={420}
          py={6}
          px={10}
        >
          <Text size="xs" c="gray.7">
            Only catalog campaigns are copied. Bespoke campaigns and events are
            specific to each practice and won't be cloned.
          </Text>
        </Alert>
      )}
    </Stack>
  );
}
