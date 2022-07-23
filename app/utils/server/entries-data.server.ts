import type { FnEntry } from "~/types";
import { arweaveResolver } from "~/utils/arweave";

const arweave = arweaveResolver();

export const getSanitizedEntriesData = async (
  fns: FnEntry[]
): Promise<FnEntry[]> => {
  const responses = (await Promise.allSettled(
    fns.map((f) => fetchFallbackData(f))
  )) as PromiseSettledResult<FnEntry>[];

  const fulfilledResponses = responses.filter(
    (r) => r.status === "fulfilled"
  ) as PromiseFulfilledResult<FnEntry>[];

  const fnsWithFallbackData = fulfilledResponses.map((r) => r.value);

  return fns.map((f) => {
    const fnFallback = fnsWithFallbackData.find(
      ({ sigHash }) => f.sigHash == sigHash
    );
    if (fnFallback) {
      return fnFallback;
    }
    return f;
  });
};

export const fetchFallbackData = async (f: FnEntry): Promise<FnEntry> => {
  // fallback to fetch data from Arweave
  const data = await arweave.json(f.cid);

  return {
    ...f,
    ...data,
  };
};
