import { useCallback } from "react";
import { useContract } from "wagmi";
import rosetteStoneAbi from "~/abi/RosetteStone.json";

export default function useRosetteActions(rosetteContractAddress: string) {
  const rosetteContract = useContract({
    addressOrName: rosetteContractAddress,
    contractInterface: rosetteStoneAbi,
  });

  const upsertEntries = useCallback(
    (scopes: string[], sigs: string[], cids: string[]) => {
      console.log("scopes", scopes, "sigs", sigs, "cids", cids);
      return null;
    },
    []
  );

  return { upsertEntries };
}
