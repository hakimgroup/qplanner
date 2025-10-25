export type AdminAssetsPayload = {
  selectionId: string;
  isBespoke: boolean;
  bespokeCampaignId?: string | null;
  assets: any; // Your Assets type (printedAssets/digitalAssets/externalPlacements)
};

export type RequestAssetsInput = {
  selectionId: string;
  creativeUrls: string[]; // up to 4
  note?: string | null;
  recipientIds?: string[] | null; // optional explicit recipients
};

export type NotificationRow = {
  id: string;
  type: string;
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
  type?: string | null;
  practiceId?: string | null;
  onlyUnread?: boolean;
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
