import type {
	SearchContentApiResponse,
	CollectionContentResponse,
	CampaignDataResponse,
} from '@/lib/campaign-api';

export interface CampaignStore {
	query: string;
	searchData: SearchContentApiResponse | null;
	acceptedTgIds: number[];
	collectionData: CollectionContentResponse | null;
	campaignData: CampaignDataResponse | null;
	setCampaignContext: (
		query: string,
		searchData: SearchContentApiResponse,
		acceptedTgIds: number[],
		collectionData: CollectionContentResponse,
		campaignData: CampaignDataResponse,
	) => void;
	clearCampaign: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createCampaignSlice = (set: any): CampaignStore => ({
	query: '',
	searchData: null,
	acceptedTgIds: [],
	collectionData: null,
	campaignData: null,
	setCampaignContext: (
		query,
		searchData,
		acceptedTgIds,
		collectionData,
		campaignData,
	) =>
		set((state: CampaignStore) => {
			state.query = query;
			state.searchData = searchData;
			state.acceptedTgIds = acceptedTgIds;
			state.collectionData = collectionData;
			state.campaignData = campaignData;
		}),
	clearCampaign: () =>
		set((state: CampaignStore) => {
			state.query = '';
			state.searchData = null;
			state.acceptedTgIds = [];
			state.collectionData = null;
			state.campaignData = null;
		}),
});
