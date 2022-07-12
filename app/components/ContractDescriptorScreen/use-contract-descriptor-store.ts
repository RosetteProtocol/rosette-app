import { createStore } from "@udecode/zustood";
import type { SetImmerState, SetRecord, StoreApiGet } from "@udecode/zustood";
import { utils } from "ethers";
import type { FunctionFragment } from "ethers/lib/utils";
import { FnDescriptionStatus } from "~/types";
import type { ValueOrArray } from "~/types";
import type { ContractData, FnEntry } from "~/types";
import { getFnSelector } from "~/utils";
import { getDefaultParamValues } from "~/utils/client/param-value.client";
import type { FieldParamValue } from "~/utils/client/param-value.client";
import { accessMultidimensionalArray } from "~/utils/client/utils.client";

export type FnDescriptorEntry = {
  fullName: string;
  sigHash: string;
  entry?: FnEntry;
};

export type UserFnDescription = {
  sigHash: string;
  description: string;
};

export type TestingParam = ValueOrArray<FieldParamValue>;

type ContractDescriptorState = {
  contractAddress: string;
  contractNetworkId: number;
  fnSelected: number;
  fnDescriptorEntries: FnDescriptorEntry[];
  filteredFnDescriptorEntries: FnDescriptorEntry[];
  userFnDescriptions: Record<string, UserFnDescription>; // Use an object to index descriptions to facilitate state updates at the expense of having some function data duplication (sigHash, minimalName, etc)
  readyToFocus: boolean;
  lastCaretPos: number;
  filters: Record<FnDescriptionStatus, boolean>;
  fnsTestingParams: Record<string, TestingParam[]>;
};

export const parseNestingPos = (id: string): number[] =>
  id.split(".").map((i) => Number(i));

const initialState: ContractDescriptorState = {
  contractAddress: "",
  contractNetworkId: -1,
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
  fnsTestingParams: {},
};

