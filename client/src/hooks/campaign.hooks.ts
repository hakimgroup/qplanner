import { getAllCampaigns } from "@/api/campaign";
import { Campaign } from "@/models/campaign.models";
import { DatabaseTables } from "@/shared/shared.models";
import { useQuery } from "@tanstack/react-query";

export const useAllCampaigns = (
	practiceId?: string | null,
	enabled = true,
	onSuccess?: () => void
) => {
	return useQuery<Campaign[]>({
		queryKey: [DatabaseTables.CampaignsCatalog, practiceId],
		queryFn: () => getAllCampaigns(practiceId),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		enabled,
	});
};
