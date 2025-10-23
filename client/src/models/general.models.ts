import { Campaign } from "./campaign.models";

export enum ViewModes {
  Cards = "cards",
  Table = "table",
  Calendar = "calendar",
}

export enum UserTabModes {
  Browse = "browse",
  Selected = "selected",
}

export interface Filters {
  viewMode: ViewModes;
  dateRange: {
    from: any;
    to: any;
  };
  categories: string[];
  objectives: string[];
  topics: string[];
  hideSelected: boolean;
  userSelectedTab?: UserTabModes;
}

export interface FilterOptions {
  objectives: string[];
  topics: string[];
  categories: string[];
}

export interface AppState {
  filters?: Filters;
  filtersOptions?: FilterOptions;
  allCampaigns?: {
    loading: boolean;
    hasPlans: boolean;
    data: Campaign[];
  };
}

export interface AssetOption {
  label: string;
  value: number;
}

export interface AssetItem {
  name: string;
  price: number | null;
  quantity: number | null;
  suffix: string | null;
  type: string;
  adminRequested: boolean;
  userSelected: boolean;
  options?: AssetOption[];
  note?: string;
}

export interface AssetCategory {
  id: string;
  type: string;
  content: AssetItem[];
}

export interface GetAssetsResponse {
  printedAssets: AssetCategory;
  digitalAssets: AssetCategory;
  externalPlacements: AssetCategory;
}
