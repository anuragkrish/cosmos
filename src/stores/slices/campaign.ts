import type {
	SearchContentApiResponse,
	CollectionContentResponse,
	CampaignDataResponse,
} from '@/lib/campaign-api';

export interface CampaignStore {
	searchData: SearchContentApiResponse | null;
	acceptedTgIds: number[];
	collectionData: CollectionContentResponse | null;
	campaignData: CampaignDataResponse | null;
	setCampaignContext: (
		searchData: SearchContentApiResponse,
		acceptedTgIds: number[],
		collectionData: CollectionContentResponse,
		campaignData: CampaignDataResponse,
	) => void;
	clearCampaign: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createCampaignSlice = (set: any): CampaignStore => ({
	searchData: null,
	acceptedTgIds: [],
	collectionData: null,
	campaignData: null,
	setCampaignContext: (
		searchData,
		acceptedTgIds,
		collectionData,
		campaignData,
	) =>
		set((state: CampaignStore) => {
			state.searchData = searchData;
			state.acceptedTgIds = acceptedTgIds;
			state.collectionData = collectionData;
			state.campaignData = campaignData;
		}),
	clearCampaign: () =>
		set((state: CampaignStore) => {
			state.searchData = null;
			state.acceptedTgIds = [];
			state.collectionData = null;
			state.campaignData = null;
		}),
});
