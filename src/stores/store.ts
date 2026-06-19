import { create } from 'zustand';
import { CounterStore, createCounterSlice } from './slices/counter';
import { immer } from 'zustand/middleware/immer';

export const useBoundStore = create<CounterStore>()(
	immer((...a) => ({
		...createCounterSlice(...a),
	})),
);
