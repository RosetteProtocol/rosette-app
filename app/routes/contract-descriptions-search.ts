import type { LoaderFunction } from "@remix-run/node";
import { getSearchParams } from "~/utils/server/utils.server";
import { fetchEntries } from "~/utils/server/entries-data.server";
import { fetchContractFnEntries } from "~/utils/server/subgraph.server";

export const loader: LoaderFunction = async ({ request }) => {
  const [bytecodeHash] = getSearchParams(request.url, ["bytecodeHash"]);

  const fnEntriesSubgraphData = await fetchContractFnEntries(bytecodeHash);

  const fns = await fetchEntries(fnEntriesSubgraphData);

  return fns;
};
