import { providers } from "ethers";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";

import { getConnectors } from "~/utils/client/connectors.client";

const Wagmi = ({ children }: { children: ReactNode }) => {
  const connectors = useMemo(() => getConnectors(window.ENV.CHAIN_ID), []);
  const ethersProvider = useMemo(
    () => new providers.JsonRpcProvider(window.ENV.RPC_URL),
    []
  );

  return (
    <WagmiProvider connectors={connectors} provider={ethersProvider}>
      {children}
    </WagmiProvider>
  );
};

export default Wagmi;
