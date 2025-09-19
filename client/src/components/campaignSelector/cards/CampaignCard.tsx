import { Badge, Button, Card, Flex, Stack, Text, Title } from "@mantine/core";
import cl from "./campaignCard.module.scss";
import { IconCircleCheck, IconPencil, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import StyledButton from "@/components/styledButton/StyledButton";
import View from "../View";
import Edit from "../Edit";
import { Campaign } from "@/models/campaign.models";
import { truncate } from "lodash";
import { formatAvailabilityForUI } from "@/shared/shared.utilities";
import { BadgeList } from "@/components/badgeList/BadgeList";
import { useContext, useState } from "react";
import Status from "@/components/status/Status";
import { SelectionStatus } from "@/shared/shared.models";
import AppContext from "@/shared/AppContext";
import { UserTabModes } from "@/models/general.models";
import clsx from "clsx";

const CampaignCard = (c: Campaign) => {
	const [viewMode, setViewMode] = useState("view");
	const [opened, { open, close }] = useDisclosure(false);
	const [editOpened, { open: openEdit, close: closeEdit }] =
		useDisclosure(false);
	const {
		state: { filters },
	} = useContext(AppContext);
	const isSelections = filters.userSelectedTab === UserTabModes.Selected;

	const Objectives = ({ noTitle = false }) => (
		<Stack gap={5}>
			{!noTitle && (
				<Text size="xs" fw={500} c={"blue.3"}>
					OBJECTIVES
				</Text>
			)}
			<Flex align={"center"} gap={4}>
				<BadgeList items={c.objectives} maxDisplay={3} />
			</Flex>
		</Stack>
	);

	const Topics = ({ noTitle = false }) => (
		<Stack gap={5}>
			{!noTitle && (
				<Text size="xs" fw={500} c={"blue.3"}>
					TOPICS
				</Text>
			)}

			<Flex align={"center"} gap={4}>
				<BadgeList
					items={c.topics}
					maxDisplay={3}
					firstBadgeVariant="outline"
					firstBadgeColor="gray.1"
					firstBadgeTextColor="gray.9"
				/>
			</Flex>
		</Stack>
	);

	return (
		<>
			{/* Main card Component */}
			<Card
				radius={10}
				className={clsx(
					cl["campaign-card"],
					isSelections && cl.isSelections
				)}
				onClick={open}
			>
				<Stack gap={15}>
					{c.selected && (
						<Flex
							justify={"flex-end"}
							pos={"absolute"}
							top={8}
							left={0}
							pr={8}
							w={"100%"}
						>
							<Status
								status={
									!isSelections
										? SelectionStatus.OnPlan
										: c.status
								}
							/>
						</Flex>
					)}

					<Stack gap={3}>
						<Title order={5} fw={600}>
							{c.name}
						</Title>
						<Text size="sm" c={"gray.7"}>
							{truncate(c.description, { length: 100 })}
						</Text>
					</Stack>

					<Stack gap={5}>
						<Text size="xs" fw={500} c={"blue.3"}>
							SECTION
						</Text>

						<Flex align={"center"} gap={4}>
							<Badge variant="outline" color="gray.1">
								<Text size="xs" fw={600} c={"gray.9"}>
									{c.category}
								</Text>
							</Badge>
						</Flex>
					</Stack>

					<Objectives />

					<Topics />

					<Stack gap={5}>
						<Text size="xs" fw={500} c={"blue.3"}>
							{c.selected ? "SCHEDULED DATES" : "AVAILABLE DATES"}
						</Text>
						<Text size="xs" c={"gray.6"} fw={600}>
							{formatAvailabilityForUI(
								c.selected
									? {
											from: c.selection_from_date,
											to: c.selection_to_date,
									  }
									: c.availability
							)}
						</Text>
					</Stack>

					<Flex
						justify={"space-between"}
						pos={"absolute"}
						bottom={20}
						left={0}
						pr={20}
						pl={20}
						w={"100%"}
					>
						<StyledButton
							onClick={(e) => {
								e.stopPropagation();
								setViewMode("view");
								open();
							}}
						>
							View Details
						</StyledButton>

						{c.selected ? (
							<Button
								color={isSelections ? "blue.3" : "red.4"}
								leftSection={<IconPencil size={14} />}
								onClick={(e) => {
									e.stopPropagation();
									openEdit();
								}}
							>
								Edit
							</Button>
						) : (
							<Button
								leftSection={<IconPlus size={14} />}
								onClick={(e) => {
									e.stopPropagation();
									setViewMode("add");
									open();
								}}
							>
								Add
							</Button>
						)}
					</Flex>
				</Stack>
			</Card>

			{/* Card Details Breakdown */}
			<View
				mode={viewMode as any}
				c={c}
				opened={opened}
				closeDrawer={close}
			/>

			{/* Editing Card */}
			<Edit opened={editOpened} closeModal={closeEdit} selection={c} />
		</>
	);
};

export default CampaignCard;
