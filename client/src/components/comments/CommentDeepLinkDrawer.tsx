import {
	Badge,
	Drawer,
	Group,
	Loader,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { IconBuildings, IconMessageCircle2 } from "@tabler/icons-react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabase";
import { useIsMobile } from "@/shared/shared.hooks";
import CommentsSection from "./CommentsSection";
import Status from "@/components/status/Status";

interface DrawerContext {
	selectionId: string;
	campaignName: string | null;
	practiceName: string | null;
	status: string | null;
}

interface CommentDrawerControls {
	open: (selectionId: string) => void;
}

const CommentDrawerCtx = createContext<CommentDrawerControls | null>(null);

export function useCommentDrawer(): CommentDrawerControls {
	const v = useContext(CommentDrawerCtx);
	if (!v) {
		// Soft fallback so callers don't crash if the provider isn't mounted yet.
		return { open: () => undefined };
	}
	return v;
}

/**
 * Mounts a single drawer that can be opened either:
 *   - imperatively via `useCommentDrawer().open(selectionId)` (used by the bell), or
 *   - declaratively via `?selectionId=…&focus=comments` (used by email CTAs).
 */
export default function CommentDrawerProvider({ children }: { children: ReactNode }) {
	const { search, pathname } = useLocation();
	const navigate = useNavigate();
	const T = useMantineTheme().colors;
	const isMobile = useIsMobile();

	const [opened, setOpened] = useState(false);
	const [ctx, setCtx] = useState<DrawerContext | null>(null);
	const [loading, setLoading] = useState(false);

	const loadAndOpen = useCallback(async (selectionId: string) => {
		setLoading(true);
		setOpened(true);
		try {
			const { data: sel } = await supabase
				.from("selections")
				.select("id, status, practice_id, campaign_id, bespoke_campaign_id")
				.eq("id", selectionId)
				.single();

			if (!sel) return;

			let campaignName: string | null = null;
			if (sel.campaign_id) {
				const { data: cc } = await supabase
					.from("campaigns_catalog")
					.select("name")
					.eq("id", sel.campaign_id)
					.single();
				campaignName = cc?.name ?? null;
			} else if (sel.bespoke_campaign_id) {
				const { data: bc } = await supabase
					.from("bespoke_campaigns")
					.select("name")
					.eq("id", sel.bespoke_campaign_id)
					.single();
				campaignName = bc?.name ?? null;
			}

			const { data: practice } = await supabase
				.from("practices")
				.select("name")
				.eq("id", sel.practice_id)
				.single();

			setCtx({
				selectionId: sel.id,
				campaignName,
				practiceName: practice?.name ?? null,
				status: sel.status,
			});
		} finally {
			setLoading(false);
		}
	}, []);

	const open = useCallback(
		(selectionId: string) => {
			void loadAndOpen(selectionId);
		},
		[loadAndOpen],
	);

	// React to email deep-links (?selectionId=…&focus=comments).
	useEffect(() => {
		const params = new URLSearchParams(search);
		const selectionId = params.get("selectionId");
		const focus = params.get("focus");
		if (!selectionId || focus !== "comments") return;

		void loadAndOpen(selectionId);
		// Strip query so refresh/back doesn't reopen.
		navigate(pathname, { replace: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search]);

	const close = () => {
		setOpened(false);
		setCtx(null);
	};

	return (
		<CommentDrawerCtx.Provider value={{ open }}>
			{children}
			<Drawer
				opened={opened}
				onClose={close}
				position="right"
				size={isMobile ? "100%" : 520}
				padding="md"
				withCloseButton
				title={
					<Group gap={8} align="center">
						<IconMessageCircle2 size={18} color={T.violet[6]} />
						<Text fw={700} size="sm" c="gray.9">
							Conversation
						</Text>
					</Group>
				}
				styles={{
					header: { borderBottom: `1px solid ${T.gray[2]}` },
				}}
			>
				{loading && !ctx && (
					<Stack align="center" justify="center" py={40}>
						<Loader size="sm" />
						<Text size="xs" c="gray.5">
							Loading conversation…
						</Text>
					</Stack>
				)}

				{ctx && (
					<Stack gap="md" pt="sm">
						<Stack gap={6}>
							<Text fw={700} size="md" c="gray.9">
								{ctx.campaignName ?? "Campaign"}
							</Text>
							<Group gap={6} align="center">
								{ctx.practiceName && (
									<Badge
										variant="light"
										color="blue"
										leftSection={<IconBuildings size={11} />}
										radius="sm"
									>
										{ctx.practiceName}
									</Badge>
								)}
								<Status status={ctx.status} />
							</Group>
						</Stack>

						<CommentsSection
							selectionId={ctx.selectionId}
							status={ctx.status}
							scrollIntoView
						/>
					</Stack>
				)}
			</Drawer>
		</CommentDrawerCtx.Provider>
	);
}
