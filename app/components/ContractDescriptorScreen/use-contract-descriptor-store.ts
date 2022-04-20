import { createStore } from "@udecode/zustood";
import { utils } from "ethers";
import type { FunctionFragment } from "ethers/lib/utils";
import type { FnEntry, UserFnDescription } from "~/types";
import { getFnSelector } from "~/utils";

export type Function = {
  fullName: string;
  minimalName: string;
  sigHash: string;
  entry?: FnEntry;
};

type ContractDescriptorState = {
  fnSelected: number;
  fnDescriptorEntries: Function[];
  /**
   * Use an object to index descriptions to ease state updates at
   * the expense of having some fn data duplication (sigHash, minimalName, etc)
   */
  userFnDescriptions: Record<string, UserFnDescription>;
  readyToFocus: boolean;
  lastCaretPos: number;
};

const initialState: ContractDescriptorState = {
  fnSelected: 0,
  fnDescriptorEntries: [],
  userFnDescriptions: {},
  readyToFocus: false,
  lastCaretPos: 0,
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
            minimalName: f.format("minimal"),
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
    upsertFnDescription: (userFnDescription: UserFnDescription) => {
      const { sigHash, description } = userFnDescription;
      const prevUserFnDescriptions = get.userFnDescriptions();

      if (prevUserFnDescriptions[sigHash]?.description === description) {
        return;
      }

      if (!description && prevUserFnDescriptions.hasOwnProperty(sigHash)) {
        const newUserFnDescriptions = { ...prevUserFnDescriptions };
        delete newUserFnDescriptions[sigHash];

        set.userFnDescriptions(newUserFnDescriptions);

        return;
      }

      set.userFnDescriptions({
        ...prevUserFnDescriptions,

        [sigHash]: userFnDescription,
      });
    },
  }))
  .extendActions((set, get) => ({
    addHelperFunction: (fnSignature: string) => {
      const fnSelected = get.fnSelected();
      const selectedEntry = get.fnDescriptorEntries()[fnSelected];
      const selectedUserFnDescription =
        get.userFnDescriptions()[selectedEntry.sigHash];
      const fieldCaretPos = get.lastCaretPos();
      const oldDescription = selectedUserFnDescription?.description ?? "";
      const newDescription = `${oldDescription.slice(
        0,
        fieldCaretPos
      )}\`${fnSignature}\`${oldDescription.slice(fieldCaretPos)}`;

      const newUserFnDescription: UserFnDescription = selectedUserFnDescription
        ? {
            ...selectedUserFnDescription,
            description: newDescription,
          }
        : {
            sigHash: selectedEntry.sigHash,
            description: newDescription,
            minimalName: selectedEntry.minimalName,
          };

      set.upsertFnDescription(newUserFnDescription);

      // Wait a little bit for the description to update.
      setTimeout(() => set.readyToFocus(true), 100);
      setTimeout(() => set.readyToFocus(false), 100);
    },
  }))
  .extendSelectors((_, get) => ({
    fnDescriptionsCounter: () => Object.keys(get.userFnDescriptions()).length,
  }));

export const useContractDescriptorStore = contractDescriptorStore.useStore;
export const selectors = contractDescriptorStore.use;
export const actions = contractDescriptorStore.set;
