import { createStore } from "@udecode/zustood";
import { utils } from "ethers";
import { FnEntry } from "~/types";
import { getFnSelector } from "~/utils";

export type Function = {
  fullName: string;
  sigHash: string;
  entry?: FnEntry;
};

type ContractDescriptorState = {
  fnSelected: number;
  fnDescriptorEntries: Function[];
  userFnDescriptions: Record<string, string>;
};

const initialState: ContractDescriptorState = {
  fnSelected: 0,
  fnDescriptorEntries: [],
  userFnDescriptions: {},
};

const contractDescriptorStore = createStore("contract-descriptor")(
  initialState,
  {
    devtools: { enabled: process.env.NODE_ENV === "development" },
  }
)
  .extendActions((set, get) => ({
    setUpFnDescriptorEntries: (abi: string, entries: FnEntry[]) => {
      const abiInterface = new utils.Interface(abi);
      const fnFragments = abiInterface.fragments.filter(
        (f) => f.type === "function"
      );

      const fns = fnFragments.map((f) => {
        const sigHash = getFnSelector(f);
        return {
          fullName: f.format("full"),
          sigHash,
          entry: entries.find((e) => e.sigHash === sigHash),
        };
      });

      set.fnDescriptorEntries(fns);
    },
    goToNextFn: () => {
      const prevFnSelected = get.fnSelected();
      const fns = get.fnDescriptorEntries();

      set.fnSelected(Math.min(fns.length - 1, prevFnSelected + 1));
    },
    goToPrevFn: () => {
      const prevFnSelected = get.fnSelected();
      set.fnSelected(Math.max(0, prevFnSelected - 1));
    },
    upsertFnDescription: (sigHash: string, description: string) => {
      const prevFnDescriptions = get.userFnDescriptions();
      const prevDescription = prevFnDescriptions[sigHash];

      if (prevDescription === description) {
        return;
      }

      if (!description && prevFnDescriptions.hasOwnProperty(sigHash)) {
        const newFnDescriptions = { ...prevFnDescriptions };
        delete newFnDescriptions[sigHash];

        set.userFnDescriptions(newFnDescriptions);

        return;
      }

      set.userFnDescriptions({
        ...prevFnDescriptions,
        [sigHash]: description,
      });
    },
  }))
  .extendSelectors((set, get) => ({
    fnDescriptionsCounter: () => Object.keys(get.userFnDescriptions()).length,
  }));

export const useContractDescriptorStore = contractDescriptorStore.useStore;
export const selectors = contractDescriptorStore.use;
export const actions = contractDescriptorStore.set;
