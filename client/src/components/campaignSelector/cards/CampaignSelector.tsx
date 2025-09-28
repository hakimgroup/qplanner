import {
	Grid,
	Group,
	LoadingOverlay,
	Stack,
	Text,
	TextInput,
	Title,
	Center,
	ThemeIcon,
	Flex,
	Card,
	useMatches,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import CampaignCard from "./CampaignCard";
import cl from "./campaignSelector.module.scss";
import { UserTabModes } from "@/models/general.models";
import AppContext from "@/shared/AppContext";
import { useContext, useMemo, useState } from "react";
import Bespoke from "../../campaignsSetup/bespoke/Bespoke";
import { useDebouncedValue } from "@mantine/hooks";
import StyledButton from "@/components/styledButton/StyledButton";
import { usePractice } from "@/shared/PracticeProvider";
import Event from "@/components/campaignsSetup/event/Event";

const CampaignSelectorCards = () => {
	const {
		state: {
			filters,
			allCampaigns: { data: filteredAppCampaigns, loading },
		},
	} = useContext(AppContext);
	const { unitedView } = usePractice();
	const spanCol = useMatches({
		base: 12,
		md: 6,
		lg: 4,
	});

	const isSelections = filters.userSelectedTab === UserTabModes.Selected;

	// Local search (applied on top of app-level filtering)
	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 200);

	// Safe default for campaigns array
	const campaigns = filteredAppCampaigns ?? [];

	// Apply local name search
	const viewCampaigns = useMemo(() => {
		const q = debounced.trim().toLowerCase();
		if (!q) return campaigns;
		return campaigns.filter((c: any) =>
			String(c?.name ?? "")
				.toLowerCase()
				.includes(q)
		);
	}, [campaigns, debounced]);

	const handleClearSearch = () => setQuery("");

	return (
		<Stack gap={20} className={cl["campaign-selector"]}>
			<Flex justify={"space-between"} align={"center"}>
				<Stack gap={5}>
					<Title order={3}>
						{isSelections
							? "Your Practice Campaigns"
							: "Select Marketing Campaigns"}
					</Title>
					<Text size="sm" c={"gray.8"}>
						{isSelections
							? "Manage your selected campaigns and track their progress"
							: "Browse and add campaigns to this practice plan"}
					</Text>
				</Stack>
				{!unitedView && (
					<Group gap={10}>
						<Bespoke />
						<Event />
					</Group>
				)}
			</Flex>

			<TextInput
				radius={10}
				size="sm"
				fz={"sm"}
				placeholder={
					isSelections
						? "Search your campaigns..."
						: "Search campaigns"
				}
				leftSection={<IconSearch size={18} />}
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
			/>

			<Group align="center" justify="space-between">
				<Text size="sm" c="gray.8">
					Showing{" "}
					<Text fw={700} c="blue.3" span>
						{viewCampaigns.length}
					</Text>{" "}
					campaigns
				</Text>
			</Group>

			<Grid gutter={22} mih={200} pos={"relative"}>
				<LoadingOverlay
					visible={loading}
					zIndex={1000}
					overlayProps={{ radius: "sm", blur: 2 }}
					color="blue.3"
				/>

				{/* Empty state */}
				{!loading && viewCampaigns.length === 0 && (
					<Grid.Col span={12}>
						<Center
							mih={220}
							style={{ textAlign: "center" }}
							mb={50}
						>
							<Stack gap={18} align="center">
								<ThemeIcon
									size={75}
									radius={100}
									variant="light"
								>
									<IconSearch size={30} />
								</ThemeIcon>
								<Title order={4}>No campaigns found</Title>
								<Text size="sm" c="gray.7">
									No campaigns match your current filters or
									search query.
								</Text>
								<StyledButton
									variant="default"
									onClick={handleClearSearch}
								>
									Clear Search & Filters
								</StyledButton>
							</Stack>
						</Center>
					</Grid.Col>
				)}

				{/* Results */}
				{!loading && viewCampaigns.length > 0 && (
					<>
						{viewCampaigns.map((c: any) => (
							<Grid.Col span={spanCol} key={c.id}>
								<CampaignCard {...c} />
							</Grid.Col>
						))}
					</>
				)}

				<Grid.Col span={12}>
					<Card>
						<Stack align="center">
							<Text c={"gray.6"}>
								Can't find what you need? Create a custom
								campaign or event.
							</Text>

							<Group gap={10}>
								<Bespoke buttonText="Add bespoke campaign" />
								<Event buttonText="Create bespoke event" />
							</Group>
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default CampaignSelectorCards;