const contractDescriptorStore = createStore("contract-descriptor")(
  initialState,
  {
    devtools: { enabled: process.env.NODE_ENV === "development" },
  }
)
  .extendSelectors((_, get) => ({
    fnDescriptionsCounter: () => Object.keys(get.userFnDescriptions()).length,
    currentFnDescriptorEntry: (): FnDescriptorEntry =>
      get.filteredFnDescriptorEntries()[get.fnSelected()],
    currentDescription: (): string => {
      const descriptorEntry =
        get.filteredFnDescriptorEntries()[get.fnSelected()];
      const userDescription = get.userFnDescriptions()[descriptorEntry.sigHash];

      return userDescription.description ?? descriptorEntry.entry?.notice ?? "";
    },
  }))
  .extendActions((set, get) => ({
    setUpContractDescriptorStore: (
      contractData: ContractData,
      entries: FnEntry[]
    ) => {
      const { abi, address, network } = contractData;
      const abiInterface = new utils.Interface(abi);
      const fnFragments = abiInterface.fragments.filter(
        (f) => f.type === "function"
      ) as FunctionFragment[];
      // Only consider functions that change state
      const nonConstantFnFragments = fnFragments.filter((f) => !f.constant);
      const fns = nonConstantFnFragments.map((f) => {
        const sigHash = getFnSelector(f);
        return {
          fullName: f.format("full"),
          sigHash,
          entry: entries?.find((e) => e.sigHash === sigHash),
        };
      });

      set.contractAddress(address);
      set.contractNetworkId(network.id);
      set.fnDescriptorEntries(fns);
      set.filteredFnDescriptorEntries(fns.filter((fn) => !fn.entry));
      set.fnsTestingParams(
        nonConstantFnFragments.reduce(
          (
            fnsTestingParams: ContractDescriptorState["fnsTestingParams"],
            f
          ) => {
            fnsTestingParams[getFnSelector(f)] = f.inputs.map((inp, i) =>
              getDefaultParamValues(inp)
            );
            return fnsTestingParams;
          },
          {}
        )
      );
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
      set.state((draft) => {
        draft.filters[filterName] = !draft.filters[filterName];
        draft.fnSelected = 0;
        draft.filteredFnDescriptorEntries = draft.fnDescriptorEntries.filter(
          (fnDescriptor) => {
            const entry = fnDescriptor.entry;
            const isAvailable = !entry;

            if (isAvailable) {
              return draft.filters[FnDescriptionStatus.Available];
            }

            return draft.filters[entry!.status];
          }
        );
      });
    },
    upsertFnDescription: (sigHash: string, description: string) => {
      const userFnDescriptions = get.userFnDescriptions();

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
        if (userFnDescriptions[sigHash]) {
          set.state((draft) => {
            delete draft.userFnDescriptions[sigHash];
          });
        }
        return;
      }

      if (userFnDescriptions[sigHash]?.description === description) {
        return;
      }

      // Delete empty descriptions
      if (!description && userFnDescriptions[sigHash]) {
        set.state((draft) => {
          delete draft.userFnDescriptions[sigHash];
        });

        return;
      }

      set.state((draft) => {
        if (draft.userFnDescriptions[sigHash]) {
          draft.userFnDescriptions[sigHash].description = description;
        } else {
          draft.userFnDescriptions[sigHash] = {
            sigHash,
            description,
          };
        }
      });
    },
    updateFnTestingParams: (
      sigHash: string,
      fnTestingParams: TestingParam[]
    ) => {
      set.state((draft) => {
        // Ignore excessively deep recursive type
        // @ts-ignore
        draft.fnsTestingParams[sigHash] = fnTestingParams;
      });
    },
    updateFnTestingParam: (
      sigHash: string,
      paramValues: FieldParamValue,
      nestingPosition: string
    ) => {
      set.state((draft) => {
        const indexes = parseNestingPos(nestingPosition);
        let fnTestingParams: ValueOrArray<TestingParam> | undefined;
        let testingParamOrParams: ValueOrArray<TestingParam>;
        let elementIndex: keyof TestingParam;

        // For non-array param cases do the following
        if (indexes.length === 1) {
          fnTestingParams = draft.fnsTestingParams[sigHash];
          elementIndex = indexes[0] as keyof TestingParam;

          testingParamOrParams = fnTestingParams[elementIndex];
        } else {
          const deletedIndexes = indexes.splice(-1, 1);
          fnTestingParams = accessMultidimensionalArray<TestingParam>(
            draft.fnsTestingParams[sigHash],
            indexes
          );
          elementIndex = deletedIndexes[0] as keyof TestingParam;

          if (!fnTestingParams || !Array.isArray(fnTestingParams)) {
            return;
          }

          testingParamOrParams = fnTestingParams[0][elementIndex];
        }

        if (Array.isArray(testingParamOrParams)) {
          return;
        }

        const { value, decimals } = testingParamOrParams || {};

        // Don't update when having the same value
        if (value == paramValues.value && decimals == paramValues.decimals) {
          return;
        }

        fnTestingParams[elementIndex] = paramValues;
      });
    },
    insertFnTestingArrayParam: (
      sigHash: string,
      nestingPos: string,
      paramType: utils.ParamType
    ) => {
      set.state((draft) => {
        const indexes = parseNestingPos(nestingPos);
        const testingParams = accessMultidimensionalArray<TestingParam>(
          // Ignore excessively deep recursive type
          // @ts-ignore
          draft.fnsTestingParams[sigHash],
          indexes
        );

        if (!testingParams || !Array.isArray(testingParams)) {
          return;
        }

        testingParams.push(getDefaultParamValues(paramType));
      });
    },
    removeFnTestingArrayParam: (sigHash: string, nestingPos: string) => {
      set.state((draft) => {
        const indexes = parseNestingPos(nestingPos);
        const deletedIndexes = indexes.splice(-1, 1);

        let upperOneElementArray: any;
        let upperOneElementArrayIndex: number = -1;
        let testingParams: any = draft.fnsTestingParams[sigHash];

        /**
         * By finding and removing the upper one element array
         * we avoid having empty nested arrays that we can't
         * remove otherwise.
         */
        for (let i = 0; i < indexes.length; i++) {
          const index = indexes[i];

          if (testingParams[index].length === 1) {
            if (i > 0 && !upperOneElementArray) {
              upperOneElementArray = testingParams;
              upperOneElementArrayIndex = index;
            }
          } else {
            upperOneElementArray = null;
            upperOneElementArrayIndex = -1;
          }

          testingParams = testingParams[index];
        }

        if (upperOneElementArray && upperOneElementArrayIndex > -1) {
          upperOneElementArray.splice(upperOneElementArrayIndex, 1);
          return;
        }

        const elementIndex = deletedIndexes[0];

        if (!testingParams || !Array.isArray(testingParams)) {
          return;
        }

        testingParams.splice(elementIndex, 1);
      });
    },
  }))
  .extendActions((set, get) => ({
    addHelperFunction: (fnSignature: string) => {
      const currentEntry = get.currentFnDescriptorEntry();
      const currentFnDescription = get.currentDescription();
      get.userFnDescriptions()[currentEntry.sigHash];
      const fieldCaretPos = get.lastCaretPos();
      const newDescription = `${currentFnDescription.slice(
        0,
        fieldCaretPos
      )}\`${fnSignature}\`${currentFnDescription.slice(fieldCaretPos)}`;

      set.upsertFnDescription(currentEntry.sigHash, newDescription);

      // Wait a little bit for the description to update.
      setTimeout(() => set.readyToFocus(true), 100);
      setTimeout(() => set.readyToFocus(false), 100);
    },
  }));

export const useContractDescriptorStore = contractDescriptorStore.useStore;
export const selectors = contractDescriptorStore.use;
export const actions = contractDescriptorStore.set;

export const useTestModalData = () => {
  const {
    contractAddress,
    contractNetworkId,
    fnSelected,
    userFnDescriptions,
    fnsTestingParams,
  } = useContractDescriptorStore();
  const { entry, fullName, sigHash } =
    selectors.filteredFnDescriptorEntries()[fnSelected] ?? {};
  const userDescription = userFnDescriptions[sigHash];
  const testingParams = fnsTestingParams[sigHash] ?? {};
  const description = userDescription?.description ?? entry?.notice ?? "";

  return {
    contractAddress,
    contractNetworkId,
    description,
    fnAbi: fullName,
    testingParams,
    sigHash,
  };
};
