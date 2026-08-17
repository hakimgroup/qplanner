import {
	ActionIcon,
	Box,
	Group,
	Paper,
	Stack,
	Text,
	ThemeIcon,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import {
	IconBulb,
	IconUsers,
	IconGift,
	IconPalette,
	IconAlertTriangle,
	IconBox,
	IconExternalLink,
	IconDownload,
	IconPhoto,
	IconFileText,
	IconClipboardText,
	IconPaperclip,
	IconSparkles,
	IconBuildingStore,
	IconDiscount2,
	IconConfetti,
	IconSpeakerphone,
	IconCalendarEvent,
	IconClock,
} from "@tabler/icons-react";
import { format, isValid } from "date-fns";
import { BespokeBrief, BriefFile } from "@/models/bespokeBrief.models";
import GradientDivider from "@/components/gradientDivider/GradientDivider";

/** True when the brief has any narrative text or uploaded files worth showing. */
export function hasBriefContent(brief?: BespokeBrief | null): boolean {
	if (!brief) return false;
	const text = [
		brief.purpose,
		brief.audience_notes,
		brief.offers_cta,
		brief.look_and_feel,
		brief.what_to_avoid,
		brief.other_deliverable,
		brief.theme,
		brief.brands,
		brief.discounts,
		brief.on_the_day,
	].some((v) => (v ?? "").trim().length > 0);
	const files =
		(brief.content_files?.length ?? 0) +
			(brief.imagery_files?.length ?? 0) +
			(brief.example_files?.length ?? 0) >
		0;
	const events =
		(brief.date_slots?.length ?? 0) > 0 ||
		brief.pr === true ||
		brief.pr === false;
	return text || files || events;
}

const isImage = (name: string) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);

/** "17:30" -> "5:30 PM". Passes through anything not in HH:mm form. */
function to12Hour(t?: string): string {
	if (!t) return "";
	const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
	if (!m) return t;
	const h = Number(m[1]);
	const period = h < 12 ? "AM" : "PM";
	const h12 = h % 12 === 0 ? 12 : h % 12;
	return `${h12}:${m[2]} ${period}`;
}

/** One narrative field: icon + heading + readable, paragraph-aware body. */
const NARRATIVE: {
	key: keyof BespokeBrief;
	label: string;
	icon: typeof IconBulb;
	color: string;
}[] = [
	{ key: "purpose", label: "Purpose", icon: IconBulb, color: "blue" },
	{ key: "audience_notes", label: "About the audience", icon: IconUsers, color: "teal" },
	{ key: "offers_cta", label: "Offers, promotions & CTA", icon: IconGift, color: "grape" },
	{ key: "look_and_feel", label: "Look & feel", icon: IconPalette, color: "pink" },
	{ key: "what_to_avoid", label: "What to avoid", icon: IconAlertTriangle, color: "orange" },
	// Event fields
	{ key: "theme", label: "Theme", icon: IconSparkles, color: "violet" },
	{ key: "brands", label: "Brands", icon: IconBuildingStore, color: "teal" },
	{ key: "discounts", label: "Exclusive discounts", icon: IconDiscount2, color: "grape" },
	{ key: "on_the_day", label: "On the day", icon: IconConfetti, color: "orange" },
	{ key: "other_deliverable", label: "Other deliverable", icon: IconBox, color: "indigo" },
];

/** Dates & times section for events. */
function DateSlotsSection({ brief }: { brief: BespokeBrief }) {
	const T = useMantineTheme();
	const slots = brief.date_slots ?? [];
	if (slots.length === 0) return null;
	return (
		<Box>
			<Group gap={8} mb={6}>
				<ThemeIcon size="sm" radius="xl" variant="light" color="blue">
					<IconCalendarEvent size={13} />
				</ThemeIcon>
				<Text fw={700} size="xs" tt="uppercase" c="gray.7" style={{ letterSpacing: 0.4 }}>
					Dates & times
				</Text>
			</Group>
			<Stack gap={6} pl={30}>
				{slots.map((s, i) => (
					<Group key={i} gap={10} wrap="nowrap">
						<Text size="sm" fw={600} c="gray.8">
							{s.date && isValid(new Date(s.date))
								? format(new Date(s.date), "EEE d MMM yyyy")
								: s.date}
						</Text>
						<Group gap={4} wrap="nowrap">
							<IconClock size={13} color={T.colors.gray[5]} />
							<Text size="sm" c="gray.7">
								{to12Hour(s.start)} – {to12Hour(s.end)}
							</Text>
						</Group>
					</Group>
				))}
			</Stack>
		</Box>
	);
}

function Field({
	label,
	icon: Icon,
	color,
	value,
}: {
	label: string;
	icon: typeof IconBulb;
	color: string;
	value: string;
}) {
	// Split into paragraphs on blank lines; keep single line-breaks inside.
	const paragraphs = value
		.split(/\n{2,}/)
		.map((p) => p.trim())
		.filter(Boolean);

	return (
		<Box>
			<Group gap={8} mb={5}>
				<ThemeIcon size="sm" radius="xl" variant="light" color={color}>
					<Icon size={13} />
				</ThemeIcon>
				<Text
					fw={700}
					size="xs"
					tt="uppercase"
					c="gray.7"
					style={{ letterSpacing: 0.4 }}
				>
					{label}
				</Text>
			</Group>
			<Stack gap={6} pl={30}>
				{paragraphs.map((p, i) => (
					<Text
						key={i}
						size="sm"
						c="gray.8"
						style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
					>
						{p}
					</Text>
				))}
			</Stack>
		</Box>
	);
}

