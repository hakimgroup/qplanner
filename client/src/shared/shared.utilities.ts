// src/utils/stateUtils.ts
import _ from "lodash";
import { parseISO, format, isValid } from "date-fns";
import { NotificationRow } from "@/models/notification.models";

type State = Record<string, any>;
type SetState = React.Dispatch<React.SetStateAction<State>>;
type Availability = { from?: string | Date | null; to?: string | Date | null };

/**
 * Update nested app state by path.
 * Example: updateState(setState, "filters.dateRange.from", newDate)
 */
export function updateState(setState: SetState, path: string, value: any) {
  setState((prev) => {
    const next = _.cloneDeep(prev);
    _.set(next, path, value);
    return next;
  });
}

export const normalizeAvailability = (input: unknown): Availability => {
  const MONTH_ABBR_TO_INDEX: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

  if (!input) return null;

  // If it came in as a JSON string: {"from":"Sep","to":"Oct"}
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (parsed && typeof parsed === "object") input = parsed;
    } catch {
      return null;
    }
  }

  if (typeof input !== "object") return null;
  const av = input as { from?: string; to?: string };

  const fromIdx = av.from ? MONTH_ABBR_TO_INDEX[av.from] : undefined;
  const toIdx = av.to ? MONTH_ABBR_TO_INDEX[av.to] : undefined;

  if (fromIdx === undefined || toIdx === undefined) return null;

  const year = new Date().getFullYear();

  // First day of from-month
  const first = new Date(year, fromIdx, 1);
  // Last day of to-month (day 0 of next month)
  const last = new Date(year, toIdx + 1, 0);

  const fromStr = `${first.getFullYear()}-${pad2(first.getMonth() + 1)}-${pad2(
    first.getDate()
  )}`;
  const toStr = `${last.getFullYear()}-${pad2(last.getMonth() + 1)}-${pad2(
    last.getDate()
  )}`;

  return { from: fromStr, to: toStr };
};

export const formatAvailabilityForUI = (av?: Availability): string => {
  if (!av || !av.from || !av.to) return "—";

  const toDate =
    typeof av.to === "string"
      ? parseISO(av.to.trim())
      : av.to instanceof Date
      ? av.to
      : null;
  const fromDate =
    typeof av.from === "string"
      ? parseISO(av.from.trim())
      : av.from instanceof Date
      ? av.from
      : null;

  if (!fromDate || !toDate || !isValid(fromDate) || !isValid(toDate))
    return "—";

  const sameYear = fromDate.getFullYear() === toDate.getFullYear();

  return sameYear
    ? `${format(fromDate, "MMM dd")} - ${format(toDate, "MMM dd, yyyy")}`
    : `${format(fromDate, "MMM dd, yyyy")} - ${format(toDate, "MMM dd, yyyy")}`;
};

// AuthProvider.tsx (inside file)
export const pushAuthNotice = (code: "denied" | "failed") => {
  // will survive the redirect to /login within same tab
  localStorage.setItem("auth_notice", code);
};

