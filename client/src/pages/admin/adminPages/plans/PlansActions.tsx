import { PlanRow } from "@/models/selection.models";
import { statusColors } from "@/shared/shared.const";
import { formatDateRange } from "@/shared/shared.utilities";
import {
	Badge,
	Card,
	Drawer,
	Flex,
	Group,
	Select,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { startCase } from "lodash";
import filtersData from "@/filters.json";
import StyledButton from "@/components/styledButton/StyledButton";

interface Props {
	row: PlanRow;
	opened: boolean;
	closePanel: () => void;
}

const PlansActions = ({ row, opened, closePanel }: Props) => {
	const T = useMantineTheme().colors;

	return (
		<Drawer
			opened={opened}
			onClose={closePanel}
			title={
				<Text fz={"h4"} fw={600}>
					<Text span fz={"h4"} fw={600} c="blue.4">
						{row?.practice}
					</Text>{" "}
					&#9679; {row?.campaign}
				</Text>
			}
			size={"25rem"}
			position="right"
			offset={8}
			radius={10}
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
		>
			<Stack gap={20}>
				<Badge
					mt={10}
					variant="light"
					color={statusColors[row?.status]}
					size="md"
					fw={600}
					style={{ border: `1px solid ${T.blue[0]}` }}
				>
					{startCase(row?.status)}
				</Badge>

				<Card
					radius={10}
					bg={"gray.0"}
					style={{ border: `1px solid ${T.blue[0]}` }}
					shadow="xs"
				>
					<Stack gap={5}>
						<Text fz={"h6"}>Scheduled Duration</Text>

						<Text size="sm" c="blue.4" fw={500}>
							{formatDateRange(row?.from, row?.end)}
						</Text>
					</Stack>
				</Card>

				<Stack gap={5}>
					<Text fz={"h6"} fw={500}>
						Notes
					</Text>

					<Text>{row?.notes ?? "--"}</Text>
				</Stack>

				<Group gap={10}>
					<Select
						size="sm"
						radius={10}
						data={[{ label: "Change Status", value: "all" }].concat(
							filtersData.status
						)}
						value={row?.status}
						onChange={(v) => {}}
					/>

					<StyledButton fw={500}>Trigger follow-up</StyledButton>
				</Group>
			</Stack>
		</Drawer>
	);
};

export default PlansActions;
