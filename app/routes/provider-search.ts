import type { LoaderFunction } from "@remix-run/node";
import { getSearchParams } from "~/utils/server/utils.server";
import { getProvider } from "~/utils/server/web3.server";

export const loader: LoaderFunction = async ({ request }) => {
  const [networkId] = getSearchParams(request.url, ["networkId"]);

  return getProvider(Number(networkId));
};
