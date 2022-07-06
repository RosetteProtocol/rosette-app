import { utils } from "ethers";
import type { BigNumber } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useContractRead } from "wagmi";

import rosetteStoneAbi from "../abi/RosetteStone.json";

type RosetteStoneContextProps = {
  currentGuideline?: {
    collateralAmount: BigNumber;
    cooldownPeriod: BigNumber;
    guidelinesCID: string;
  };
  isLoading: boolean;
};

const RosetteStoneContext = createContext<RosetteStoneContextProps>(
  {} as RosetteStoneContextProps
);

export const RosetteStone = ({ children }: { children: ReactNode }) => {
  const [currentGuideline, setCurrentGuideline] =
    useState<RosetteStoneContextProps["currentGuideline"]>();
  const [isResConsumed, setIsResConsumed] = useState(false);
  const [guidelineResponse] = useContractRead(
    {
      addressOrName: window.ENV.ROSETTE_STONE_ADDRESS,
      contractInterface: rosetteStoneAbi,
    },
    "getCurrentGuideline"
  );

  useEffect(() => {
    if (isResConsumed || !guidelineResponse.data || guidelineResponse.loading) {
      return;
    }

    const [cooldownPeriod, collateralAmount, rawGuidelinesCID] =
      guidelineResponse.data;

    setCurrentGuideline({
      collateralAmount,
      cooldownPeriod,
      guidelinesCID: utils.toUtf8String(rawGuidelinesCID),
    });
    setIsResConsumed(true);
  }, [isResConsumed, guidelineResponse]);

  return (
    <RosetteStoneContext.Provider
      value={{
        currentGuideline,
        isLoading: !!guidelineResponse.loading,
      }}
    >
      {children}
    </RosetteStoneContext.Provider>
  );
};

export const useRosetteStone = () => {
  return useContext(RosetteStoneContext);
};
