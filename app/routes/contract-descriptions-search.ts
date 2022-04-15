import type { LoaderFunction } from "@remix-run/node";
import { fetchContractFnEntries } from "~/utils/server/subgraph.server";

export const loader: LoaderFunction = ({ request }) => {
  const { searchParams } = new URL(request.url);
  const bytecodeHash = searchParams.get("bytecodeHash");

  if (!bytecodeHash) {
    throw new Response("Expected contract param", {
      status: 400,
      statusText: "Expected search params",
    });
  }

  return fetchContractFnEntries(bytecodeHash);
};
