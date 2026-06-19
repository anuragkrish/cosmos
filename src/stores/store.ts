import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CounterStore, createCounterSlice } from './slices/counter';
import { CampaignStore, createCampaignSlice } from './slices/campaign';

type BoundStore = CounterStore & CampaignStore;

export const useBoundStore = create<BoundStore>()(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	immer<BoundStore>((set, get, store) => ({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		...createCounterSlice(set as any, get as any, store as any),
		...createCampaignSlice(set),
	})),
);
