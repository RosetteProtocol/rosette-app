import { decodeCalldata, evaluateRaw } from "@blossom-labs/rosette";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getSearchParams } from "~/utils/server/utils.server";
import { getProvider } from "~/utils/server/web3.server";

export const loader: LoaderFunction = async ({ request }) => {
  const [abi, description, to, data, networkId] = getSearchParams(request.url, [
    "abi",
    "description",
    "to",
    "data",
    "networkId",
  ]);
  const provider = getProvider(Number(networkId));
  const transaction = { to, data };
  const bindings = decodeCalldata(abi, transaction);

  try {
    const evaluatedDescription = await evaluateRaw(
      description,
      bindings,
      provider,
      { transaction }
    );

    return json({ result: evaluatedDescription });
  } catch (err) {
    const err_ = err as Error;

    return json({ error: err_.message });
  }
};
