import type { FnEntry } from "~/types";
import { ipfsResolver } from "~/utils/ipfs";

const ipfs = ipfsResolver();

export const getSanitizedEntriesData = async (
  fns: FnEntry[]
): Promise<FnEntry[]> => {
  const responses = (await Promise.allSettled(
    fns.filter((f) => !f.notice).map((f) => fetchFallbackData(f))
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
  // fallback to fetch data from IPFS
  const data = await ipfs.json(f.cid);

  return {
    ...f,
    ...data,
  };
};
