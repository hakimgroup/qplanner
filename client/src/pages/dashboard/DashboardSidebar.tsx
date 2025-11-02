import {
  Button,
  Stack,
  Title,
  Divider,
  Center,
  Flex,
  useMantineTheme,
  ActionIcon,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
} from "@tabler/icons-react";
import DashboardFilters from "./filters/DashboardFilters";
import cl from "./dashboardSidebar.module.scss";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export function DashboardSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const T = useMantineTheme();

  return (
    <Stack
      h="100%"
      gap={25}
      pt={100}
      pr={10}
      pl={20}
      w={collapsed ? 50 : 300}
      className={cl["dashboard-sidebar"]}
    >
      <Flex align={"center"} justify={collapsed ? "center" : "space-between"}>
        {!collapsed && (
          <Flex align={"center"} gap={8}>
            <IconFilter size={18} color={T.colors.blue[4]} />
            <Title order={5} fw={600}>
              Filters & Views
            </Title>
          </Flex>
        )}

        <ActionIcon
          variant="subtle"
          color="violet"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <IconChevronRight size={18} color={T.colors.gray[8]} />
          ) : (
            <IconChevronLeft size={18} color={T.colors.gray[8]} />
          )}
        </ActionIcon>
      </Flex>

      {!collapsed && <DashboardFilters />}
    </Stack>
  );
}
