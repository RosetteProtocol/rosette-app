import { providers } from "ethers";
import { allChains } from "wagmi";
import {
  buildExplorerFetchRequest,
  processExplorerResponse,
} from "./blockchain-explorers.server";
import { fetchContractFnEntries } from "./subgraph.server";

const STATIC_PROVIDERS_CACHE = new Map<
  number,
  providers.StaticJsonRpcProvider
>();

export const fetchContractData = async (
  contractAddress: string,
  networkId: number
) => {
  const rpcEndpoint = allChains.find(({ id }) => id === networkId)?.rpcUrls[0];
  const provider = STATIC_PROVIDERS_CACHE.has(networkId)
    ? STATIC_PROVIDERS_CACHE.get(networkId)
    : new providers.StaticJsonRpcProvider(rpcEndpoint, networkId);

  const explorerRequest = fetch(
    buildExplorerFetchRequest(contractAddress, networkId)
  );

  const requests = [explorerRequest, provider?.getCode(contractAddress)];

  const responses = await Promise.all(requests);

  const explorerResult = await processExplorerResponse(
    responses[0] as Response
  );
  const bytecode = responses[1] as string;

  if (!bytecode) {
    throw new Response("Contract bytecode not found", { status: 500 });
  }

  const currentFnEntries = await fetchContractFnEntries(bytecode);

  return {
    abi: explorerResult.ABI,
    bytecode,
    contractName: explorerResult.ContractName,
    currentFnEntries,
  };
};
