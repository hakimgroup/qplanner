import { SelectionsSource, SelectionStatus } from "@/shared/shared.models";
import { AssetItem, Assets as MainAssets } from "./general.models";

export interface BulkDeletePayload {
  ids: string[];
}

export const OBJECTIVES = [
  "ADV",
  "AOV",
  "Conversion",
  "Volume",
  "Sales (Turnover)",
  "Recurring revenue",
  "Eye test",
] as const;
export type Objective = (typeof OBJECTIVES)[number];

export const TOPICS = [
  "Frame",
  "Lens",
  "Contact lenses",
  "Kids",
  "Clinical",
  "Seasonal",
] as const;
export type Topic = (typeof TOPICS)[number];

export interface Availability {
  from?: Date;
  to?: Date;
}

export interface Assets {
  printedAssets: AssetItem[];
  digitalAssets: AssetItem[];
  externalPlacements?: AssetItem[];
  creative?: string;
  note?: string;
}

export interface Creatives {
  url?: string;
  label?: string;
}

export interface Campaign {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  assets?: Assets;
  creatives?: Creatives[];
  objectives?: Objective[];
  topics?: Topic[];
  availability?: Availability | null;
  reference_links?: string[];
  status?: SelectionStatus;
  is_bespoke?: boolean;
  custom_events?: boolean;
  selected?: boolean;
  selection_id?: string;
  selection_from_date?: string;
  selection_to_date?: string;
  selection_practice_id?: string;
  selection_practice_name?: string;
  notes?: string;
  tiers?: string[];
  source?: SelectionsSource | null;
  is_event?: boolean;
  event_type?: string;
  requirements?: string;
  focus?: string;
  duration?: string;
  bespoke_campaign_id?: string;
}

export type CreateBespokeInput = {
  name: string;
  description: string;
  from: Date;
  to: Date;

  // optional fields
  status?: string; // default 'onPlan'
  notes?: string | null;
  objectives?: string[]; // will be sent as jsonb
  topics?: string[]; // will be sent as jsonb
  reference_links?: string[];
  assets?: unknown; // any JSON-serializable shape (jsonb)
};

export type CreateBespokeEventInput = {
  practiceId?: string | null; // defaults to active practice if omitted
  eventType: string; // e.g. "Trunk Show"
  title: string;
  description: string;
  eventFromDate: Date;
  eventToDate: Date;
  objectives?: string[]; // jsonb array
  topics?: string[]; // jsonb array
  assets?: unknown;
  requirements?: string | null;
  notes?: string | null; // stored on selection
  links?: string[];
};

export type BulkAddCampaignsInput = {
  campaignIds: string[]; // catalog campaign UUIDs
  from?: Date; // start date
  to?: Date; // end date
  status?: string; // default 'onPlan'
  notes?: string | null; // optional notes
  practiceId?: string | null; // optional override; defaults to activePracticeId
  source?: SelectionsSource;
};

export type GuidedCampaign = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  objectives: string[]; // jsonb[]
  topics: string[]; // jsonb[]
  custom_events: boolean | null;
  more_info_link: string | null;
  status: string | null;
  score: number; // computed score
  already_on_plan: boolean; // novelty flag
  focus: string;
  availability: {
    from: string;
    to: string;
    duration: string;
  };
};

// Sliders/switches coming from the UI
export type GuidedParams = {
  clinical: number; // 0..100
  frame: number; // 0..100
  lens: number; // 0..100
  contact: number; // 0..100
  kids: boolean;
  seasonal: boolean;
  supplierBrand: boolean; // maps to category = 'Brand Activations'
  eventReady: boolean; // maps to custom_events = true
  activity: number; // 0..100 (maps to 2..20 in RPC)
};

export interface AdminModalSelection {
  id: string;
  name?: string;
  isBespoke?: boolean;
  bespoke_campaign_id?: string | null;
  campaign_id?: string | null;
  assets?: MainAssets | null;
  from_date?: string | Date | null;
  to_date?: string | Date | null;
  category?: string | null;
  topics?: string[];
  objectives?: string[];
  creatives?: Creatives[];
}
