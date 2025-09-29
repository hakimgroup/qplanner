import { PlanRow } from "@/models/selection.models";
import { statusColors } from "@/shared/shared.const";
import {
	formatDateRange,
	getReferenceLinkLabel,
} from "@/shared/shared.utilities";
import {
	Badge,
	Card,
	Drawer,
	Group,
	Loader,
	Select,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { startCase } from "lodash";
import filtersData from "@/filters.json";
import StyledButton from "@/components/styledButton/StyledButton";
import { useUpdateSelection } from "@/hooks/selection.hooks";
import { toast } from "sonner";
import { IconShare3, IconMinus } from "@tabler/icons-react";
import { c } from "vite/dist/node/types.d-aGj9QkWt";

interface Props {
	row: PlanRow;
	opened: boolean;
	closePanel: () => void;
}

const PlansActions = ({ row, opened, closePanel }: Props) => {
	const T = useMantineTheme().colors;
	const { mutate: updateSelection, isPending: saving } = useUpdateSelection();

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

				<Stack gap={5}>
					<Text fz={"h6"} fw={500}>
						More Information
					</Text>

					<Stack mt={10} gap={10}>
						{row?.reference_links?.map((rl: string, i: number) => (
							<StyledButton
								alignLeft
								bg={"violet.0"}
								key={rl}
								link={rl}
								leftSection={
									<IconShare3 size={18} color={T.gray[9]} />
								}
							>
								{getReferenceLinkLabel(rl, i)}
							</StyledButton>
						))}

						{!row?.reference_links?.length && (
							<IconMinus size={20} />
						)}
					</Stack>
				</Stack>

				<Group gap={10} align="flex-end">
					<Select
						size="sm"
						label={
							<Group align="center" justify="space-between">
								<Text size="sm" fw={500}>
									Change Status
								</Text>
								{saving && <Loader size={20} type="dots" />}
							</Group>
						}
						radius={10}
						data={[{ label: "Change Status", value: "all" }].concat(
							filtersData.status
						)}
						value={row?.status}
						onChange={(v) => {
							updateSelection(
								{
									id: row.id,
									patch: { status: v as any },
								},
								{
									onSuccess: () => {
										toast.success("Changes saved");
										closePanel();
									},
									onError: (e: any) =>
										toast.error(
											e?.message ??
												"Could not save changes"
										),
								}
							);
						}}
					/>

					<StyledButton fw={500}>Trigger follow-up</StyledButton>
				</Group>
			</Stack>
		</Drawer>
	);
};

export default PlansActions;
