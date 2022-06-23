import type { LoaderFunction } from "@remix-run/node";
import { getSearchParams } from "~/utils/server/utils.server";
import { getSanitizedEntriesData } from "~/utils/server/entries-data.server";
import { fetchContractFnEntries } from "~/utils/server/subgraph.server";

export const loader: LoaderFunction = async ({ request }) => {
  const [bytecodeHash] = getSearchParams(request.url, ["bytecodeHash"]);

  const subgraphFnEntriesData = await fetchContractFnEntries(bytecodeHash);

  return getSanitizedEntriesData(subgraphFnEntriesData);
};
