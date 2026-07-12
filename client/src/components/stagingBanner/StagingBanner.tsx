import { Box, Flex, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useEffect } from "react";

/**
 * Sticky amber banner rendered at the top of every page when the build is the
 * staging environment. Visible because the build was made with VITE_ENV=staging.
 *
 * Mounted in App.tsx above the Nav so it's always the first thing visible.
 * Also swaps the favicon to an amber "S" tile so the browser tab is distinct.
 */
const STAGING_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7264e9"/><stop offset="1" stop-color="#d64ca8"/></linearGradient></defs><rect width="32" height="32" rx="6" fill="url(#g)"/><text x="16" y="23" font-family="system-ui" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">S</text></svg>`;

export default function StagingBanner() {
	const isStaging = import.meta.env.VITE_ENV === "staging";

	useEffect(() => {
		if (!isStaging) return;
		const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
		if (!link) return;
		const originalHref = link.href;
		link.type = "image/svg+xml";
		link.href = `data:image/svg+xml;utf8,${encodeURIComponent(STAGING_FAVICON_SVG)}`;
		return () => {
			link.href = originalHref;
		};
	}, [isStaging]);

	if (!isStaging) return null;

	return (
		<Box
			style={{
				position: "sticky",
				top: 0,
				// Above the nav (z-index 10) but below Mantine modals/drawers
				// (default z-index 200) so overlays render on top of the banner.
				zIndex: 100,
				background:
					"linear-gradient(90deg, #7264e9 0%, #a155d5 50%, #d64ca8 100%)",
				borderBottom: "1px solid rgba(0, 0, 0, 0.18)",
				color: "#ffffff",
				fontSize: 12,
				fontWeight: 700,
				letterSpacing: 0.4,
				textTransform: "uppercase",
			}}
		>
			<Flex
				justify="center"
				align="center"
				gap={8}
				py={6}
				px="md"
			>
				<IconAlertTriangle size={14} stroke={2.5} />
				<Text
					size="xs"
					fw={700}
					style={{ letterSpacing: 0.6 }}
				>
					Staging environment — not real data
				</Text>
				<Text size="xs" fw={500} c="rgba(255, 255, 255, 0.78)" ml={8}>
					Changes here don't affect production
				</Text>
			</Flex>
		</Box>
	);
}
