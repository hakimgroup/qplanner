// components/admin/requestAssets/AdminRequestAssetsButton.tsx
import StyledButton from "@/components/styledButton/StyledButton";
import { IconAsset, IconSend } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AdminRequestAssetsModal from "./AdminRequestAssetsModal";
import { ActionIcon } from "@mantine/core";

type Props = {
  selection: {
    id: string;
    name?: string;
    isBespoke?: boolean;
    bespoke_campaign_id?: string | null;
    assets?: any; // Assets object
    from_date?: string | Date | null;
    to_date?: string | Date | null;
    category?: string | null;
    topics?: string[];
    objectives?: string[];
  };
};

export default function AdminRequestAssetsButton({ selection }: Props) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <ActionIcon
        variant="subtle"
        size="xl"
        radius={10}
        color="red.9"
        onClick={open}
        aria-label="Assets"
      >
        <IconAsset size={22} />
      </ActionIcon>

      <AdminRequestAssetsModal
        opened={opened}
        onClose={close}
        selection={selection}
      />
    </>
  );
}
