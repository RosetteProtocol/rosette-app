import { createStore } from "@udecode/zustood";
import type { SetImmerState, SetRecord, StoreApiGet } from "@udecode/zustood";
import { utils } from "ethers";
import type { FunctionFragment } from "ethers/lib/utils";
import { FnDescriptionStatus } from "~/types";
import type { ContractData, FnEntry } from "~/types";
import { getFnSelector } from "~/utils";

export type FnDescriptorEntry = {
  fullName: string;
  sigHash: string;
  entry?: FnEntry;
};

export type UserFnDescription = {
  sigHash: string;
  description: string;
};

export type ParamValues = { value: any; decimals?: number };
export type FnTestingParams = Record<string, ParamValues>;

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
  fnsTestingParams: Record<string, FnTestingParams>;
};

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

const getDefaultValue = (type: string): ParamValues => {
  if (type.includes("uint") || type.includes("ufixed")) {
    return { value: 1, decimals: 0 };
  }

  if (type === "string") {
    return { value: "Text example" };
  }

  if (type === "bool") {
    return { value: false };
  }

  return { value: "" };
};

export const buildTestingParamKey = (name: string, type: string): string =>
  `${name}-${type}`;

export const parseTestingParamKey = (key: string): string[] => key.split("-");

const contractDescriptorStore = createStore("contract-descriptor")(
  initialState,
  {
    devtools: { enabled: process.env.NODE_ENV === "development" },
  }
)
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
        nonConstantFnFragments.reduce((fnTestingParams, f) => {
          const sigHash = getFnSelector(f);
          const params = f.inputs.reduce(
            (params, { name, type }) => ({
              ...params,
              [buildTestingParamKey(name, type)]: getDefaultValue(type),
            }),
            {}
          );

          return { ...fnTestingParams, [sigHash]: params };
        }, {})
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
    upsertFnTestingParams: (
      sigHash: string,
      fnTestingParams: FnTestingParams
    ) => {
      const prevFnsTestingParams = get.fnsTestingParams();
      set.fnsTestingParams({
        ...prevFnsTestingParams,
        [sigHash]: fnTestingParams,
      });
    },
    upsertFnTestingParam: (
      sigHash: string,
      paramName: string,
      paramValue: ParamValues
    ) => {
      const prevfnTestingParams = get.fnsTestingParams();
      const prevTestingParams = prevfnTestingParams[sigHash];
      set.fnsTestingParams({
        ...prevfnTestingParams,
        [sigHash]: { ...prevTestingParams, [paramName]: paramValue },
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
    currentFnDescriptorEntry: (): FnDescriptorEntry | undefined =>
      get.filteredFnDescriptorEntries()[get.fnSelected()],
    currentDescription: (): string => {
      const descriptorEntry =
        get.filteredFnDescriptorEntries()[get.fnSelected()];
      const userDescription = get.userFnDescriptions()[descriptorEntry.sigHash];

      return userDescription.description ?? descriptorEntry.entry?.notice ?? "";
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
