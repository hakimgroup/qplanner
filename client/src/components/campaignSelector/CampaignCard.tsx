import {
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Drawer,
	Flex,
	Grid,
	Group,
	Modal,
	Select,
	SelectProps,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core";
import cl from "./campaignCard.module.scss";
import {
	IconCalendar,
	IconCheck,
	IconCircle,
	IconCircleCheck,
	IconCircleFilled,
	IconClockHour2,
	IconEdit,
	IconFileText,
	IconPencil,
	IconPlus,
	icons,
	IconShare3,
	IconX,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import StyledButton from "../styledButton/StyledButton";
import { DateInput } from "@mantine/dates";
import { useState } from "react";
import { Colors, statusColors } from "@/shared/shared.const";
import filterData from "@/filters.json";

const CampaignCard = () => {
	const T = useMantineTheme();
	const [opened, { open, close }] = useDisclosure(false);
	const [editOpened, { open: openEdit, close: closeEdit }] =
		useDisclosure(false);
	const [campaign, setCampaign] = useState({
		dateRange: {
			from: null,
			to: null,
		},
	});

	const Objectives = ({ noTitle = false }) => (
		<Stack gap={5}>
			{!noTitle && (
				<Text size="xs" fw={500} c={"blue.3"}>
					OBJECTIVES
				</Text>
			)}
			<Flex align={"center"} gap={4}>
				{["AOV", "Sales"].map((c) => (
					<Badge
						key={c}
						color="red.4"
						style={{ textTransform: "unset" }}
					>
						{c}
					</Badge>
				))}
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
				{["Kids", "Clinical"].map((c) => (
					<Badge
						key={c}
						variant="outline"
						color="gray.1"
						style={{ textTransform: "unset" }}
					>
						<Text size="xs" fw={600} c={"gray.9"}>
							{c}
						</Text>
					</Badge>
				))}
			</Flex>
		</Stack>
	);

	const assets = [
		{
			name: "back-to-school-flyer.pdf",
			type: "application/pdf",
		},
		{
			name: "parent-education-video.mp4",
			type: "video/mp4",
		},
		{
			name: "insurance-benefits-sheet.docx",
			type: "application/msword",
		},
	];

	const quickDateOptions = [
		{
			name: "1 Week",
		},
		{
			name: "2 Weeks",
		},
		{
			name: "1 Month",
		},
		{
			name: "2 Months",
		},
		{
			name: "3 Months",
		},
	];

	const renderSelectOption: SelectProps["renderOption"] = ({
		option,
		checked,
	}) => (
		<Group gap="xs">
			{/* {icons[option.value]} */}
			{checked && (
				<IconCheck style={{ marginInlineStart: "auto" }} size={15} />
			)}
			<IconCircleFilled
				style={{ marginInlineStart: "auto" }}
				size={10}
				color={statusColors[option.value]}
			/>
			{option.label}
		</Group>
	);

	return (
		<>
			{/* Main card Component */}
			<Card radius={10} className={cl["campaign-card"]} onClick={open}>
				<Stack gap={15}>
					<Flex
						justify={"flex-end"}
						pos={"absolute"}
						top={8}
						left={0}
						pr={8}
						w={"100%"}
					>
						<Badge
							variant="light"
							color="green.6"
							style={{ textTransform: "unset" }}
						>
							<Flex align={"center"} gap={5}>
								<IconCircleCheck size={15} stroke={2.4} />
								<Text fw={700} size="xs" mt={1}>
									On Plan
								</Text>
							</Flex>
						</Badge>
					</Flex>

					<Stack gap={3}>
						<Title order={5} fw={600}>
							Designer Frame Showcase
						</Title>
						<Text size="sm" c={"gray.7"}>
							Highlight premium designer frames with exclusive
							collections
						</Text>
					</Stack>

					<Stack gap={5}>
						<Text size="xs" fw={500} c={"blue.3"}>
							SECTION
						</Text>

						<Flex align={"center"} gap={4}>
							{["Brand campaigns"].map((c) => (
								<Badge
									key={c}
									variant="outline"
									color="gray.1"
									style={{ textTransform: "unset" }}
								>
									<Text size="xs" fw={600} c={"gray.9"}>
										{c}
									</Text>
								</Badge>
							))}
						</Flex>
					</Stack>

					<Objectives />

					<Topics />

					<Stack gap={5}>
						<Text size="xs" fw={500} c={"blue.3"}>
							AVAILABLE DATES
						</Text>
						<Text size="sm" c={"gray.6"}>
							Mar 01 - Mar 31, 2024
						</Text>
					</Stack>

					<Flex
						justify={"flex-end"}
						pos={"absolute"}
						bottom={20}
						left={0}
						pr={20}
						w={"100%"}
					>
						<Button
							color="red.4"
							radius={10}
							leftSection={<IconPencil size={14} />}
							onClick={(e) => {
								e.stopPropagation();
								openEdit();
							}}
						>
							Edit
						</Button>
					</Flex>
				</Stack>
			</Card>

			{/* Card Details Breakdown */}
			<Drawer
				size={"32rem"}
				opened={opened}
				onClose={close}
				title={
					<Flex align={"center"} justify={"space-between"} gap={100}>
						<Text fz={"h4"} fw={600}>
							Back to School Eye Exams
						</Text>
						<Badge
							variant="light"
							color="green.9"
							style={{ textTransform: "unset" }}
						>
							<Flex align={"center"} gap={5}>
								<IconCircleCheck size={15} stroke={2.4} />
								<Text fw={700} size="xs" mt={1}>
									On Plan
								</Text>
							</Flex>
						</Badge>
					</Flex>
				}
				position="right"
				offset={8}
				radius={10}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<Stack gap={20} pb={20}>
					<Text c={"gray.7"} maw={400}>
						Promote comprehensive eye exams for school-age children
					</Text>

					<Objectives />

					<Topics />

					<Divider size={"xs"} color="gray.1" />

					<Text fw={500} size="sm">
						Description
					</Text>

					<Text c="gray.7" size="sm">
						Target parents with school-age children for
						comprehensive eye exams. Includes early detection
						messaging, insurance benefits information, and
						convenient scheduling options. Focus on digital eye
						strain and learning performance connection.
					</Text>

					<Divider size={"xs"} color="gray.1" />

					<Flex align={"center"} gap={5}>
						<IconFileText size={18} color={T.colors.blue[3]} />
						<Text fw={500} size="sm">
							Assets (3)
						</Text>
					</Flex>

					<Stack gap={8}>
						{assets.map((as) => (
							<Card
								key={as.name}
								bg={"#f6f6f8"}
								radius={10}
								style={{ cursor: "pointer" }}
								p={10}
							>
								<Flex
									align={"center"}
									justify={"space-between"}
								>
									<Group align={"center"} gap={8}>
										<IconFileText
											size={18}
											color={T.colors.gray[5]}
										/>
										<Stack gap={5}>
											<Text fw={500} size="sm">
												{as.name}
											</Text>
											<Text size="xs" c={"gray.5"}>
												{as.type}
											</Text>
										</Stack>
									</Group>

									<IconShare3
										size={18}
										color={T.colors.gray[9]}
									/>
								</Flex>
							</Card>
						))}
					</Stack>

					<Divider size={"xs"} color="gray.1" />

					<Card bg={"#fbfbfc"} radius={10}>
						<Stack gap={25}>
							<Stack gap={3}>
								<Text fw={600} size="sm">
									Campaign Dates
								</Text>
								<Text c="gray.7" size="sm">
									Set the date range for "Contact Lens Trial
									Month"
								</Text>
							</Stack>

							<Stack gap={6}>
								<Flex
									align={"center"}
									justify={"space-between"}
									gap={8}
								>
									<DateInput
										w={"100%"}
										pointer
										size="md"
										radius={10}
										valueFormat="DD MMM YYYY"
										leftSection={<IconCalendar size={16} />}
										value={campaign.dateRange.from}
										onChange={(d) =>
											setCampaign({
												...campaign,
												dateRange: {
													...campaign.dateRange,
													from: d,
												},
											})
										}
										label={
											<Text
												size="sm"
												c={"gray.9"}
												fw={500}
											>
												Start Date
											</Text>
										}
										placeholder="Start Date"
									/>
									<DateInput
										w={"100%"}
										pointer
										size="md"
										radius={10}
										valueFormat="DD MMM YYYY"
										leftSection={<IconCalendar size={16} />}
										value={campaign.dateRange.to}
										onChange={(d) =>
											setCampaign({
												...campaign,
												dateRange: {
													...campaign.dateRange,
													to: d,
												},
											})
										}
										label={
											<Text
												size="sm"
												c={"gray.9"}
												fw={500}
											>
												End Date
											</Text>
										}
										placeholder="End Date"
									/>
								</Flex>
							</Stack>

							<Card bg={"#f6f6f8"} radius={10}>
								<Flex
									align={"center"}
									justify={"space-between"}
								>
									<Group align={"center"} gap={10}>
										<IconClockHour2
											size={18}
											color={T.colors.gray[7]}
										/>
										<Text fw={500} size="sm">
											Duration:
										</Text>
									</Group>

									<Badge
										color="red.4"
										style={{ textTransform: "unset" }}
									>
										90 days
									</Badge>
								</Flex>
							</Card>

							<Stack>
								<Text fw={500} size="sm">
									Quick Options
								</Text>

								<Grid gutter={8}>
									{quickDateOptions.map((d) => (
										<Grid.Col span={4} key={d.name}>
											<StyledButton
												fullWidth
												fw={500}
												fz={"xs"}
											>
												{d.name}
											</StyledButton>
										</Grid.Col>
									))}
								</Grid>
							</Stack>

							<Card bg={"#ecedfd"} radius={10}>
								<Stack gap={2}>
									<Text fw={600} size="xs" c={"gray.6"}>
										Campaign Schedule:
									</Text>
									<Text size="xs" c={"gray.6"}>
										Wednesday, February 18th, 2026 → Sunday,
										April 19th, 2026
									</Text>
								</Stack>
							</Card>
						</Stack>
					</Card>

					<Divider size={"xs"} color="gray.1" />

					<Text fw={500} size="sm">
						More Information
					</Text>

					<StyledButton
						leftSection={
							<IconShare3 size={18} color={T.colors.gray[9]} />
						}
					>
						Read more on SharePoint
					</StyledButton>

					<Divider size={"xs"} color="gray.1" />

					<Button
						fullWidth
						radius={10}
						color="blue.3"
						leftSection={<IconPlus size={15} />}
					>
						Add to Plan
					</Button>

					<Grid gutter={10}>
						<Grid.Col span={8}>
							<StyledButton
								fullWidth
								leftSection={
									<IconEdit
										size={18}
										color={T.colors.gray[9]}
									/>
								}
							>
								Edit Dates
							</StyledButton>
						</Grid.Col>

						<Grid.Col span={4}>
							<Button
								fullWidth
								radius={10}
								color="red.4"
								leftSection={<IconX size={15} />}
							>
								Remove
							</Button>
						</Grid.Col>
					</Grid>

					<Text fw={700} size="xs" ta={"center"}>
						Adding to{" "}
						<Text span fw={700} c="blue.4">
							Downtown Vision Center
						</Text>
					</Text>
				</Stack>
			</Drawer>

			{/* Editing Card */}
			<Modal
				opened={editOpened}
				onClose={closeEdit}
				title={
					<Stack gap={0}>
						<Flex align={"center"} gap={7}>
							<IconEdit color={T.colors.blue[3]} size={22} />
							<Title order={4} fw={600}>
								Edit Campaign
							</Title>
						</Flex>

						<Text size="sm" c="gray.8">
							Modify the details for{" "}
							<Text span c="blue.4" fw={700}>
								"Back to School Eye Exams"
							</Text>
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size={"33rem"}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<Stack gap={20}>
					<Card radius={10} bg={Colors.cream}>
						<Stack gap={7}>
							<Text fw={500}>Back to School Eye Exams</Text>
							<Text size="sm" c="gray.7">
								Promote comprehensive eye exams for school-age
								children
							</Text>
							<Group align="center" gap={5} mt={5}>
								<Objectives noTitle />
								<Topics noTitle />
							</Group>
						</Stack>
					</Card>

					<Select
						radius={10}
						label="Status"
						data={filterData.status}
						renderOption={renderSelectOption}
					/>
				</Stack>
			</Modal>
		</>
	);
};

export default CampaignCard;
