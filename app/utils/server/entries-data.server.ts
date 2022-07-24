import type { FnEntry, FnEntryMetadata, FnEntrySubgraphData } from "~/types";
import { arweaveResolver } from "~/utils/arweave";

const arweave = arweaveResolver();

export const fetchEntryMetadata = async (
  id: string
): Promise<FnEntryMetadata> => {
  const metadata = await arweave.json(id);
  return { id, ...metadata } as FnEntryMetadata;
};

export const fetchEntriesMetadata = async (
  ids: string[]
): Promise<FnEntryMetadata[]> => {
  const responses = (await Promise.allSettled(
    ids.map((id) => fetchEntryMetadata(id))
  )) as PromiseSettledResult<FnEntryMetadata>[];

  const fulfilledResponses = responses.filter(
    (r) => r.status === "fulfilled"
  ) as PromiseFulfilledResult<FnEntryMetadata>[];

  return fulfilledResponses.map((r) => r.value);
};

export const fetchEntries = async (
  fns: FnEntrySubgraphData[]
): Promise<FnEntry[]> => {
  const fnsEntriesMetadata = await fetchEntriesMetadata(
    fns.map((fns) => fns.cid)
  );

  return fns.map((f) => {
    const metadata = fnsEntriesMetadata.find(({ id }) => f.cid == id)!;
    return {
      ...f,
      ...metadata,
    };
  });
};
