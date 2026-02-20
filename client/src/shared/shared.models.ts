export enum AppRoutes {
  Home = "/",
  Login = "/login",
  Dashboard = "/dashboard",
  Admin = "/admin",
  Plans = "plans",
  Campaigns = "campaigns",
  Bespoke = "bespoke",
  Practices = "practices",
  PeopleAccess = "people-and-access",
  AuditLogs = "audit-logs",
  Settings = "settings",
  Help = "help-and-support",
  Notifications = "notifications",
  FAQs = "/faqs",
  NotificationsCenter = "/notifications-center",
}

export enum DatabaseTables {
  Users = "users",
  Campaigns = "campaigns",
  CampaignsCatalog = "campaigns_catalog",
  Selections = "selections",
  Practices = "practices",
  Allowed_Users = "allowed_users",
  BespokeCampaigns = "bespoke_campaigns",
  Notifications = "notifications",
  CommunicationLogs = "selection_status_history",
  PracticeMembers = "practice_members",
}

export enum RPCFunctions {
  LinkUser = "link_current_user",
  AssignUserToPractice = "assign_user_to_practice",
  UnAssignUserFromPractice = "unassign_user_from_practice",
  GetCampaigns = "get_campaigns",
  CreateBespokeSelection = "create_bespoke_selection",
  CreateBespokeEvent = "create_bespoke_event",
  AddCampaignsBulk = "add_campaigns_bulk",
  GetGuidedCampaigns = "get_guided_campaigns",
  GetPlans = "get_plans",
  GetUsers = "get_users",
  UpdateUser = "update_user",
  BulkUploadUsers = "bulk_upsert_allowed_users_with_practices",
  GetFilterOptions = "get_filter_options",
  CopyPracticeCampaigns = "copy_practice_campaigns",
  GetAssets = "get_assets",
  RequestAssets = "request_assets",
  RequestAssetsBulk = "request_assets_bulk",
  ListNotifications = "list_notifications",
  SubmitAssets = "submit_assets",
  MarkAsRead = "mark_notification_read",
  DeleteSelection = "delete_selection",
  QueuePracticeOnboardingEmail = "queue_practice_onboarding_email",
  ConfirmAssets = "confirm_assets",
  RequestRevision = "request_revision",
}

export enum UserRoles {
  User = "user",
  Admin = "admin",
  SuperAdmin = "super_admin",
}

export enum SelectionStatus {
  OnPlan = "onPlan",
  Requested = "requested",
  InProgress = "inProgress",
  AwaitingApproval = "awaitingApproval",
  Confirmed = "confirmed",
  Live = "live",
  Completed = "completed",
}

// Actor notification types (for in-app notifications when user performs CRUD actions)
export enum ActorNotificationType {
  CampaignAdded = "campaignAdded",
  CampaignUpdated = "campaignUpdated",
  CampaignDeleted = "campaignDeleted",
  BespokeAdded = "bespokeAdded",
  BespokeEventAdded = "bespokeEventAdded",
  BulkAdded = "bulkAdded",
  CampaignsCopied = "campaignsCopied",
}

export enum SelectionsSource {
  Manual = "manual",
  Quick = "quick",
  Guided = "guided",
  Admin = "admin",
}

export enum SelectionTier {
  Good = "good",
  Better = "better",
  Best = "best",
}

export enum SelectionActivity {
  Event = "Event",
  BrandActivations = "brand activation",
  Campaign = "campaign",
  Evergreen = "evergreen",
}
