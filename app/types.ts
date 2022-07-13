import type { Chain } from "wagmi";

export type ValueOrArray<T> = T | ValueOrArray<T>[];

export enum FnDescriptionStatus {
  Available = "available",
  Added = "added",
}

export type FnEntry = {
  id: string;
  abi: string;
  cid: string;
  contract: string;
  notice: string;
  sigHash: string;
  status: FnDescriptionStatus;
  submitter: string;
  upsertAt: number;
};

export type ContractData = {
  abi: string;
  address: string;
  bytecode: string;
  name: string;
  network: Chain;
};

export type AggregatedContract = {
  proxy?: ContractData;
  implementation?: ContractData;
};
