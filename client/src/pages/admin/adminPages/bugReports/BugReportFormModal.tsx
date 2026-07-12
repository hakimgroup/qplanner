import {
	ActionIcon,
	Box,
	Button,
	Flex,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
	Textarea,
	ThemeIcon,
	useMantineTheme,
} from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import {
	IconBug,
	IconFile,
	IconPhoto,
	IconUpload,
	IconVideo,
	IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateBugReport } from "@/hooks/bugReport.hooks";
import { BugSeverity } from "@/models/bug.models";

const MAX_SIZE = 200 * 1024 ** 2; // 200 MB

function humanSize(bytes: number): string {
	if (!bytes) return "";
	const units = ["B", "KB", "MB", "GB"];
	let n = bytes;
	let i = 0;
	while (n >= 1024 && i < units.length - 1) {
		n /= 1024;
		i++;
	}
	return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function fileIcon(type: string, color: string) {
	if (type.startsWith("image/")) return <IconPhoto size={16} color={color} />;
	if (type.startsWith("video/")) return <IconVideo size={16} color={color} />;
	return <IconFile size={16} color={color} />;
}

interface Props {
	opened: boolean;
	onClose: () => void;
}

export default function BugReportFormModal({ opened, onClose }: Props) {
	const T = useMantineTheme().colors;
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [severity, setSeverity] = useState<BugSeverity>("medium");
	const [files, setFiles] = useState<File[]>([]);

	const { mutate: createBug, isPending } = useCreateBugReport();

	const reset = () => {
		setTitle("");
		setDescription("");
		setSeverity("medium");
		setFiles([]);
	};

	const handleClose = () => {
		if (isPending) return;
		reset();
		onClose();
	};

	const removeFile = (idx: number) =>
		setFiles((prev) => prev.filter((_, i) => i !== idx));

	const canSubmit = !!title.trim() && !!description.trim() && !isPending;

	const handleSubmit = () => {
		if (!canSubmit) return;
		createBug(
			{ title: title.trim(), description: description.trim(), severity, files },
			{
				onSuccess: () => {
					reset();
					onClose();
				},
			},
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			centered
			size="lg"
			radius="lg"
			overlayProps={{ backgroundOpacity: 0.6, blur: 3 }}
			title={
				<Group gap={8}>
					<ThemeIcon variant="light" color="red" radius="xl" size={34}>
						<IconBug size={18} />
					</ThemeIcon>
					<Text fw={700} fz="h4">
						Report a Bug
					</Text>
				</Group>
			}
		>
			<Stack gap="md">
				<TextInput
					label="Title"
					placeholder="Short summary of the bug"
					value={title}
					onChange={(e) => setTitle(e.currentTarget.value)}
					required
					disabled={isPending}
				/>

				<Select
					label="Severity"
					value={severity}
					onChange={(v) => setSeverity((v as BugSeverity) ?? "medium")}
					disabled={isPending}
					allowDeselect={false}
					data={[
						{ value: "low", label: "Low" },
						{ value: "medium", label: "Medium" },
						{ value: "high", label: "High" },
						{ value: "critical", label: "Critical" },
					]}
				/>

				<Textarea
					label="Description"
					placeholder="What happened? What did you expect? Steps to reproduce…"
					value={description}
					onChange={(e) => setDescription(e.currentTarget.value)}
					minRows={4}
					maxRows={10}
					autosize
					required
					disabled={isPending}
				/>

				<Box>
					<Text fw={500} size="sm" mb={6}>
						Attachments{" "}
						<Text span size="xs" c="gray.5">
							(images, video, or any files — up to 200 MB each)
						</Text>
					</Text>
					<Dropzone
						onDrop={(dropped: FileWithPath[]) =>
							setFiles((prev) => [...prev, ...dropped])
						}
						onReject={(rejections) => {
							const tooBig = rejections.some((r) =>
								r.errors.some((e) => e.code === "file-too-large"),
							);
							toast.error(
								tooBig
									? "File is too large — max 200 MB per file."
									: "Couldn't add that file.",
							);
						}}
						maxSize={MAX_SIZE}
						disabled={isPending}
						radius="md"
						styles={{
							root: {
								border: `2px dashed ${T.violet[2]}`,
								backgroundColor: T.gray[0],
							},
						}}
					>
						<Flex
							align="center"
							justify="center"
							gap="md"
							mih={90}
							style={{ pointerEvents: "none" }}
						>
							<Dropzone.Accept>
								<IconUpload size={40} color={T.violet[6]} />
							</Dropzone.Accept>
							<Dropzone.Reject>
								<IconX size={40} color={T.red[6]} />
							</Dropzone.Reject>
							<Dropzone.Idle>
								<IconUpload size={36} color={T.gray[5]} />
							</Dropzone.Idle>
							<Stack gap={2}>
								<Text size="sm" fw={500} c="gray.7">
									Drag files here or click to select
								</Text>
								<Text size="xs" c="gray.5">
									Screenshots, screen recordings, logs — anything that helps
								</Text>
							</Stack>
						</Flex>
					</Dropzone>

					{files.length > 0 && (
						<Stack gap={6} mt={10}>
							{files.map((f, i) => (
								<Flex
									key={`${f.name}-${i}`}
									align="center"
									justify="space-between"
									px="sm"
									py={6}
									style={{
										border: `1px solid ${T.gray[2]}`,
										borderRadius: 8,
										backgroundColor: "#fff",
									}}
								>
									<Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
										{fileIcon(f.type, T.violet[6])}
										<Text size="xs" c="gray.8" truncate>
											{f.name}
										</Text>
										<Text size="xs" c="gray.5" style={{ flexShrink: 0 }}>
											{humanSize(f.size)}
										</Text>
									</Group>
									<ActionIcon
										variant="subtle"
										color="red"
										size="sm"
										onClick={() => removeFile(i)}
										disabled={isPending}
										aria-label="Remove file"
									>
										<IconX size={14} />
									</ActionIcon>
								</Flex>
							))}
						</Stack>
					)}
				</Box>

				<Flex justify="flex-end" gap="sm" mt="xs">
					<Button
						variant="default"
						onClick={handleClose}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						color="red"
						leftSection={<IconBug size={16} />}
						onClick={handleSubmit}
						loading={isPending}
						disabled={!canSubmit}
					>
						Submit report
					</Button>
				</Flex>
			</Stack>
		</Modal>
	);
}
