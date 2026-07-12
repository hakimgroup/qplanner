import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Preview,
	Section,
	Text,
	Tailwind,
	Hr,
} from "@react-email/components";
import * as React from "react";
import { format, parseISO } from "date-fns";

interface BugAttachmentView {
	name: string;
	type: string;
	size: number;
	url: string | null;
}

interface BugReportEmailProps {
	title: string;
	description: string;
	severity: string; // low | medium | high | critical
	createdByName: string;
	createdAt: string;
	attachments: BugAttachmentView[];
	appUrl: string;
}

const SEVERITY_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
	low: { bg: "#f1f3f5", fg: "#495057", label: "Low" },
	medium: { bg: "#e7f5ff", fg: "#1971c2", label: "Medium" },
	high: { bg: "#fff4e6", fg: "#e8590c", label: "High" },
	critical: { bg: "#fff0f0", fg: "#c92a2a", label: "Critical" },
};

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

export const BugReportEmail = ({
	title,
	description,
	severity,
	createdByName,
	createdAt,
	attachments,
	appUrl,
}: BugReportEmailProps) => {
	const sev = SEVERITY_STYLE[severity] ?? SEVERITY_STYLE.medium;
	let when = createdAt;
	try {
		when = format(parseISO(createdAt), "d MMM yyyy, HH:mm");
	} catch {
		// keep raw
	}
	const trackerUrl = `${appUrl}/admin/bug-reports`;

	return (
		<Html>
			<Head />
			<Preview>
				[{sev.label}] Bug report: {title}
			</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: { brand: "#7b2eda", offwhite: "#faf8fd" },
							spacing: { 0: "0px", 20: "20px", 45: "45px" },
						},
					},
				} as any}
			>
				<Body className="bg-offwhite text-base font-sans">
					<Section style={logoContainer}>
						<div style={logoBox}>
							<Img
								src="https://i.postimg.cc/0Q5wP963/hg-icon-white-rgb.png"
								alt="HG"
								width="36"
								height="36"
								style={logoImg}
							/>
						</div>
					</Section>

					<Container className="bg-white p-45">
						<Section style={badgeRow}>
							<span style={{ ...badge, backgroundColor: sev.bg, color: sev.fg }}>
								{sev.label} severity
							</span>
						</Section>

						<Heading className="text-center my-0 leading-8">
							New bug report
						</Heading>

						<Section style={titleBox}>
							<Text style={titleText}>{title}</Text>
							<Text style={metaText}>
								Reported by <strong>{createdByName || "an admin"}</strong> · {when}
							</Text>
						</Section>

						<Section>
							<Text style={sectionLabel}>Description</Text>
							<Text style={descriptionText}>{description}</Text>
						</Section>

						{attachments.length > 0 && (
							<Section>
								<Text style={sectionLabel}>
									Attachments ({attachments.length})
								</Text>
								{attachments.map((a, i) => (
									<table
										key={i}
										role="presentation"
										style={attachmentRow}
									>
										<tr>
											<td style={{ verticalAlign: "middle" }}>
												<Text style={attachmentName}>{a.name}</Text>
												<Text style={attachmentMeta}>
													{a.type || "file"}
													{a.size ? ` · ${humanSize(a.size)}` : ""}
												</Text>
											</td>
											<td style={{ textAlign: "right", verticalAlign: "middle" }}>
												{a.url ? (
													<a href={a.url} style={attachmentLink}>
														Open ↗
													</a>
												) : (
													<span style={attachmentUnavailable}>
														unavailable
													</span>
												)}
											</td>
										</tr>
									</table>
								))}
								<Text style={attachmentNote}>
									Attachment links are valid for 30 days. Open the ticket in the
									planner for fresh links any time.
								</Text>
							</Section>
						)}

						<Section className="text-center">
							<Button
								href={trackerUrl}
								className="bg-brand text-white rounded-md py-3 px-[18px] mt-20"
							>
								Open the ticket tracker
							</Button>
						</Section>

						<Hr style={hr} />

						<Section>
							<Text style={footerNote}>
								This ticket is now open in the planner's bug tracker
								(/admin/bug-reports). Close it there once resolved.
							</Text>
						</Section>
					</Container>

					<Container className="mt-20">
						<Text className="text-center text-gray-400 mb-45">
							Unit 317, India Mill Business Centre, Bolton Rd, Darwen BB3 1AE
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default BugReportEmail;

const logoContainer = { textAlign: "center" as const, padding: "40px 0 20px 0" };
const logoBox = {
	display: "inline-block",
	borderRadius: "10px",
	background:
		"linear-gradient(130deg, rgba(114, 100, 233, 1) 11%, rgba(214, 76, 168, 1) 85%)",
	backgroundColor: "#7264e9",
	textAlign: "center" as const,
	padding: "14px",
};
const logoImg = { display: "block", margin: "0 auto" };
const badgeRow = { textAlign: "center" as const, marginBottom: "16px" };
const badge = {
	display: "inline-block",
	padding: "6px 12px",
	borderRadius: "16px",
	fontSize: "12px",
	fontWeight: "600" as const,
	textTransform: "uppercase" as const,
};
const titleBox = {
	backgroundColor: "#faf8fd",
	border: "1px solid #e5d5f8",
	borderLeft: "4px solid #7b2eda",
	borderRadius: "8px",
	padding: "16px 20px",
	margin: "20px 0",
};
const titleText = {
	fontSize: "17px",
	fontWeight: "700" as const,
	color: "#1f2937",
	margin: "0 0 6px 0",
	lineHeight: "1.4",
};
const metaText = { fontSize: "12px", color: "#6b7280", margin: "0" };
const sectionLabel = {
	fontSize: "11px",
	fontWeight: "700" as const,
	color: "#7b2eda",
	textTransform: "uppercase" as const,
	letterSpacing: "0.6px",
	margin: "18px 0 6px 0",
};
const descriptionText = {
	fontSize: "14px",
	color: "#374151",
	lineHeight: "1.6",
	margin: "0",
	whiteSpace: "pre-wrap" as const,
};
const attachmentRow = {
	width: "100%",
	borderCollapse: "collapse" as const,
	borderBottom: "1px solid #f1f3f5",
	padding: "0",
};
const attachmentName = {
	fontSize: "13px",
	fontWeight: "600" as const,
	color: "#1f2937",
	margin: "8px 0 2px 0",
};
const attachmentMeta = { fontSize: "11px", color: "#9ca3af", margin: "0 0 8px 0" };
const attachmentLink = {
	fontSize: "13px",
	fontWeight: "600" as const,
	color: "#7b2eda",
	textDecoration: "none",
};
const attachmentUnavailable = { fontSize: "12px", color: "#c92a2a" };
const attachmentNote = {
	fontSize: "11px",
	color: "#9ca3af",
	margin: "10px 0 0 0",
	fontStyle: "italic" as const,
};
const footerNote = {
	fontSize: "12px",
	color: "#9ca3af",
	textAlign: "center" as const,
	margin: "0",
	lineHeight: "1.5",
};
const hr = { borderColor: "#e5d5f8", margin: "30px 0" };
