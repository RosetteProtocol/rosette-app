import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getSearchParams } from "~/utils/server/utils.server";
import { getProvider } from "~/utils/server/web3.server";

export const loader: LoaderFunction = async ({ request }) => {
  const [networkId, transactionHash] = getSearchParams(request.url, [
    "networkId",
    "transactionHash",
  ]);
  const provider = getProvider(Number(networkId));

  try {
    const tx = await provider.getTransaction(transactionHash);

    return json({ tx: tx ? { to: tx.to, data: tx.data } : null });
  } catch (err) {
    const err_ = err as Error;
    return new Response(err_.message, { status: 500 });
  }
};
