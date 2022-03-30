export enum FnDescriptionStatus {
  Available,
  Pending,
  Added,
  Challenged,
}

export type FnEntry = {
  notice: string;
  sigHash: string;
  status: FnDescriptionStatus;
  submitter: string;
  disputed: boolean;
  upsertAt: number;
};
