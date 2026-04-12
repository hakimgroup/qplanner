import {
	Box,
	Stack,
	Text,
	useMantineTheme,
	rgba,
} from "@mantine/core";

interface Props {
	template: "simple" | "action" | "announcement";
	subject?: string;
	body?: string;
	practiceName?: string;
	ctaText?: string;
	selected?: boolean;
	onClick?: () => void;
	/** Full-width preview (not card-sized) */
	fullSize?: boolean;
}

const PLACEHOLDER_SUBJECT = "Your subject line here";
const PLACEHOLDER_BODY =
	"This is where your message will appear. Each line break you add will be preserved in the final email.";
const PLACEHOLDER_CTA = "Open QPlanner";

export default function EmailTemplatePreview({
	template,
	subject,
	body,
	practiceName = "Practice Name",
	ctaText,
	selected,
	onClick,
	fullSize,
}: Props) {
	const T = useMantineTheme().colors;
	const displaySubject = subject?.trim() || PLACEHOLDER_SUBJECT;
	const displayBody = body?.trim() || PLACEHOLDER_BODY;
	const displayCta = ctaText?.trim() || PLACEHOLDER_CTA;
	const isPlaceholder = !subject?.trim();
	const scale = fullSize ? 1 : 0.65;

	const logo = (
		<Box
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: fullSize ? 48 : 28,
				height: fullSize ? 48 : 28,
				backgroundColor: "#7b2eda",
				borderRadius: fullSize ? 12 : 8,
				padding: fullSize ? 8 : 4,
			}}
		>
			<img
				src="https://i.postimg.cc/0Q5wP963/hg-icon-white-rgb.png"
				alt="HG"
				style={{
					display: "block",
					width: "100%",
					height: "100%",
					objectFit: "contain",
				}}
			/>
		</Box>
	);

	const footer = (
		<Text
			ta="center"
			size="10px"
			c="gray.5"
			mt="sm"
			style={{ fontSize: 10 * scale }}
		>
			QPlanner — Hakim Group
		</Text>
	);

	const bodyLines = displayBody.split("\n").slice(0, fullSize ? 20 : 3);

	const containerStyle: React.CSSProperties = {
		borderRadius: fullSize ? 12 : 10,
		overflow: "hidden",
		cursor: onClick ? "pointer" : undefined,
		border: selected
			? `2px solid ${T.violet[5]}`
			: `1px solid ${T.gray[2]}`,
		boxShadow: selected
			? `0 0 0 3px ${rgba(T.violet[5], 0.15)}`
			: "0 1px 3px rgba(0,0,0,0.06)",
		transition: "all 150ms ease",
		background: "#faf8fd",
	};

	const emailBox: React.CSSProperties = {
		background: "white",
		padding: fullSize ? "32px 28px" : `${20 * scale}px ${16 * scale}px`,
		margin: fullSize ? "0 20px" : `0 ${12 * scale}px`,
		borderRadius: 6,
	};

	if (template === "simple") {
		return (
			<Box style={containerStyle} onClick={onClick}>
				<Box py={fullSize ? "lg" : "sm"} style={{ background: "#faf8fd" }}>
					<Stack gap={fullSize ? "sm" : 6} align="center">
						{logo}
					</Stack>
				</Box>
				<Box style={emailBox}>
					<Text
						ta="center"
						fw={700}
						c={isPlaceholder ? "gray.4" : "gray.9"}
						style={{ fontSize: fullSize ? 18 : 13 * scale }}
						lineClamp={fullSize ? undefined : 1}
					>
						{displaySubject}
					</Text>
					<Text
						ta="center"
						c="gray.5"
						mt={4}
						style={{ fontSize: fullSize ? 12 : 9 * scale }}
					>
						For {practiceName}
					</Text>
					<Box
						mt="sm"
						style={{
							height: 1,
							background: `linear-gradient(to right, transparent, ${T.violet[3]}, transparent)`,
						}}
					/>
					<Stack gap={2} mt="sm">
						{bodyLines.map((line, i) => (
							<Text
								key={i}
								c={isPlaceholder ? "gray.4" : "gray.7"}
								style={{ fontSize: fullSize ? 14 : 10 * scale }}
								lineClamp={fullSize ? undefined : 1}
							>
								{line || "\u00A0"}
							</Text>
						))}
						{!fullSize && displayBody.split("\n").length > 3 && (
							<Text c="gray.4" style={{ fontSize: 9 * scale }}>
								...
							</Text>
						)}
					</Stack>
				</Box>
				<Box py={fullSize ? "md" : "xs"}>{footer}</Box>
			</Box>
		);
	}

	if (template === "action") {
		return (
			<Box style={containerStyle} onClick={onClick}>
				<Box py={fullSize ? "lg" : "sm"} style={{ background: "#faf8fd" }}>
					<Stack gap={fullSize ? "sm" : 6} align="center">
						{logo}
					</Stack>
				</Box>
				<Box style={emailBox}>
					<Box
						style={{
							display: "inline-block",
							backgroundColor: "#fff3ed",
							color: "#ff7f50",
							padding: fullSize
								? "5px 14px"
								: `${3 * scale}px ${8 * scale}px`,
							borderRadius: 14,
							fontSize: fullSize ? 11 : 8 * scale,
							fontWeight: 700,
							textTransform: "uppercase",
							letterSpacing: 0.5,
							marginBottom: fullSize ? 12 : 6,
						}}
					>
						Action Required
					</Box>
					<Text
						ta="center"
						fw={700}
						c={isPlaceholder ? "gray.4" : "gray.9"}
						style={{ fontSize: fullSize ? 18 : 13 * scale }}
						lineClamp={fullSize ? undefined : 1}
					>
						{displaySubject}
					</Text>
					<Text
						ta="center"
						c="gray.5"
						mt={4}
						style={{ fontSize: fullSize ? 12 : 9 * scale }}
					>
						For {practiceName}
					</Text>
					<Box
						mt="sm"
						style={{
							height: 1,
							background: `linear-gradient(to right, transparent, ${T.violet[3]}, transparent)`,
						}}
					/>
					<Stack gap={2} mt="sm">
						{bodyLines.map((line, i) => (
							<Text
								key={i}
								c={isPlaceholder ? "gray.4" : "gray.7"}
								style={{ fontSize: fullSize ? 14 : 10 * scale }}
								lineClamp={fullSize ? undefined : 1}
							>
								{line || "\u00A0"}
							</Text>
						))}
					</Stack>
					<Box mt="md" style={{ textAlign: "center" }}>
						<Box
							style={{
								display: "inline-block",
								backgroundColor: "#7b2eda",
								color: "white",
								padding: fullSize
									? "10px 24px"
									: `${6 * scale}px ${14 * scale}px`,
								borderRadius: 6,
								fontSize: fullSize ? 13 : 9 * scale,
								fontWeight: 700,
							}}
						>
							{displayCta}
						</Box>
					</Box>
				</Box>
				<Box py={fullSize ? "md" : "xs"}>{footer}</Box>
			</Box>
		);
	}

	// announcement
	return (
		<Box style={containerStyle} onClick={onClick}>
			<Box py={fullSize ? "lg" : "sm"} style={{ background: "#faf8fd" }}>
				<Stack gap={fullSize ? "sm" : 6} align="center">
					{logo}
				</Stack>
			</Box>
			{/* Hero banner */}
			<Box
				style={{
					background: "linear-gradient(135deg, #7b2eda 0%, #4f46e5 100%)",
					padding: fullSize
						? "32px 28px 24px"
						: `${18 * scale}px ${14 * scale}px ${14 * scale}px`,
					margin: fullSize ? "0 20px" : `0 ${12 * scale}px`,
					borderRadius: "6px 6px 0 0",
					textAlign: "center" as const,
				}}
			>
				<Text
					fw={700}
					c="white"
					style={{ fontSize: fullSize ? 20 : 13 * scale, lineHeight: 1.3 }}
					lineClamp={fullSize ? undefined : 2}
				>
					{displaySubject}
				</Text>
				<Text
					c="rgba(255,255,255,0.7)"
					mt={4}
					style={{ fontSize: fullSize ? 12 : 9 * scale }}
				>
					{practiceName}
				</Text>
			</Box>
			{/* Body below banner */}
			<Box
				style={{
					background: "white",
					padding: fullSize
						? "24px 28px 32px"
						: `${14 * scale}px ${14 * scale}px ${16 * scale}px`,
					margin: fullSize ? "0 20px" : `0 ${12 * scale}px`,
					borderRadius: "0 0 6px 6px",
				}}
			>
				<Stack gap={2}>
					{bodyLines.map((line, i) => (
						<Text
							key={i}
							c={isPlaceholder ? "gray.4" : "gray.7"}
							style={{ fontSize: fullSize ? 14 : 10 * scale }}
							lineClamp={fullSize ? undefined : 1}
						>
							{line || "\u00A0"}
						</Text>
					))}
				</Stack>
				{(ctaText?.trim() || template === "announcement") && (
					<Box mt="md" style={{ textAlign: "center" }}>
						<Box
							style={{
								display: "inline-block",
								backgroundColor: "#7b2eda",
								color: "white",
								padding: fullSize
									? "10px 24px"
									: `${6 * scale}px ${14 * scale}px`,
								borderRadius: 6,
								fontSize: fullSize ? 13 : 9 * scale,
								fontWeight: 700,
							}}
						>
							{displayCta}
						</Box>
					</Box>
				)}
			</Box>
			<Box py={fullSize ? "md" : "xs"}>{footer}</Box>
		</Box>
	);
}
