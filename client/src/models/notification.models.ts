import { CreativeItem } from "@/pages/notificationsCenter/practiceRespondModal/CreativePicker";
import { ActorNotificationType, SelectionStatus } from "@/shared/shared.models";
import { Assets } from "./campaign.models";

// Combined notification type that includes both workflow statuses and actor notification types
export type NotificationType = SelectionStatus | ActorNotificationType | "feedbackRequested";

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

export interface NotificationPayload {
	name: string;
	note: string;
	tier: string;
	assets: Assets;
	from_date: string;
	to_date: string;
	category: string;
	description?: string;
	creatives?: {
		url?: string;
		label?: string;
	}[];
	bespoke_id?: string;
	event_type?: string;
	is_bespoke?: boolean;
	campaign_id?: string;
	chosen_creative?: string;
	markup_link?: string;
	assets_link?: string;
}

export type NotificationRow = {
	id: string;
	type: NotificationType;
	practice_id: string | null;
	practice_name: string | null; // NEW
	selection_id: string | null;
	campaign_id: string | null;
	title: string | null;
	message: string | null;
	payload: NotificationPayload;
	created_at: string;
	read_at: string | null;
};

export type UseNotificationsArgs = {
	practiceId?: string;
	type?: string | null;
	category?: string | null;
	startDate?: any;
	endDate?: any;
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
