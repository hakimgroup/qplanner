import {
	addCampaignAdmin,
	CampaignModel,
	CampaignsModel,
	createCampaign,
	editCampaignInList,
	EmailModel,
	getAllCampaigns,
	getCampaign,
	sendEmail,
	updateCampaign,
} from "@/api/campaign";
import { DatabaseTables } from "@/shared/shared.models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCampaign = (
	campaign_id?: string,
	user_id?: string,
	enabled = true,
	onSuccess?: () => void
) => {
	return useQuery<CampaignModel[]>({
		queryKey: [DatabaseTables.Campaigns, campaign_id],
		queryFn: () => getCampaign(user_id, campaign_id, onSuccess),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		enabled,
	});
};

export const useCreateCampaign = (onSuccess?: (id: string) => void) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (campaign: CampaignModel) => createCampaign(campaign),
		onSuccess: ({ campaign_id }) => {
			queryClient.invalidateQueries({
				queryKey: [DatabaseTables.Campaigns],
			});
			onSuccess(campaign_id);
		},
	});
};

export const useUpdateCampaign = (onSuccess?: (cm: CampaignModel) => void) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (c: CampaignModel) => updateCampaign(c),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: [DatabaseTables.Campaigns],
			});

			if (onSuccess) onSuccess(data);
		},
	});
};

export const useAddCampaignAdmin = (onSuccess?: () => void) => {
	return useMutation({
		mutationFn: (campaign: CampaignsModel) => addCampaignAdmin(campaign),
		onSuccess: () => {
			onSuccess();
		},
	});
};

export const useAllCampaigns = (
	campaign_id?: string,
	enabled = true,
	onSuccess?: () => void
) => {
	return useQuery<CampaignsModel[]>({
		queryKey: [DatabaseTables.CampaignsList, campaign_id],
		queryFn: () => getAllCampaigns(campaign_id, onSuccess),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		enabled,
	});
};

export const useEditCampaignInList = (onSuccess?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (c: CampaignsModel) => editCampaignInList(c),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [DatabaseTables.CampaignsList],
			});
			if (onSuccess) onSuccess();
		},
	});
};

export const useSendEmail = () => {
	return useMutation({
		mutationFn: (em: EmailModel) => sendEmail(em),
		onSuccess: () => {},
	});
};
