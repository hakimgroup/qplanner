import StyledButton from "@/components/styledButton/StyledButton";
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Grid,
	Modal,
	Stack,
	Text,
	useMantineTheme,
	Highlight} from "@mantine/core";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { useDisclosure } from "@mantine/hooks";
import {
	IconBolt,
	IconCrown,
	IconStar,
	IconTarget,
	IconTrendingUp} from "@tabler/icons-react";
import { useContext, useEffect, useMemo, useState } from "react";
import cl from "./quick.module.scss";
import clsx from "clsx";
import { upperFirst } from "lodash";
import { usePractice } from "@/shared/PracticeProvider";
import { useBulkAddCampaignsWithAssets } from "@/hooks/campaign.hooks";
import { SelectionsSource } from "@/shared/shared.models";
import { Campaign } from "@/models/campaign.models";
import { toast } from "sonner";
import { useTiers } from "@/shared/TierProvider";
import AppContext from "@/shared/AppContext";
import { updateState } from "@/shared/shared.utilities";
import { UserTabModes } from "@/models/general.models";
import { useIsMobile } from "@/shared/shared.hooks";

enum Tiers {
	Good = "good",
	Better = "better",
	Best = "best"}

const Quick = () => {
	const T = useMantineTheme();
	const isMobile = useIsMobile();
	const { state, setState } = useContext(AppContext);
	const { activePracticeName } = usePractice();
	const { goodIds, betterIds, bestIds, loading, refresh } = useTiers();
	const [opened, { open, close }] = useDisclosure(false);
	const [tier, setTier] = useState<Tiers>(null);
	const [selections, setSelections] = useState<string[]>(null);

	//APIs
	const { mutate: bulkAdd, isPending: adding } = useBulkAddCampaignsWithAssets();

	// Derive tier counts from the live catalog so the badges + bullets always
	// match the IDs that will actually be added.
	const tierCounts = useMemo(() => {
		const catalog = (state?.allCampaigns?.data ?? []) as Campaign[];
		const byId = new Map(catalog.map((c) => [String(c.id), c]));
		const compute = (ids: string[]) => {
			const inTier = ids
				.map((id) => byId.get(String(id)))
				.filter((c): c is Campaign => Boolean(c));
			const seasonalEvents = inTier.filter(
				(c) => c.category === "Event" || c.is_event === true
			).length;
			const brandActivations = inTier.filter(
				(c) => c.category === "brand activation"
			).length;
			return {
				total: ids.length,
				events: seasonalEvents + brandActivations,
				seasonalEvents,
				brandActivations,
			};
		};
		return {
			[Tiers.Good]: compute(goodIds),
			[Tiers.Better]: compute(betterIds),
			[Tiers.Best]: compute(bestIds),
		} as const;
	}, [state?.allCampaigns?.data, goodIds, betterIds, bestIds]);

	const pluralize = (n: number, word: string) =>
		`${n} ${word}${n === 1 ? "" : "s"}`;
	const eventsBullet = (
		seasonalEvents: number,
		brandActivations: number
	): string => {
		const parts: string[] = [];
		if (seasonalEvents > 0)
			parts.push(pluralize(seasonalEvents, "seasonal event"));
		if (brandActivations > 0)
			parts.push(pluralize(brandActivations, "brand activation"));
		return parts.length ? parts.join(" and ") : "Seasonal events as scheduled";
	};

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
			numberOfCampaigns: tierCounts[Tiers.Good].total,
			numberOfEvents: tierCounts[Tiers.Good].events,
			inclusions: [
				`${tierCounts[Tiers.Good].total} campaigns for the year`,
				"Always-on: Google Reviews Pack (all year)",
				eventsBullet(
					tierCounts[Tiers.Good].seasonalEvents,
					tierCounts[Tiers.Good].brandActivations
				),
			],
			includedCampaigns: goodIds,
			snapshot: {
				info: "Essential foundations to stay visible all year — quarterly campaigns, core assets, light community activity.",
				budget: "£1,500 (flex up/down based on asset and activation scope)."}},
		{
			color: "blue.3",
			tag: "Standard",
			icon: <IconTrendingUp size={30} />,
			variant: "filled",
			name: Tiers.Better,
			description: "Balanced mix for steady growth",
			numberOfCampaigns: tierCounts[Tiers.Better].total,
			numberOfEvents: tierCounts[Tiers.Better].events,
			inclusions: [
				`${tierCounts[Tiers.Better].total} campaigns for the year`,
				"Always-on: Google Reviews Pack + light monthly social (all year)",
				eventsBullet(
					tierCounts[Tiers.Better].seasonalEvents,
					tierCounts[Tiers.Better].brandActivations
				),
			],
			includedCampaigns: betterIds,
			snapshot: {
				info: "Balanced calendar for steady growth — more campaigns, stronger windows/POS, and one or two standout activations.",
				budget: "£2,500 (flex with bespoke assets or local media)."}},
		{
			color: "grape.8",
			tag: "Premium",
			icon: <IconCrown size={30} />,
			variant: "filled",
			name: Tiers.Best,
			description: "Maximum impact with always-on strategy",
			numberOfCampaigns: tierCounts[Tiers.Best].total,
			numberOfEvents: tierCounts[Tiers.Best].events,
			inclusions: [
				`${tierCounts[Tiers.Best].total} campaigns for the year`,
				"Always-on: Google Reviews Pack + monthly pulses (all year)",
				eventsBullet(
					tierCounts[Tiers.Best].seasonalEvents,
					tierCounts[Tiers.Best].brandActivations
				),
			],
			includedCampaigns: bestIds,
			snapshot: {
				info: "Always-on, growth-focused presence — multiple campaigns per quarter, premium creative, events and targeted media.",
				budget: "£3,750+ (flex for event scale, production and paid activity)."}},
	];

	const handleConfirm = () => {
		if (!selections?.length) return;
		const catalog = (state?.allCampaigns?.data ?? []) as Campaign[];
		const idSet = new Set(selections.map(String));
		const campaigns = catalog.filter((c) => idSet.has(String(c.id)));

		if (!campaigns.length) {
			toast.error("Could not find campaign data for selected tier");
			return;
		}

		bulkAdd(
			{
				campaigns,
				from: null,
				to: null,
				source: SelectionsSource.Quick,
			},
			{
				onSuccess: () => {
					close();
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
			fullScreen={isMobile}
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

								<GradientDivider mt={20} />

								<Card
									radius={10}
									bg={"violet.0"}
									style={{
										border: `1px solid ${T.colors.violet[1]}`}}
									shadow="xs"
								>
									<Stack gap={10}>
										<Text fw={600} size="sm" c="gray.9">
											Strategy Snapshot
										</Text>

										<Text size="xs" fw={500} c="gray.7">
											{t.snapshot.info}
										</Text>

										<Stack gap={5}>
											<Text fw={700} size="xs" c="lime.9">
												Recommended Annual Budget:
											</Text>
											<Highlight
												highlight={[
													"£1,500",
													"£2,500",
													"£3,750+",
												]}
												size="xs"
												fw={500}
												c="gray.7"
												highlightStyles={{
													fontWeight: 800,
													backgroundColor:
														"transparent",
													color: T.colors.blue[3]}}
											>
												{t.snapshot.budget}
											</Highlight>
										</Stack>
									</Stack>
								</Card>

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
						disabled={!tier}
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
