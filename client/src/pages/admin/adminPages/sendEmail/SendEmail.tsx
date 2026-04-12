import {
	Stack,
	Title,
	Text,
	Card,
	Select,
	TextInput,
	Textarea,
	useMantineTheme,
	Group,
	Badge,
	SimpleGrid,
	Box,
	rgba,
	Button,
	MultiSelect,
} from "@mantine/core";
import { IconMail, IconSend } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useGodModeListPractices } from "@/hooks/godMode.hooks";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/shared/AuthProvider";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import EmailTemplatePreview from "./EmailTemplatePreview";

const TEMPLATE_IDS = ["simple", "action", "announcement"] as const;
type TemplateId = (typeof TEMPLATE_IDS)[number];

const TEMPLATE_NAMES: Record<TemplateId, string> = {
	simple: "Simple Message",
	action: "Action Required",
	announcement: "Announcement",
};

const HAS_CTA: Record<TemplateId, boolean> = {
	simple: false,
	action: true,
	announcement: true,
};

export default function SendEmail() {
	const T = useMantineTheme().colors;
	const { firstName, lastName } = useAuth();
	const senderName = [firstName, lastName].filter(Boolean).join(" ") || null;

	const { data: practices, isLoading: loadingPractices } =
		useGodModeListPractices();

	const [practiceId, setPracticeId] = useState<string | null>(null);
	const [template, setTemplate] = useState<TemplateId | null>(null);
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [ctaText, setCtaText] = useState("");
	const [ctaUrl, setCtaUrl] = useState("");
	const [recipients, setRecipients] = useState<string[]>([]);
	const [sending, setSending] = useState(false);

	const practiceOptions = useMemo(
		() =>
			(practices ?? []).map((p) => ({
				value: p.id,
				label: p.name,
			})),
		[practices]
	);

	const practiceName = useMemo(
		() => practiceOptions.find((p) => p.value === practiceId)?.label ?? "",
		[practiceOptions, practiceId]
	);

	// Fetch practice members when a practice is selected
	const [members, setMembers] = useState<
		Array<{ email: string; name: string }>
	>([]);
	const [loadingMembers, setLoadingMembers] = useState(false);

	const fetchMembers = async (pid: string) => {
		setLoadingMembers(true);
		setRecipients([]);
		try {
			const { data } = await supabase
				.from("practice_members")
				.select("email, user_id")
				.eq("practice_id", pid);
			if (!data) {
				setMembers([]);
				return;
			}
			const userIds = data.map((m: any) => m.user_id).filter(Boolean);
			const { data: users } = await supabase
				.from("allowed_users")
				.select("id, email, first_name, last_name")
				.in("id", userIds);

			setMembers(
				(users ?? []).map((u: any) => ({
					email: u.email,
					name:
						[u.first_name, u.last_name].filter(Boolean).join(" ") ||
						u.email,
				}))
			);
		} catch {
			setMembers([]);
		} finally {
			setLoadingMembers(false);
		}
	};

	const handlePracticeChange = (v: string | null) => {
		setPracticeId(v);
		if (v) fetchMembers(v);
		else {
			setMembers([]);
			setRecipients([]);
		}
	};

	const memberOptions = useMemo(
		() =>
			members.map((m) => ({
				value: m.email,
				label: `${m.name} (${m.email})`,
			})),
		[members]
	);

	const selectAllMembers = () => {
		setRecipients(members.map((m) => m.email));
	};

	const hasCta = template ? HAS_CTA[template] : false;
	const canSend =
		practiceId &&
		template &&
		subject.trim() &&
		body.trim() &&
		recipients.length > 0;

	const handleSend = async () => {
		if (!canSend) return;
		setSending(true);
		try {
			const expressUrl = (import.meta as any).env?.VITE_EXPRESS_URL;
			if (!expressUrl) throw new Error("VITE_EXPRESS_URL is not set");

			const res = await fetch(`${expressUrl}/send-custom-email`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					template,
					subject: subject.trim(),
					body: body.trim(),
					practiceName,
					senderName,
					ctaText: ctaText.trim() || undefined,
					ctaUrl: ctaUrl.trim() || undefined,
					recipientEmails: recipients,
				}),
			});
			if (!res.ok) {
				const text = await res.text().catch(() => "");
				throw new Error(text || `Failed (${res.status})`);
			}
			const result = await res.json().catch(() => ({}));
			toast.success(
				`Email sent to ${result.sent ?? recipients.length} recipient(s)`
			);

			// Reset form
			setSubject("");
			setBody("");
			setCtaText("");
			setCtaUrl("");
			setRecipients([]);
		} catch (e: any) {
			toast.error(e?.message ?? "Failed to send email");
		} finally {
			setSending(false);
		}
	};

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Group gap={10} align="center">
					<IconMail size={28} color={T.violet[6]} />
					<Title order={1}>Send Email</Title>
					<Badge color="violet" variant="light" size="lg">
						Super Admin
					</Badge>
				</Group>
				<Text c="gray.6">
					Send a custom email to any practice member using one of three
					templates.
				</Text>
			</Stack>

			{/* Step 1: Practice */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.violet[1]}` }}
				shadow="xs"
			>
				<Stack gap={15}>
					<Title order={4}>1. Select Practice</Title>
					<Select
						data={practiceOptions}
						value={practiceId}
						onChange={handlePracticeChange}
						placeholder="Search for a practice..."
						searchable
						clearable
						nothingFoundMessage="No practices"
						radius="md"
						size="sm"
						disabled={loadingPractices}
					/>
				</Stack>
			</Card>

			{/* Step 2: Choose Template */}
			{practiceId && (
				<Card
					p={25}
					radius={10}
					style={{ border: `1px solid ${T.violet[1]}` }}
					shadow="xs"
				>
					<Stack gap={15}>
						<Title order={4}>2. Choose Template</Title>
						<Text size="xs" c="gray.6">
							Click a template to select it. The preview shows how the
							final email will look.
						</Text>
						<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
							{TEMPLATE_IDS.map((tid) => (
								<Stack key={tid} gap={6}>
									<EmailTemplatePreview
										template={tid}
										practiceName={practiceName || "Practice Name"}
										selected={template === tid}
										onClick={() => setTemplate(tid)}
									/>
									<Text ta="center" size="xs" fw={600} c={template === tid ? "violet.7" : "gray.6"}>
										{TEMPLATE_NAMES[tid]}
									</Text>
								</Stack>
							))}
						</SimpleGrid>
					</Stack>
				</Card>
			)}

			{/* Step 3: Compose + Live Preview */}
			{practiceId && template && (
				<Card
					p={25}
					radius={10}
					style={{ border: `1px solid ${T.violet[1]}` }}
					shadow="xs"
				>
					<Stack gap={15}>
						<Title order={4}>3. Compose</Title>
						<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
							{/* Left: form fields */}
							<Stack gap="md">
								<TextInput
									label="Subject"
									value={subject}
									onChange={(e) => setSubject(e.currentTarget.value)}
									placeholder="Email subject line"
									radius="md"
									required
								/>
								<Textarea
									label="Body"
									value={body}
									onChange={(e) => setBody(e.currentTarget.value)}
									placeholder="Write your message here. Each line break will be preserved."
									autosize
									minRows={8}
									maxRows={20}
									radius="md"
									required
								/>

								{hasCta && (
									<Group grow>
										<TextInput
											label="Button Text"
											value={ctaText}
											onChange={(e) => setCtaText(e.currentTarget.value)}
											placeholder="e.g. Open QPlanner"
											radius="md"
										/>
										<TextInput
											label="Button URL"
											value={ctaUrl}
											onChange={(e) => setCtaUrl(e.currentTarget.value)}
											placeholder="https://..."
											radius="md"
										/>
									</Group>
								)}
							</Stack>

							{/* Right: live preview */}
							<Stack gap={6}>
								<Text size="xs" c="gray.6" fw={600} tt="uppercase">
									Live Preview
								</Text>
								<EmailTemplatePreview
									template={template}
									subject={subject}
									body={body}
									practiceName={practiceName || "Practice Name"}
									ctaText={ctaText}
									fullSize
								/>
							</Stack>
						</SimpleGrid>
					</Stack>
				</Card>
			)}

			{/* Step 4: Recipients */}
			{practiceId && template && (
				<Card
					p={25}
					radius={10}
					style={{ border: `1px solid ${T.violet[1]}` }}
					shadow="xs"
				>
					<Stack gap={15}>
						<Group justify="space-between" align="center">
							<Title order={4}>4. Recipients</Title>
							<Button
								variant="subtle"
								color="violet"
								size="xs"
								onClick={selectAllMembers}
								disabled={
									loadingMembers ||
									members.length === 0 ||
									recipients.length === members.length
								}
							>
								Select all ({members.length})
							</Button>
						</Group>

						<MultiSelect
							data={memberOptions}
							value={recipients}
							onChange={setRecipients}
							placeholder={
								loadingMembers
									? "Loading members..."
									: "Pick recipients"
							}
							searchable
							clearable
							disabled={loadingMembers}
							radius="md"
							nothingFoundMessage="No members"
						/>

						{recipients.length > 0 && (
							<Box
								p="sm"
								style={{
									background: rgba(T.teal[0], 0.5),
									borderRadius: 10,
									border: `1px solid ${rgba(T.teal[3], 0.25)}`,
								}}
							>
								<Text size="xs" c="teal.8" fw={600}>
									{recipients.length} recipient
									{recipients.length === 1 ? "" : "s"} selected
								</Text>
							</Box>
						)}
					</Stack>
				</Card>
			)}

			{/* Step 5: Send */}
			{canSend && (
				<Card
					p={25}
					radius={10}
					style={{ border: `1px solid ${T.violet[1]}` }}
					shadow="xs"
				>
					<Stack gap={15}>
						<Title order={4}>5. Review & Send</Title>

						<Box
							p="lg"
							style={{
								background: rgba(T.violet[0], 0.5),
								borderRadius: 14,
								border: `1px solid ${rgba(T.violet[3], 0.25)}`,
							}}
						>
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
								<Stack gap={2}>
									<Text size="xs" c="gray.6" fw={600} tt="uppercase">
										Practice
									</Text>
									<Text size="sm" fw={500}>
										{practiceName}
									</Text>
								</Stack>
								<Stack gap={2}>
									<Text size="xs" c="gray.6" fw={600} tt="uppercase">
										Template
									</Text>
									<Text size="sm" fw={500}>
										{template ? TEMPLATE_NAMES[template] : "—"}
									</Text>
								</Stack>
								<Stack gap={2}>
									<Text size="xs" c="gray.6" fw={600} tt="uppercase">
										Subject
									</Text>
									<Text size="sm" fw={500}>
										{subject}
									</Text>
								</Stack>
								<Stack gap={2}>
									<Text size="xs" c="gray.6" fw={600} tt="uppercase">
										Recipients
									</Text>
									<Text size="sm" fw={500}>
										{recipients.length} member
										{recipients.length === 1 ? "" : "s"}
									</Text>
								</Stack>
							</SimpleGrid>
						</Box>

						<GradientDivider />

						<Group justify="flex-end">
							<Button
								color="violet"
								size="md"
								radius="md"
								leftSection={<IconSend size={16} />}
								loading={sending}
								onClick={handleSend}
							>
								Send Email
							</Button>
						</Group>
					</Stack>
				</Card>
			)}
		</Stack>
	);
}
