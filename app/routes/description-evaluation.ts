import { decodeCalldata, evaluateRaw } from "@blossom-labs/rosette";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getSearchParams } from "~/utils/server/utils.server";
import { getProvider } from "~/utils/server/web3.server";
import { constants } from "ethers";

const DEFAULT_VALUE = "1".padEnd(19, "0");

export const loader: LoaderFunction = async ({ request }) => {
  const [abi, description, to, data, networkId] = getSearchParams(request.url, [
    "abi",
    "description",
    "to",
    "data",
    "networkId",
  ]);
  const provider = getProvider(Number(networkId));
  const transaction = {
    to,
    data,
    from: constants.AddressZero,
    value: DEFAULT_VALUE,
  };
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
