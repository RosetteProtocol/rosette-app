export type ExplorerAPIData = {
  baseUrl: string;
  apiKey: string;
};

export type ExplorerResult = {
  ABI: string;
  Address: string;
  ContractName: string;
};

type ExplorerResponse = {
  message: string;
  result: ExplorerResult[];
  status: string;
};

export const getExplorerAPIData = (networkId: number): ExplorerAPIData => {
  let apiKey, baseUrl;

  switch (networkId) {
    case 1:
      apiKey = process.env.ETHERSCAN_EXPLORER_API_KEY;
      baseUrl = "https://api.etherscan.io/api";
      break;
    case 4:
      apiKey = process.env.ETHERSCAN_EXPLORER_API_KEY;
      baseUrl = "https://api-rinkeby.etherscan.io/api";
      break;
    case 100:
      apiKey = process.env.BLOCKSCOUT_EXPLORER_API_KEY;
      baseUrl = "https://blockscout.com/xdai/mainnet/api";
      break;
    case 137:
      apiKey = process.env.POLYGONSCAN_EXPLORER_API_KEY;
      baseUrl = "https://api.polygonscan.com/api";
      break;
    case 80001:
      apiKey = process.env.POLYGONSCAN_EXPLORER_API_KEY;
      baseUrl = "https://api-testnet.polygonscan.com/api";
      break;
  }

  if (!apiKey || !baseUrl) {
    throw new Response(
      `Blockchain explorer not found for given chain ${networkId}`,
      {
        status: 500,
      }
    );
  }

  return {
    baseUrl,
    apiKey,
  };
};

export const processExplorerResponse = async (
  response: Response
): Promise<ExplorerResult> => {
  const explorerResponse = (await response.json()) as ExplorerResponse;

  if (explorerResponse.status === "0") {
    throw new Response(explorerResponse.message, { status: 500 });
  }

  const result = explorerResponse.result[0];

  if (
    !result.ABI ||
    // Check ABI field as Blockscout sets it when contract is not verified
    result.ABI === "Contract source code not verified"
  ) {
    throw new Response(`Contract is not verified`, { status: 500 });
  }

  return result;
};

export const buildExplorerFetchRequest = (
  contractAddress: string,
  networkId: number
): string => {
  const { baseUrl, apiKey } = getExplorerAPIData(networkId);

  return `${baseUrl}?module=contract&action=getsourcecode&address=${contractAddress}${
    apiKey ? `&apikey=${apiKey}` : ""
  }`;
};