function FileRow({ file }: { file: BriefFile }) {
	const T = useMantineTheme();
	const img = isImage(file.name);
	return (
		<Paper
			radius="md"
			px="sm"
			py={7}
			style={{
				border: `1px solid ${T.colors.gray[2]}`,
				background: "white",
			}}
		>
			<Group justify="space-between" wrap="nowrap" gap="sm">
				<Group gap={10} wrap="nowrap" miw={0}>
					<ThemeIcon
						size={34}
						radius="sm"
						variant="light"
						color={img ? "grape" : "blue"}
					>
						{img ? <IconPhoto size={16} /> : <IconFileText size={16} />}
					</ThemeIcon>
					<Text size="xs" fw={500} truncate="end" c="gray.8">
						{file.name}
					</Text>
				</Group>
				<Group gap={4} wrap="nowrap">
					<Tooltip label="Download" withArrow>
						<ActionIcon
							component="a"
							href={file.url}
							target="_blank"
							rel="noopener noreferrer"
							download
							variant="subtle"
							color="gray"
							radius="md"
							aria-label={`Download ${file.name}`}
						>
							<IconDownload size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Open in new tab" withArrow>
						<ActionIcon
							component="a"
							href={file.url}
							target="_blank"
							rel="noopener noreferrer"
							variant="light"
							color="blue"
							radius="md"
							aria-label={`Open ${file.name} in a new tab`}
						>
							<IconExternalLink size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Group>
		</Paper>
	);
}

interface Props {
	brief?: BespokeBrief | null;
	/** Section title. Defaults to "Campaign Brief". */
	title?: string;
}

/**
 * Read-only rendering of the structured bespoke brief — narrative fields as
 * icon-headed sections + downloadable file rows (image thumbnails + an
 * open-in-new-tab button). Reused across plan detail, admin review, God Mode.
 * Renders nothing when the brief is empty.
 */
export default function BespokeBriefView({ brief, title = "Campaign Brief" }: Props) {
	const T = useMantineTheme();
	if (!hasBriefContent(brief)) return null;

	const fields = NARRATIVE.filter(
		(f) => ((brief![f.key] as string | undefined) ?? "").trim(),
	);
	const fileGroups: [string, BriefFile[] | undefined][] = [
		["Content", brief!.content_files],
		["Imagery", brief!.imagery_files],
		["Design examples & references", brief!.example_files],
	].filter(([, files]) => ((files as BriefFile[] | undefined)?.length ?? 0) > 0) as [
		string,
		BriefFile[],
	][];

	const hasSlots = (brief!.date_slots?.length ?? 0) > 0;
	const prShown = brief!.pr === true || brief!.pr === false;
	const isEvent = hasSlots || (brief!.theme ?? "").trim().length > 0;
	const resolvedTitle =
		title === "Campaign Brief" && isEvent ? "Event Brief" : title;
	const hasTop = hasSlots || fields.length > 0 || prShown;

	return (
		<Paper
			radius="md"
			p="md"
			style={{
				border: `1px solid ${T.colors.blue[1]}`,
				background: T.colors.blue[0],
			}}
		>
			<Group gap={8} mb={14}>
				<ThemeIcon size="sm" radius="xl" variant="light" color="blue">
					<IconClipboardText size={14} />
				</ThemeIcon>
				<Text fw={700} size="sm" c="gray.8">
					{resolvedTitle}
				</Text>
			</Group>

			{hasTop && (
				<Stack gap={16}>
					{hasSlots && <DateSlotsSection brief={brief!} />}
					{fields.map((f) => (
						<Field
							key={f.key as string}
							label={f.label}
							icon={f.icon}
							color={f.color}
							value={(brief![f.key] as string) ?? ""}
						/>
					))}
					{prShown && (
						<Field
							label="PR"
							icon={IconSpeakerphone}
							color="pink"
							value={brief!.pr ? "Yes" : "No"}
						/>
					)}
				</Stack>
			)}

			{hasTop && fileGroups.length > 0 && <GradientDivider my={16} />}

			{fileGroups.length > 0 && (
				<Stack gap={14}>
					{fileGroups.map(([label, files]) => (
						<Box key={label}>
							<Group gap={8} mb={8}>
								<ThemeIcon size="sm" radius="xl" variant="light" color="blue">
									<IconPaperclip size={13} />
								</ThemeIcon>
								<Text
									fw={700}
									size="xs"
									tt="uppercase"
									c="gray.7"
									style={{ letterSpacing: 0.4 }}
								>
									{label}
								</Text>
							</Group>
							<Stack gap={6}>
								{files.map((f, i) => (
									<FileRow key={`${f.url}-${i}`} file={f} />
								))}
							</Stack>
						</Box>
					))}
				</Stack>
			)}
		</Paper>
	);
}
