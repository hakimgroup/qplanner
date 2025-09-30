import StyledButton from "@/components/styledButton/StyledButton";
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Flex,
	Grid,
	Modal,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconBolt,
	IconCrown,
	IconStar,
	IconTarget,
	IconTrendingUp,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import cl from "./quick.module.scss";
import clsx from "clsx";
import { upperFirst } from "lodash";
import { usePractice } from "@/shared/PracticeProvider";
import { useBulkAddCampaigns } from "@/hooks/campaign.hooks";
import { addDays } from "date-fns";
import { SelectionsSource, SelectionStatus } from "@/shared/shared.models";
import { toast } from "sonner";
import { useTiers } from "@/shared/TierProvider";

enum Tiers {
	Good = "good",
	Better = "better",
	Best = "best",
}

const Quick = () => {
	const T = useMantineTheme();
	const { activePracticeName } = usePractice();
	const { goodIds, betterIds, bestIds, loading, refresh } = useTiers();
	const [opened, { open, close }] = useDisclosure(false);
	const [tier, setTier] = useState<Tiers>(Tiers.Better);
	const [selections, setSelections] = useState<string[]>([]);

	//APIs
	const { mutate: bulkAdd, isPending: adding } = useBulkAddCampaigns();

	const tiers = [
		{
			color: "gray.5",
			tag: "Basic",
			icon: (
				<IconTarget size={30} stroke={1.5} color={T.colors.gray[8]} />
			),
			variant: "light",
			name: Tiers.Good,
			description: "Essential campaigns to get started",
			numberOfCampaigns: 4,
			numberOfEvents: 1,
			inclusions: [
				"4 campaigns for the year",
				"Always-on: Google Reviews Pack (all year)",
				"1 seasonal event",
			],
			includedCampaigns: goodIds,
		},
		{
			color: "blue.3",
			tag: "Standard",
			icon: <IconTrendingUp size={30} />,
			variant: "filled",
			name: Tiers.Better,
			description: "Balanced mix for steady growth",
			numberOfCampaigns: 7,
			numberOfEvents: 2,
			inclusions: [
				"7 campaigns for the year",
				"Always-on: Google Reviews Pack + light monthly social (all year)",
				"1 seasonal event and 1 brand activation",
			],
			includedCampaigns: betterIds,
		},
		{
			color: "grape.8",
			tag: "Premium",
			icon: <IconCrown size={30} />,
			variant: "filled",
			name: Tiers.Best,
			description: "Maximum impact with always-on strategy",
			numberOfCampaigns: 10,
			numberOfEvents: 4,
			inclusions: [
				"10 campaigns for the year",
				"Always-on: Google Reviews Pack + monthly pulses (all year)",
				"2 seasonal events and 2 brand activations",
			],
			includedCampaigns: bestIds,
		},
	];

	const handleConfirm = () => {
		bulkAdd(
			{
				campaignIds: selections, // array of catalog campaign IDs
				from: null,
				to: null,
				status: SelectionStatus.OnPlan,
				notes: null,
				source: SelectionsSource.Quick,
			},
			{
				onSuccess: () => {
					toast.success("Campaigns added to plan");
					close(); // cache invalidation is handled inside the hook
				},
				onError: (e: any) => {
					toast.error(e?.message ?? "Failed to add campaigns");
				},
			}
		);
	};

	useEffect(() => {
		refresh();
	}, []);

	return (
		<>
			<StyledButton
				fw={500}
				leftSection={<IconBolt size={14} />}
				onClick={open}
			>
				Quick Populate
			</StyledButton>

			<Modal
				opened={opened}
				onClose={close}
				title={
					<Stack gap={0}>
						<Flex align={"center"} gap={10}>
							<IconBolt color={T.colors.blue[3]} size={21} />
							<Text fz={"h4"} fw={600}>
								Quick Populate - Choose Your Tier
							</Text>
						</Flex>
						<Text size="sm" c="gray.8">
							Select a campaign tier that matches your budget and
							marketing goals for{" "}
							<Text span fw={700} c="blue.3">
								{activePracticeName}.
							</Text>{" "}
							<Text span fw={700} c="gray.9">
								Selecting a tier will pre-populate your 2025
								calendar; you can edit or remove items anytime.
							</Text>
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size={"56rem"}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<Grid gutter={15}>
					{tiers.map((t) => (
						<Grid.Col span={4} key={t.name} pt={20}>
							<Card
								radius={10}
								p={20}
								className={clsx(
									cl["quick-card"],
									tier === t.name && cl.active
								)}
								onClick={() => {
									setTier(t.name);
									setSelections(t.includedCampaigns);
								}}
							>
								<Flex
									align={"center"}
									justify={"space-between"}
								>
									<Stack gap={3} align="center">
										<ActionIcon
											radius={10}
											size={"input-lg"}
											variant={t.variant}
											color={t.color}
										>
											{t.icon}
										</ActionIcon>
										<Text fw={600} size="lg">
											{upperFirst(t.name)}
										</Text>
									</Stack>

									<Badge variant="outline" color="gray.1">
										<Text
											size="xs"
											fw={600}
											c={"gray.9"}
											mt={1}
										>
											{t.tag}
										</Text>
									</Badge>
								</Flex>

								<Text size="sm" c={"gray.6"} mt={5} mih={40}>
									{t.description}
								</Text>

								<Flex
									align={"center"}
									justify={"center"}
									gap={50}
									mt={10}
								>
									<Stack gap={0} align="center">
										<Text fz={"h2"} fw={700} c="blue.3">
											{t.numberOfCampaigns}
										</Text>
										<Text size="xs" c="gray.7" mt={-5}>
											Campaigns
										</Text>
									</Stack>

									<Stack gap={0} align="center">
										<Text fz={"h2"} fw={700} c="red.4">
											{t.numberOfEvents}
										</Text>
										<Text size="xs" c="gray.7" mt={-5}>
											Activations
										</Text>
									</Stack>
								</Flex>

								<Divider size={"xs"} color="gray.0" mt={20} />

								<Box mt={20}>
									<Text size="sm" c={"gray.9"} fw={600}>
										Includes:
									</Text>

									<Stack gap={10} mt={5}>
										{t.inclusions.map((inc) => (
											<Flex
												gap={5}
												align="center"
												key={inc}
											>
												<Box>
													<IconStar
														size={12}
														color={T.colors.blue[3]}
													/>
												</Box>
												<Text size="xs" c={"gray.6"}>
													{inc}
												</Text>
											</Flex>
										))}
									</Stack>
								</Box>
							</Card>
						</Grid.Col>
					))}
				</Grid>

				<Flex justify={"flex-end"} mt={15} gap={8}>
					<StyledButton>Cancel</StyledButton>
					<Button
						radius={10}
						color="blue.3"
						loading={adding}
						onClick={handleConfirm}
					>
						Continue with {upperFirst(tier)}
					</Button>
				</Flex>
			</Modal>
		</>
	);
};

export default Quick;
