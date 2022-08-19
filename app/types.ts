import type { Chain } from "wagmi";

export type ValueOrArray<T> = T | ValueOrArray<T>[];

export enum FnDescriptionStatus {
  Available = "available",
  Challenged = "challenged",
  Pending = "pending",
  Added = "added",
}

export type FnEntryMetadata = {
  abi: string;
  bytecode: string;
  cid: string;
  notice: string;
};

export type FnEntrySubgraphData = {
  id: string;
  cid: string;
  contract: string;
  sigHash: string;
  status: FnDescriptionStatus;
  submitter: string;
  upsertAt: number;
};

export type FnEntry = FnEntrySubgraphData & FnEntryMetadata;

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
