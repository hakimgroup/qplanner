/**
 * A single tile in the inspiration grid. Rendered as a real <button> so it's
 * keyboard-focusable and announced correctly — the whole card is the click
 * target, not just a "read more" link.
 */
import { Badge, Group, Text, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import type { CampaignEntry } from "./data";

interface CampaignCardProps {
	campaign: CampaignEntry;
	onOpen: (id: string) => void;
}

export default function CampaignCard({ campaign, onOpen }: CampaignCardProps) {
	return (
		<button
			type="button"
			className="insp__card"
			onClick={() => onOpen(campaign.id)}
			aria-label={`Open the ${campaign.title} case study`}
		>
			<div className="insp__card-media">
				<img
					className="insp__card-img"
					src={campaign.image}
					alt={campaign.imageAlt}
					loading="lazy"
				/>
				<div className="insp__card-scrim" />
				<Badge
					variant="filled"
					color="violet"
					radius="sm"
					tt="uppercase"
					style={{ position: "absolute", top: 12, left: 12 }}
				>
					{campaign.category}
				</Badge>
			</div>

			<div className="insp__card-body">
				<Text size="xs" fw={700} c="violet.7" tt="uppercase" lts={0.6}>
					{campaign.period}
				</Text>

				<Title order={3} c="gray.9" style={{ fontSize: 19, lineHeight: 1.25 }}>
					{campaign.title}
				</Title>

				<Text size="sm" c="gray.7" style={{ lineHeight: 1.5 }}>
					{campaign.summary}
				</Text>

				<Group gap={6} mt="auto" pt={8} wrap="nowrap">
					<Text size="xs" fw={700} c="violet.7">
						View case study
					</Text>
					<IconArrowRight size={14} style={{ color: "var(--mantine-color-violet-7)" }} />
				</Group>
			</div>
		</button>
	);
}
