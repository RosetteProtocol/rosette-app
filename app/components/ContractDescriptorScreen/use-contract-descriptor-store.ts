import { createStore } from "@udecode/zustood";

type ContractDescriptorState = {
  fnSelected: number;
  fnDescriptions: Record<string, string>;
};

const initialState: ContractDescriptorState = {
  fnSelected: 0,
  fnDescriptions: {},
};

const contractDescriptorStore = createStore("contract-descriptor")(
  initialState
).extendActions((set, get) => ({
  goToNextFn: (maximum: number) => {
    const prevFnSelected = get.fnSelected();

    set.fnSelected(Math.min(maximum - 1, prevFnSelected + 1));
  },
  goToPrevFn: () => {
    const prevFnSelected = get.fnSelected();
    set.fnSelected(Math.max(0, prevFnSelected - 1));
  },
  upsertFnDescription: (sigHash: string, description: string) => {
    const prevFnDescriptions = get.fnDescriptions();
    const prevDescription = prevFnDescriptions[sigHash];

    if (!description || prevDescription === description) {
      return;
    }

    set.fnDescriptions({
      ...prevFnDescriptions,
      [sigHash]: description,
    });
  },
}));

export const useContractDescriptorStore = contractDescriptorStore.useStore;
export const actions = contractDescriptorStore.set;
