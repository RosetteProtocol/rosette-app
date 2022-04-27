import type { LoaderFunction } from "@remix-run/node";
import { getSanitizedEntriesData } from "~/utils/server/entries-data.server";
import { fetchContractFnEntries } from "~/utils/server/subgraph.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const bytecodeHash = searchParams.get("bytecodeHash");

  if (!bytecodeHash) {
    throw new Response("Expected contract param", {
      status: 400,
      statusText: "Expected search params",
    });
  }

  const subgraphFnEntriesData = await fetchContractFnEntries(bytecodeHash);

  return getSanitizedEntriesData(subgraphFnEntriesData);
};
