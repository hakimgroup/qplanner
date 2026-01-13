import {
	Badge,
	Button,
	Card,
	Divider,
	Flex,
	Grid,
	Group,
	Stack,
	Text,
} from "@mantine/core";
import cl from "./guided.module.scss";
import StyledButton from "@/components/styledButton/StyledButton";
import { IconCircleCheck, IconTrash } from "@tabler/icons-react";
import { Campaign, GuidedCampaign } from "@/models/campaign.models";
import { BadgeList } from "@/components/badgeList/BadgeList";
import { useBulkAddCampaigns } from "@/hooks/campaign.hooks";
import { toast } from "sonner";
import { SelectionsSource, SelectionStatus } from "@/shared/shared.models";
import { useContext, useState } from "react";
import { UserTabModes } from "@/models/general.models";
import AppContext from "@/shared/AppContext";
import { updateState } from "@/shared/shared.utilities";
import View from "@/components/campaignSelector/View";
import { isEmpty } from "lodash";

interface Props {
	data: Campaign[];
	closeModal: () => void;
	goBack: () => void;
}

const GuidedResult = ({ data, goBack, closeModal }: Props) => {
	const { setState } = useContext(AppContext);
	const { mutate: bulkAdd, isPending: adding } = useBulkAddCampaigns();
	const [dt, setDt] = useState(data);
	const [selection, setSelection] = useState<Campaign>(null);

	const handleConfirm = () => {
		bulkAdd(
			{
				campaignIds: data.map((d) => d.id), // array of catalog campaign IDs
				from: null,
				to: null,
				status: SelectionStatus.OnPlan,
				notes: null,
				source: SelectionsSource.Guided,
			},
			{
				onSuccess: () => {
					closeModal();
					updateState(
						setState,
						"filters.userSelectedTab",
						UserTabModes.Selected
					);
				},
				onError: (e: any) => {
					toast.error(e?.message ?? "Failed to add campaigns");
				},
			}
		);
	};

	return (
		<Stack className={cl["guided-result"]}>
			<Card radius={10} bg={"blue.0"} bd="1px solid violet.2" p={15}>
				<Flex align={"center"} justify={"space-between"}>
					<Stack gap={0}>
						<Text fw={500} c="blue.3">
							Customized Mix
						</Text>
						<Text size="sm" c="gray.7">
							{data.length} out of {data.length} campaigns
							selected
						</Text>
					</Stack>

					<Badge color="red.4" size="lg">
						48% Focus Score
					</Badge>
				</Flex>
			</Card>

			<Divider size={"xs"} color="gray.1" />

			<Stack gap={10}>
				{dt.map((d) => (
					<Card
						radius={10}
						p={15}
						className={cl["result-card"]}
						key={d.id}
					>
						<Grid justify="space-between">
							<Grid.Col span={8}>
								<Stack gap={10}>
									<Text fw={500}>{d.name}</Text>
									<Text size="sm" c="gray.6">
										{d.description}
									</Text>

									<Stack gap={8}>
										<Badge
											variant="light"
											color="red.4"
											size="lg"
											fz={"xs"}
										>
											{d.focus}
										</Badge>

										<BadgeList
											items={d.objectives}
											maxDisplay={3}
										/>
									</Stack>
								</Stack>
							</Grid.Col>
							<Grid.Col span={4}>
								<Stack
									gap={10}
									align="flex-end"
									justify="space-between"
									h={"100%"}
								>
									<Stack align="flex-end" gap={10}>
										<Text size="xs" c="gray.6" fw={500}>
											{d.availability.from} -{" "}
											{d.availability.to}
										</Text>

										<Badge
											variant="outline"
											color="gray.1"
											c="gray.9"
											size="lg"
											fz={"xs"}
										>
											{d.duration}
										</Badge>
									</Stack>

									<Flex gap={8}>
										<StyledButton
											size="xs"
											leftSection={
												<IconTrash size={14} />
											}
											onClick={() => {
												setDt(
													dt.filter(
														(it) => d.id !== it.id
													)
												);
											}}
										>
											Remove Selection
										</StyledButton>
										<StyledButton
											size="xs"
											onClick={() => setSelection(d)}
										>
											View Details
										</StyledButton>
									</Flex>
								</Stack>
							</Grid.Col>
						</Grid>
					</Card>
				))}
			</Stack>

			<Flex justify={"flex-end"} gap={8}>
				<StyledButton onClick={goBack}>Back to Questions</StyledButton>
				<Button
					radius={10}
					color="blue.3"
					loading={adding}
					leftSection={<IconCircleCheck size={18} />}
					onClick={handleConfirm}
				>
					Add {dt.length} Campaigns
				</Button>
			</Flex>

			{!isEmpty(selection) && (
				<View
					opened
					c={selection}
					mode="view"
					closeDrawer={() => setSelection(null)}
				/>
			)}
		</Stack>
	);
};

export default GuidedResult;
