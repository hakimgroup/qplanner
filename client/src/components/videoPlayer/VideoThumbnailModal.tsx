import { useState } from "react";
import {
	Modal,
	AspectRatio,
	Box,
	Center,
	useMantineTheme,
	Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlayerPlay, IconPlayerPlayFilled } from "@tabler/icons-react";
import cl from "./videoThumbnailModal.module.scss";

export function VideoThumbnailModal({ useButton = false, fullWidth = false }) {
	const T = useMantineTheme().colors;

	// Your link (kept here for reference)
	// https://vimeo.com/1124869260/c60ca35a1e?share=copy

	// Vimeo player URL (uses your video ID + hash)
	const EMBED_URL =
		"https://player.vimeo.com/video/1124869260?h=c60ca35a1e&autoplay=1&muted=1&title=0&byline=0&portrait=0";

	const [opened, { open, close }] = useDisclosure(false);
	const [mounted, setMounted] = useState(false); // mount iframe only when opened

	const handleOpen = () => {
		setMounted(true);
		open();
	};

	const handleClose = () => {
		close();
		setMounted(false); // unmount to stop playback
	};

	return (
		<>
			{useButton ? (
				<Button
					fullWidth={fullWidth}
					leftSection={<IconPlayerPlay size={14} />}
					onClick={handleOpen}
					onKeyDown={(e) =>
						(e.key === "Enter" || e.key === " ") && handleOpen()
					}
				>
					Watch Tutorial
				</Button>
			) : (
				<AspectRatio ratio={16 / 9} w="100%">
					<Box
						className={cl.thumbnail}
						role="button"
						aria-label="Play video"
						tabIndex={0}
						onClick={handleOpen}
						onKeyDown={(e) =>
							(e.key === "Enter" || e.key === " ") && handleOpen()
						}
					>
						<Center className={cl.play}>
							<IconPlayerPlayFilled
								size={30}
								color={T.violet[9]}
							/>
						</Center>
					</Box>
				</AspectRatio>
			)}

			<Modal
				opened={opened}
				onClose={handleClose}
				size="90rem"
				radius={10}
				withCloseButton
				centered
				title=" "
				overlayProps={{ opacity: 0.5, blur: 3 }}
			>
				<AspectRatio ratio={16 / 9}>
					{mounted && (
						<iframe
							src={EMBED_URL}
							allow="autoplay; fullscreen; picture-in-picture"
							allowFullScreen
							title="Vimeo video player"
							style={{
								width: "100%",
								height: "100%",
								border: 0,
								borderRadius: 8,
							}}
						/>
					)}
				</AspectRatio>
			</Modal>
		</>
	);
}
