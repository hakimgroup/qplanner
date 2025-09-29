import {
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Group,
	Stack,
	Text,
	Title,
	useMatches,
} from "@mantine/core";
import cl from "./campaignCard.module.scss";
import { IconCalendarCheck, IconPencil, IconPlus } from "@tabler/icons-react";
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
import { format } from "date-fns";

const CampaignCard = (c: Campaign) => {
	const [viewMode, setViewMode] = useState("view");
	const [opened, { open, close }] = useDisclosure(false);
	const [editOpened, { open: openEdit, close: closeEdit }] =
		useDisclosure(false);
	const {
		state: { filters },
	} = useContext(AppContext);
	const isSelections = filters.userSelectedTab === UserTabModes.Selected;
	const mih = useMatches({
		base: 430,
		md: 480,
		lg: 470,
	});

	const Objectives = ({ noTitle = false }) => (
		<Stack gap={5}>
			{!noTitle && (
				<Text size="xs" fw={500} c={"blue.3"}>
					Objectives
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
					Categories
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
					c.selected && cl.isSelected,
					c.is_event && cl.isEvent
				)}
				mih={mih}
				onClick={open}
			>
				<Stack gap={15}>
					{c.selected && (
						<Flex justify={"space-between"} w={"100%"}>
							{c.is_event ? (
								<Group gap={10}>
									<Badge
										color="violet"
										size="lg"
										leftSection={
											<IconCalendarCheck size={15} />
										}
									>
										Event
									</Badge>
									<Text c="violet" size="sm" fw={700}>
										{c?.event_type}
									</Text>
								</Group>
							) : (
								<Box></Box>
							)}
							<Status
								status={
									!isSelections
										? SelectionStatus.OnPlan
										: c.status
								}
							/>
						</Flex>
					)}

					<Stack gap={3} mt={c.selected ? -10 : "auto"}>
						<Title order={5} fw={600}>
							{c.name}
						</Title>
						<Text size="sm" c={"gray.7"}>
							{truncate(c.description, { length: 100 })}
						</Text>
					</Stack>

					<Stack gap={5}>
						<Text size="sm" fw={500} c={"blue.3"}>
							{c.is_event
								? "Event Period"
								: c.selected
								? "Scheduled For"
								: "Availability"}
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

					<Stack gap={5}>
						<Text size="xs" fw={500} c={"blue.3"}>
							Activity
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
							variant={c.is_event ? "light" : "subtle"}
							color="violet"
							onClick={(e) => {
								e.stopPropagation();
								setViewMode("view");
								open();
							}}
						>
							View {c.is_event && <>Event</>} Details
						</StyledButton>

						{c.selected ? (
							<Button
								color={
									c.is_event
										? "violet"
										: isSelections
										? "blue.3"
										: "red.4"
								}
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
