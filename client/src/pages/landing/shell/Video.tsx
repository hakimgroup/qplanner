import { Box, Stack, Text, useMantineTheme } from "@mantine/core";

interface VideoProps {
	src: string;
	title?: string;
	caption?: string;
	aspectRatio?: "16:9" | "4:3" | "1:1";
}

const ratioMap: Record<string, string> = {
	"16:9": "56.25%",
	"4:3": "75%",
	"1:1": "100%",
};

/**
 * Embedded video. Accepts:
 *   - YouTube watch URLs (https://youtube.com/watch?v=ID, https://youtu.be/ID)
 *   - Vimeo URLs (https://vimeo.com/ID)
 *   - Direct iframe embed URLs
 *   - Self-hosted video files (.mp4, .webm) — rendered with <video controls>
 */
export default function Video({
	src,
	title = "Video",
	caption,
	aspectRatio = "16:9",
}: VideoProps) {
	const T = useMantineTheme().colors;
	const embed = toEmbedUrl(src);
	const isFile = /\.(mp4|webm|ogg)(\?|$)/i.test(src);

	return (
		<Stack gap={8} my={32}>
			<Box
				style={{
					position: "relative",
					width: "100%",
					paddingTop: ratioMap[aspectRatio] ?? ratioMap["16:9"],
					borderRadius: 12,
					overflow: "hidden",
					background: "#000",
					boxShadow: "0 10px 30px rgba(45, 25, 95, 0.10)",
					border: `1px solid ${T.gray[1]}`,
				}}
			>
				{isFile ? (
					<video
						src={src}
						controls
						style={{
							position: "absolute",
							inset: 0,
							width: "100%",
							height: "100%",
							objectFit: "cover",
						}}
					/>
				) : (
					<iframe
						src={embed}
						title={title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						style={{
							position: "absolute",
							inset: 0,
							width: "100%",
							height: "100%",
							border: 0,
						}}
					/>
				)}
			</Box>
			{caption && (
				<Text size="xs" c="gray.6" ta="center" fs="italic">
					{caption}
				</Text>
			)}
		</Stack>
	);
}

function toEmbedUrl(src: string): string {
	try {
		const url = new URL(src);
		// youtu.be/<id>
		if (url.hostname === "youtu.be") {
			const id = url.pathname.replace(/^\//, "");
			return `https://www.youtube.com/embed/${id}`;
		}
		// youtube.com/watch?v=<id>
		if (url.hostname.endsWith("youtube.com")) {
			if (url.pathname === "/watch") {
				const id = url.searchParams.get("v");
				if (id) return `https://www.youtube.com/embed/${id}`;
			}
			// already an embed url
			return src;
		}
		// vimeo.com/<id>
		if (url.hostname.endsWith("vimeo.com")) {
			const id = url.pathname.replace(/^\//, "");
			return `https://player.vimeo.com/video/${id}`;
		}
		return src;
	} catch {
		return src;
	}
}