export function firstSentence(input: string): string {
  const clean = _.replace(_.trim(_.toString(input)), /\s+/g, " ");
  if (!clean) return "";
  const match = clean.match(/^.*?[.?!](?=(?:['")\]]+)?\s|$)/);
  if (match) return match[0];
  const nl = clean.indexOf("\n");
  return nl >= 0 ? clean.slice(0, nl) : clean;
}

// utils/linkLabel.ts
export function getReferenceLinkLabel(raw: string, index: number = 0): string {
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname || "/";
    const lastSeg = decodeURIComponent(
      path.split("/").filter(Boolean).pop() || ""
    );
    const ext = (lastSeg.split(".").pop() || "").toLowerCase();

    // Map common hosts to friendly names
    const hostMap: Record<string, string> = {
      "sharepoint.com": "SharePoint",
      "dropbox.com": "Dropbox",
      "drive.google.com": "Google Drive",
      "docs.google.com": "Google Docs",
      "figma.com": "Figma",
      "notion.so": "Notion",
      "onedrive.live.com": "OneDrive",
      "box.com": "Box",
      "loom.com": "Loom",
      "youtube.com": "YouTube",
      "vimeo.com": "Vimeo",
    };

    // Quick heuristics
    const isFolder = /folder|folders|drive\/u\/\d\/folders|:f:|:o:/i.test(
      path + url.search
    );
    const isShare = /share|sharing|view|open|s\/|file\/d\//i.test(
      path + url.search
    );

    // Pretty title from last segment (strip extension, kebab → Title Case)
    const prettyFromSegment = (seg: string) => {
      const base = seg.replace(/\.[^.]+$/, ""); // remove extension
      if (!base) return "";
      return base
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (m) => m.toUpperCase());
    };

    const hostLabel =
      hostMap[Object.keys(hostMap).find((k) => host.endsWith(k)) || ""] ||
      host.split(".").slice(-2).join("."); // fallback: domain.tld

    // File type badges (text only)
    const fileType =
      ext === "pdf"
        ? "PDF"
        : ["doc", "docx", "pages"].includes(ext)
        ? "Doc"
        : ["xls", "xlsx", "numbers", "csv"].includes(ext)
        ? "Sheet"
        : ["ppt", "pptx", "key"].includes(ext)
        ? "Slides"
        : ["mp4", "mov", "webm"].includes(ext)
        ? "Video"
        : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
        ? "Image"
        : "";

    let title = prettyFromSegment(lastSeg);

    // If no good last segment, try a query param like ?name= or ?title=
    if (!title) {
      const qpTitle =
        url.searchParams.get("name") ||
        url.searchParams.get("title") ||
        url.searchParams.get("file") ||
        url.searchParams.get("v") || // YouTube id
        "";
      title = prettyFromSegment(qpTitle);
    }

    // Build the final label
    // Priority: [Host] Title (Type) → [Host] Folder → [Host] Shared Link → fallback
    if (title && fileType) return `${hostLabel}: ${title} (${fileType})`;
    if (title) return `${hostLabel}: ${title}`;
    if (isFolder) return `${hostLabel}: Folder`;
    if (isShare) return `${hostLabel}: Shared Link`;

    // Fallback with index (1-based) and domain
    return `Link ${index + 1} (${hostLabel})`;
  } catch {
    // If URL parsing fails, fall back softly
    return `Link ${index + 1}`;
  }
}

export function formatDateRange(
  from?: string | null,
  to?: string | null
): string {
  let formattedFrom = "";
  let formattedTo = "";

  if (from) {
    const fromDate = parseISO(from);
    if (isValid(fromDate)) {
      formattedFrom = format(fromDate, "MMMM do, yyyy");
    }
  }

  if (to) {
    const toDate = parseISO(to);
    if (isValid(toDate)) {
      formattedTo = format(toDate, "MMMM do, yyyy");
    }
  }

  if (formattedFrom && formattedTo) {
    return `From ${formattedFrom} to ${formattedTo}`;
  }

  if (formattedFrom) return `From ${formattedFrom}`;
  if (formattedTo) return `Until ${formattedTo}`;

  return "";
}

export function normalizeAllToNull<T extends Record<string, any>>(
  obj: T
): {
  [K in keyof T]: T[K] | null;
} {
  return _.mapValues(obj, (v) => {
    if (v === "all") return null;
    if (Array.isArray(v) && v.length === 0) return null;
    return v;
  }) as any;
}

// shared/shared.utilities.ts
export type CampaignSearchable = {
  name?: string | null;
  description?: string | null;
  selection_practice_name?: string | null;
  category?: string | null;
  status?: string | null;
  objectives?: string[] | null;
  topics?: string[] | null;
  // You can pass more fields via extraKeys if needed (e.g., "campaign")
  [k: string]: any;
};

export function filterCampaignsByQuery<T extends CampaignSearchable>(
  rows: T[],
  query: string,
  opts?: { extraKeys?: (keyof T | string)[] }
): T[] {
  const norm = (v: unknown) => String(v ?? "").toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return rows || [];

  const extra = opts?.extraKeys ?? [];

  return (rows || []).filter((row) => {
    const name = norm(row.name);
    const desc = norm(row.description);
    const practice = norm(row.selection_practice_name);
    const category = norm(row.category);
    const status = norm(row.status);

    const objectives = Array.isArray(row.objectives)
      ? row.objectives.map(norm).join(" ")
      : "";
    const topics = Array.isArray(row.topics)
      ? row.topics.map(norm).join(" ")
      : "";

    // allow extra keys (e.g., "campaign" label used in table row mapping)
    const extraHit = extra.some((k) => norm((row as any)?.[k]).includes(q));

    return (
      name.includes(q) ||
      desc.includes(q) ||
      practice.includes(q) ||
      category.includes(q) ||
      status.includes(q) ||
      objectives.includes(q) ||
      topics.includes(q) ||
      extraHit
    );
  });
}

export function getNotificationCampaignName(n: NotificationRow): string {
  // payload.campaignName from request_assets payload, fallback to title
  return n?.payload?.name || n?.title || "Untitled Campaign";
}

export function getNotificationCategory(n: NotificationRow): string | null {
  return n?.payload?.category ?? null;
}

export function getNotificationCreatedLabel(n: NotificationRow): string {
  // very lightweight formatting for now; you can swap to date-fns
  const d = new Date(n.created_at);
  // "Oct 23, 2025 9:25 AM" style
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

export function getNotificationBadgeType(n: NotificationRow): string {
  // map internal type -> human label
  // e.g. "requested" => "Assets Requested"
  switch (n.type) {
    case "requested":
      return "Assets Requested";
    case "inProgress":
      return "In Progress";
    case "awaitingApproval":
      return "Awaiting Approval";
    case "confirmed":
      return "Confirmed";
    case "live":
      return "Live";
    default:
      return n.type || "Update";
  }
}

export function getNotificationPracticeName(n: NotificationRow): string | null {
  return n.practice_name ?? null;
}
