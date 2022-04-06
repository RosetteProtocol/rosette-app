import { providers } from "ethers";
import { allChains, Chain } from "wagmi";

const networkExplorerRegex = /([A-Z]+)_EXPLORER_API_KEY/;

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

const availableExplorers = Object.keys(process.env)
  .filter((key) => networkExplorerRegex.test(key))
  .map((key) => key.split("_")[0].toLowerCase());

const STATIC_PROVIDERS_CACHE = new Map<
  number,
  providers.StaticJsonRpcProvider
>();

export const NETWORKS = allChains.filter(
  (chain) =>
    // Check if chain has the same explorer
    !!chain.blockExplorers?.find(({ name }) =>
      availableExplorers.includes(name.toLowerCase())
    )
);

const buildRpcEndpoint = (network: Chain): string => {
  const infuraRpcEndpoints = network.rpcUrls.filter((rpcUrl) =>
    rpcUrl.includes("infura")
  );

  if (infuraRpcEndpoints.length) {
    return `${infuraRpcEndpoints[0]}/${INFURA_PROJECT_ID}`;
  }

  return network.rpcUrls[0];
};

export const getProvider = (networkId: number): providers.Provider => {
  if (STATIC_PROVIDERS_CACHE.has(networkId)) {
    return STATIC_PROVIDERS_CACHE.get(networkId)!;
  }

  const network = NETWORKS.find((n) => n.id === networkId)!;

  return new providers.StaticJsonRpcProvider(
    buildRpcEndpoint(network),
    networkId
  );
};