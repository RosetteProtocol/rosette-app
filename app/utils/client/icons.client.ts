import { IconCheck, IconClock, IconWarning } from "@blossom-labs/rosette-ui";
import type { FunctionComponent } from "react";
import ethereum from "~/assets/ethereum.svg";
import gnosisChain from "~/assets/gnosis-chain.svg";
import polygon from "~/assets/polygon.jpg";
import { FnDescriptionStatus } from "~/types";

export const getNetworkLogo = (networkId: number): string | undefined => {
  switch (networkId) {
    case 1:
    case 3:
    case 4:
    case 5:
    case 42:
      return ethereum;
    case 100:
      return gnosisChain;
    case 137:
    case 80001:
      return polygon;
  }
};

export const getFnEntryStatusIconData = (
  status: FnDescriptionStatus
):
  | {
      Icon: FunctionComponent<{ size?: string; [x: string]: any }>;
      color: string;
    }
  | undefined => {
  switch (status) {
    case FnDescriptionStatus.Added:
      return {
        Icon: IconCheck,
        color: "#8DCE3A",
      };
    case FnDescriptionStatus.Pending:
      return {
        Icon: IconClock,
        color: "#F5A623",
      }
    case FnDescriptionStatus.Challenged:
      return {
        Icon: IconWarning,
        color: "#F7513E"
      }
    case FnDescriptionStatus.Available:
      return undefined;
  }
};
