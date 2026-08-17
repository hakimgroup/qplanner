import {
	Box,
	Flex,
	Stack,
	Text,
	SegmentedControl,
	ActionIcon,
	ThemeIcon,
	Paper,
	useMantineTheme,
	Collapse,
} from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import {
	IconUpload,
	IconX,
	IconPhoto,
	IconFileText,
	IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

const MAX_SIZE = 25 * 1024 ** 2; // 25 MB

const ACCEPT = [
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"text/plain",
];

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

interface Props {
	/** The Yes/No question, e.g. "Do you already have imagery for this project?" */
	question: string;
	has: boolean | null;
	onHasChange: (v: boolean) => void;
	files: File[];
	onFilesChange: (files: File[]) => void;
	disabled?: boolean;
}

/**
 * Yes/No question that reveals a file dropzone + file list when "Yes".
 * Reused for content, imagery, and design-examples in the bespoke brief.
 */
export default function BriefFileUpload({
	question,
	has,
	onHasChange,
	files,
	onFilesChange,
	disabled,
}: Props) {
	const T = useMantineTheme();

	return (
		<Stack gap={8}>
			<Text size="sm" fw={500} c="gray.8">
				{question}
			</Text>
			<SegmentedControl
				size="xs"
				w={140}
				disabled={disabled}
				value={has === null ? "" : has ? "yes" : "no"}
				onChange={(v) => onHasChange(v === "yes")}
				data={[
					{ label: "Yes", value: "yes" },
					{ label: "No", value: "no" },
				]}
			/>

			<Collapse in={has === true}>
				<Stack gap={8} pt={4}>
					<Text size="xs" c="gray.5">
						If yes, please upload any relevant files here.
					</Text>
					<Dropzone
						onDrop={(dropped: FileWithPath[]) =>
							onFilesChange([...files, ...dropped])
						}
						onReject={(rejections) => {
							const tooBig = rejections.some((r) =>
								r.errors.some((e) => e.code === "file-too-large"),
							);
							toast.error(
								tooBig
									? "File is too large — max 25 MB per file."
									: "That file type isn't supported.",
							);
						}}
						maxSize={MAX_SIZE}
						accept={ACCEPT}
						disabled={disabled}
						radius="md"
						styles={{
							root: {
								border: `2px dashed ${T.colors.blue[2]}`,
								backgroundColor: T.colors.gray[0],
							},
						}}
					>
						<Flex
							align="center"
							justify="center"
							gap="md"
							mih={70}
							style={{ pointerEvents: "none" }}
						>
							<Dropzone.Accept>
								<IconUpload size={30} color={T.colors.blue[6]} />
							</Dropzone.Accept>
							<Dropzone.Reject>
								<IconX size={30} color={T.colors.red[6]} />
							</Dropzone.Reject>
							<Dropzone.Idle>
								<IconUpload size={28} color={T.colors.gray[5]} />
							</Dropzone.Idle>
							<Stack gap={0}>
								<Text size="sm" fw={500} c="gray.7">
									Drag files here or click to select
								</Text>
								<Text size="xs" c="gray.5">
									Images, PDF or Office docs — up to 25 MB each
								</Text>
							</Stack>
						</Flex>
					</Dropzone>

					{files.length > 0 && (
						<Stack gap={6}>
							{files.map((f, i) => {
								const isImg = f.type.startsWith("image/");
								return (
									<Paper
										key={`${f.name}-${i}`}
										radius="md"
										px="sm"
										py={7}
										style={{
											border: `1px solid ${T.colors.gray[2]}`,
											background: T.colors.gray[0],
										}}
									>
										<Flex align="center" justify="space-between" gap="sm">
											<Flex align="center" gap={10} miw={0}>
												<ThemeIcon
													size={30}
													radius="md"
													variant="light"
													color={isImg ? "grape" : "blue"}
												>
													{isImg ? (
														<IconPhoto size={16} />
													) : (
														<IconFileText size={16} />
													)}
												</ThemeIcon>
												<Box miw={0}>
													<Text size="xs" fw={500} truncate="end">
														{f.name}
													</Text>
													<Text size="10px" c="gray.5">
														{formatSize(f.size)}
													</Text>
												</Box>
											</Flex>
											<ActionIcon
												color="red"
												variant="subtle"
												size="sm"
												disabled={disabled}
												onClick={() =>
													onFilesChange(
														files.filter((_, idx) => idx !== i),
													)
												}
											>
												<IconTrash size={14} />
											</ActionIcon>
										</Flex>
									</Paper>
								);
							})}
						</Stack>
					)}
				</Stack>
			</Collapse>
		</Stack>
	);
}
