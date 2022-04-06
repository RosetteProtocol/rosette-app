import { ContractData, AggregateContract } from "~/types";
import { getProvider, NETWORKS } from "./web3.server";
import {
  buildExplorerFetchRequest,
  processExplorerResponse,
} from "./blockchain-explorers.server";
import {
  fetchImplementationAddress,
  getProxyPattern,
} from "./proxy-patterns.server";
import { constants } from "ethers";
import { Chain } from "wagmi";

const processBytecodeRequest = (response: any): string => {
  const bytecode = response as string;

  if (!bytecode || bytecode === "0x") {
    throw new Response(
      !bytecode
        ? "Contract bytecode not found"
        : "Address provided is not a contract",
      { status: 500 }
    );
  }

  return bytecode;
};

export const fetchContracts = async (
  contractAddress: string
): Promise<AggregateContract[]> => {
  const responses = (await Promise.allSettled(
    NETWORKS.map((n) => fetchContractData(contractAddress, n))
  )) as PromiseSettledResult<ContractData>[];

  const fulfilledResponses = responses.filter(
    (r) => r.status === "fulfilled"
  ) as PromiseFulfilledResult<ContractData>[];
  const contracts = fulfilledResponses.map((r) => r.value);
  const proxiesAndImplementations = [];

  // Fetch proxy's implementation contract.
  for (const c of contracts) {
    let proxy, implementation;
    const proxyPattern = getProxyPattern(c.name);

    if (proxyPattern !== undefined) {
      proxy = c;
      const implementationAddress = await fetchImplementationAddress(
        proxy,
        proxyPattern
      );
      if (implementationAddress !== constants.AddressZero) {
        try {
          implementation = await fetchContractData(
            implementationAddress,
            c.network
          );
        } catch (err) {}
      }
    } else {
      implementation = c;
    }

    proxiesAndImplementations.push({ proxy, implementation });
  }

  return proxiesAndImplementations;
};

export const fetchContractData = async (
  contractAddress: string,
  network: Chain
): Promise<ContractData> => {
  const networkId = network.id;
  const provider = getProvider(networkId);
  const explorerRequest = fetch(
    buildExplorerFetchRequest(contractAddress, networkId)
  );

  const requests = [provider.getCode(contractAddress), explorerRequest];
  const responses = await Promise.all(requests);

  const bytecode = processBytecodeRequest(responses[0]);
  const explorerResult = await processExplorerResponse(
    responses[1] as Response
  );

  return {
    abi: explorerResult.ABI,
    bytecode,
    address: contractAddress,
    name: explorerResult.ContractName,
    network,
  };
};
