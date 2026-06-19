import { StateCreator } from 'zustand';

export type CounterState = {
	count: number;
};

export type CounterActions = {
	decrementCount: () => void;
	incrementCount: () => void;
};

export type CounterStore = CounterState & CounterActions;

export const initCounterStore = (): CounterState => {
	return { count: new Date().getFullYear() };
};

export const defaultInitState: CounterState = {
	count: 0,
};

export const createCounterSlice: StateCreator<CounterStore> = set => ({
	...defaultInitState,
	decrementCount: () => set(state => ({ count: state.count - 1 })),
	incrementCount: () => set(state => ({ count: state.count + 1 })),
});
