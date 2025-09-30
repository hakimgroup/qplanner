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
}

export enum UserRoles {
	User = "user",
	Admin = "admin",
	SuperAdmin = "super_admin",
}

export enum SelectionStatus {
	Requested = "requested",
	Live = "live",
	InProgress = "inProgress",
	OnPlan = "onPlan",
	Cancelled = "cancelled",
	Confirmed = "confirmed",
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
	BrandActivations = "Brand Activations",
	Campaign = "Campaign",
	Evergreen = "Evergreen",
}
