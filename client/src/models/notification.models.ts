import { CreativeItem } from "@/pages/notificationsCenter/practiceRespondModal/CreativePicker";
import { SelectionStatus } from "@/shared/shared.models";

export type AdminAssetsPayload = {
  selectionId: string;
  isBespoke: boolean;
  bespokeCampaignId?: string | null;
  assets: any; // Your Assets type (printedAssets/digitalAssets/externalPlacements)
};

export type RequestAssetsInput = {
  selectionId: string;
  creativeUrls: CreativeItem[]; // up to 4
  note?: string | null;
  recipientIds?: string[] | null; // optional explicit recipients
};

export type NotificationRow = {
  id: string;
  type: SelectionStatus;
  practice_id: string | null;
  practice_name: string | null; // NEW
  selection_id: string | null;
  campaign_id: string | null;
  title: string | null;
  message: string | null;
  payload: any;
  created_at: string;
  read_at: string | null;
};

export type UseNotificationsArgs = {
  practiceId?: string;
  type?: string | null;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  readStatus?: "read" | "unread" | null;
  limit?: number;
  offset?: number;
};

export type SubmitAssetsArgs = {
  selectionId: string;
  chosenCreative: string | null;
  assets: any; // final structured assets object (see modal buildFinalAssets())
  note: string | null;
};

export type MarkReadArgs = {
  notificationId: string;
};
