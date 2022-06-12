import { createStore } from "@udecode/zustood";
import type { SetImmerState, SetRecord, StoreApiGet } from "@udecode/zustood";
import { utils } from "ethers";
import type { FunctionFragment } from "ethers/lib/utils";
import type { FnEntry } from "~/types";
import { FnDescriptionStatus } from "~/types";
import { getFnSelector } from "~/utils";

export type Function = {
  fullName: string;
  sigHash: string;
  entry?: FnEntry;
};

export type UserFnDescription = {
  sigHash: string;
  description: string;
};

type ContractDescriptorState = {
  fnSelected: number;
  fnDescriptorEntries: Function[];
  filteredFnDescriptorEntries: Function[];
  /**
   * Use an object to index descriptions to facilitate state updates at
   * the expense of having some function data duplication (sigHash, minimalName, etc)
   */
  userFnDescriptions: Record<string, UserFnDescription>;
  readyToFocus: boolean;
  lastCaretPos: number;
  filters: Record<FnDescriptionStatus, boolean>;
};

const initialState: ContractDescriptorState = {
  fnSelected: 0,
  fnDescriptorEntries: [],
  filteredFnDescriptorEntries: [],
  userFnDescriptions: {},
  readyToFocus: false,
  lastCaretPos: 0,
  filters: {
    added: false,
    available: true,
    challenged: false,
    pending: false,
  },
};

const removeUserFnDescription = (
  sigHash: string,
  set: SetRecord<ContractDescriptorState> & {
    state: SetImmerState<ContractDescriptorState>;
  },
  get: StoreApiGet<ContractDescriptorState, {}>
) => {
  const newUserFnDescriptions = { ...get.userFnDescriptions() };
  delete newUserFnDescriptions[sigHash];
  set.userFnDescriptions(newUserFnDescriptions);
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
      ) as FunctionFragment[];

      const fns = fnFragments
        .filter((f) => !f.constant) // Only consider functions that does not change state
        .map((f) => {
          const sigHash = getFnSelector(f);
          return {
            fullName: f.format("full"),
            sigHash,
            entry: entries?.find((e) => e.sigHash === sigHash),
          };
        });

      set.fnDescriptorEntries(fns);
      set.filteredFnDescriptorEntries(fns.filter((fn) => !fn.entry));
    },
    goToNextFn: () => {
      const prevFnSelected = get.fnSelected();
      const fns = get.filteredFnDescriptorEntries();

      set.fnSelected(Math.min(fns.length - 1, prevFnSelected + 1));
    },
    goToPrevFn: () => {
      const prevFnSelected = get.fnSelected();
      set.fnSelected(Math.max(0, prevFnSelected - 1));
    },
    toggleFilter: (filterName: keyof ContractDescriptorState["filters"]) => {
      const newFilters = { ...get.filters() };

      newFilters[filterName] = !newFilters[filterName];

      const newFilteredDescriptorEntries = get
        .fnDescriptorEntries()
        .filter((fnDescriptor) => {
          const entry = fnDescriptor.entry;
          const isAvailable = !entry;

          if (isAvailable) {
            return newFilters[FnDescriptionStatus.Available];
          }

          return newFilters[entry!.status];
        });

      set.fnSelected(0);
      set.filteredFnDescriptorEntries(newFilteredDescriptorEntries);
      set.filters(newFilters);
    },
    upsertFnDescription: (sigHash: string, description: string) => {
      const prevUserFnDescriptions = get.userFnDescriptions();

      /**
       * Don't insert a description that equals an already existing description entry.
       */
      if (
        get
          .fnDescriptorEntries()
          .find(
            (fn) => fn.sigHash === sigHash && fn.entry?.notice === description
          )
      ) {
        /**
         * The user may edit descriptions already inserted by them and then revert the changes back to the original
         * value. When this happens, we need to remove the description.
         */
        if (prevUserFnDescriptions[sigHash]) {
          removeUserFnDescription(sigHash, set, get);
        }
        return;
      }

      if (prevUserFnDescriptions[sigHash]?.description === description) {
        return;
      }

      // Delete empty descriptions
      if (!description && prevUserFnDescriptions[sigHash]) {
        removeUserFnDescription(sigHash, set, get);
        return;
      }

      // Upsert the new description
      set.userFnDescriptions({
        ...prevUserFnDescriptions,
        [sigHash]: {
          ...prevUserFnDescriptions[sigHash],
          description,
        },
      });
    },
  }))
  .extendActions((set, get) => ({
    addHelperFunction: (fnSignature: string) => {
      const selectedEntry = get.filteredFnDescriptorEntries()[get.fnSelected()];
      const selectedUserFnDescription =
        get.userFnDescriptions()[selectedEntry.sigHash];
      const fieldCaretPos = get.lastCaretPos();
      const oldDescription =
        selectedUserFnDescription?.description ??
        selectedEntry.entry?.notice ??
        "";
      const newDescription = `${oldDescription.slice(
        0,
        fieldCaretPos
      )}\`${fnSignature}\`${oldDescription.slice(fieldCaretPos)}`;

      set.upsertFnDescription(selectedEntry.sigHash, newDescription);

      // Wait a little bit for the description to update.
      setTimeout(() => set.readyToFocus(true), 100);
      setTimeout(() => set.readyToFocus(false), 100);
    },
  }))
  .extendSelectors((_, get) => ({
    fnDescriptionsCounter: () => Object.keys(get.userFnDescriptions()).length,
    currentFnDescriptorEntry: (): Function | undefined =>
      get.filteredFnDescriptorEntries()[get.fnSelected()],
  }));

export const useContractDescriptorStore = contractDescriptorStore.useStore;
export const selectors = contractDescriptorStore.use;
export const actions = contractDescriptorStore.set;
