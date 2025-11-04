import StyledButton from "@/components/styledButton/StyledButton";
import {
  Stack,
  Group,
  Text,
  SimpleGrid,
  Card,
  Radio,
  Image,
  ActionIcon,
  Modal,
  Button,
  useMantineTheme,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowsDiagonal, IconPhoto } from "@tabler/icons-react";
import { useMemo, useState } from "react";

export type CreativeItem = {
  url: string;
  label?: string; // e.g. "Modern Professional"
};

type Props = {
  title?: string; // defaults to "Creative"
  creatives: CreativeItem[]; // list of images
  value: string | null; // currently selected url
  onChange: (url: string) => void; // fire when a creative is chosen
};

export default function CreativePicker({
  title = "Creative",
  creatives,
  value,
  onChange,
}: Props) {
  const T = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [preview, setPreview] = useState<CreativeItem | null>(null);

  const selected = useMemo(
    () => creatives.find((c) => c.url === value) ?? null,
    [creatives, value]
  );

  const openPreview = (item: CreativeItem) => {
    setPreview(item);
    open();
  };

  const selectInPreview = () => {
    if (preview?.url) onChange(preview.url);
    close();
  };

  return (
    <Stack gap="xs">
      {/* Section header */}
      <Group gap={8} align="center">
        <ThemeIcon variant="light" color="blue.5" radius="xl" size="sm">
          <IconPhoto size={14} />
        </ThemeIcon>
        <Text fw={500}>{title}</Text>
      </Group>

      {/* Grid list */}
      <Radio.Group value={value ?? ""} onChange={(val) => onChange(val)}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {creatives.map((item, idx) => (
            <Stack key={item.url} gap={6}>
              <Card
                withBorder
                radius="md"
                px={6}
                py={6}
                mah={130}
                style={{
                  position: "relative",
                  borderColor:
                    selected?.url === item.url
                      ? T.colors.blue[2]
                      : T.colors.gray[0],
                }}
              >
                <Image
                  src={item.url}
                  alt={item.label ?? `Creative ${idx + 1}`}
                  radius="sm"
                  height={"100%"}
                />

                <ActionIcon
                  variant="light"
                  radius="xl"
                  size="sm"
                  bg={"blue.0"}
                  onClick={() => openPreview(item)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                  }}
                  aria-label="Expand"
                >
                  <IconArrowsDiagonal size={14} />
                </ActionIcon>
              </Card>

              <Radio
                size="xs"
                color="blue.3"
                value={item.url}
                label={
                  <Text
                    size="xs"
                    fw={500}
                    c={
                      selected?.url === item.url
                        ? T.colors.indigo[9]
                        : T.colors.gray[9]
                    }
                  >
                    {item.label ?? `Creative ${idx + 1}`}
                  </Text>
                }
              />
            </Stack>
          ))}
        </SimpleGrid>
      </Radio.Group>

      {/* Preview modal */}
      <Modal
        opened={opened}
        onClose={close}
        centered
        radius={10}
        title={<Text fw={600}>{preview?.label ?? "Creative"}</Text>}
        size="lg"
        overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
      >
        <Stack gap="md">
          <Image
            src={preview?.url}
            alt={preview?.label ?? "Creative preview"}
            radius="md"
          />
          <Group justify="space-between">
            <StyledButton onClick={close}>Close</StyledButton>
            <Button onClick={selectInPreview}>Select This Creative</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
