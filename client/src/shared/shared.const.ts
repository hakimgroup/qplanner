import { AppState, UserTabModes, ViewModes } from "@/models/general.models";
import {
  SelectionActivity,
  SelectionsSource,
  SelectionStatus,
  UserRoles,
} from "./shared.models";

export const Colors = {
  cream: "#f3f4f6",
};

export const statusColors = {
  [SelectionStatus.OnPlan]: "#10ac84",
  [SelectionStatus.Requested]: "#ff7f50",
  [SelectionStatus.InProgress]: "#1e90ff",
  [SelectionStatus.AwaitingApproval]: "#8e44ad",
  [SelectionStatus.Confirmed]: "#5352ed",
  [SelectionStatus.Live]: "#2ed573",
  [SelectionStatus.Completed]: "#636e72",
};

export const activityColors = {
  [SelectionActivity.Event]: "#7b2eda",
  [SelectionActivity.BrandActivations]: "#ff6348",
  [SelectionActivity.Campaign]: "#1e90ff",
  [SelectionActivity.Evergreen]: "#10ac84",
};

export const sourceColors = {
  [SelectionsSource.Admin]: "#5352ed",
  [SelectionsSource.Manual]: "#57606f",
  [SelectionsSource.Quick]: "#8e44ad",
  [SelectionsSource.Guided]: "#10ac84",
};

export const userRoleColors = {
  [UserRoles.Admin]: "#8e44ad",
  [UserRoles.User]: "#1e90ff",
  [UserRoles.SuperAdmin]: "#ff6348",
};

export const appStateDefault: AppState = {
  filtersOptions: null,
  filters: {
    viewMode: ViewModes.Cards,
    dateRange: {
      from: null,
      to: null,
    },
    categories: [],
    objectives: [],
    topics: [],
    hideSelected: false,
    userSelectedTab: UserTabModes.Browse,
  },
  allCampaigns: {
    loading: false,
    hasPlans: true,
    data: [],
  },
};
