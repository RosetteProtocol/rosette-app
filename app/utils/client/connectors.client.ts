import { allChains } from "wagmi";
import type { Connector } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import { Buffer } from "buffer";

// polyfill Buffer for client
if (!window.Buffer) {
  window.Buffer = Buffer;
}

export const getConnectors = (chainId: string): Connector[] => {
  const chain = allChains.find((chain) => chain.id === Number(chainId));

  if (!chain) {
    throw new Error("CHAIN_ID not found: " + chainId);
  }

  return [
    new InjectedConnector({
      chains: [chain],
      options: { shimDisconnect: true },
    }),
    new WalletConnectConnector({
      chains: [chain],
      options: {
        infuraId: window.ENV.INFURA_ID,
        qrcode: true,
      },
    }),
  ];
};
