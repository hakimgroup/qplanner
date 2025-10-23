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
