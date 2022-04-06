import { Chain } from "wagmi";

export enum FnDescriptionStatus {
  Available = "available",
  Pending = "pending",
  Added = "added",
  Challenged = "challenged",
}

export type FnEntry = {
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

export type AggregateContract = {
  proxy?: ContractData;
  implementation?: ContractData;
};
