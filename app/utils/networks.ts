import ethereum from "~/assets/ethereum.svg";
import gnosisChain from "~/assets/gnosis-chain.svg";
import polygon from "~/assets/polygon.jpg";

export const getNetworkLogo = (networkId: number): string | undefined => {
  switch (networkId) {
    case 1:
    case 4:
      return ethereum;
    case 100:
      return gnosisChain;
    case 137:
    case 80001:
      return polygon;
  }
};

export const getNetworkApiEndpoint = (
  networkId: number
): string | undefined => {
  switch (networkId) {
    case 1:
      return "https://api.etherscan.io/api";
    case 4:
      return "https://api-rinkeby.etherscan.io/api";
    case 100:
      return "https://blockscout.com/xdai/mainnet/api";
    case 137:
      return "https://api.polygonscan.com/api";
    case 80001:
      return "https://api-testnet.polygonscan.com/api";
  }
};
