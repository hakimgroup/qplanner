// components/admin/requestAssets/AdminRequestAssetsButton.tsx
import { IconPackage } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AdminRequestAssetsModal from "./AdminRequestAssetsModal";
import { ActionIcon } from "@mantine/core";
import { AdminModalSelection } from "@/models/campaign.models";

type Props = {
  selection: AdminModalSelection;
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
        <IconPackage size={22} />
      </ActionIcon>

      <AdminRequestAssetsModal
        opened={opened}
        onClose={close}
        selection={selection}
      />
    </>
  );
}
