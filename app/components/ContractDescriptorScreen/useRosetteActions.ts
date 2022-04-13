import { useCallback } from "react";
import { utils } from "ethers";
import { useContract, useSigner } from "wagmi";
import rosetteStoneAbi from "~/abi/RosetteStone.json";

const COLLATERAL_AMOUNT = "10000000000000000" // Should we take this amount from the subgraph?

export default function useRosetteActions(rosetteContractAddress: string) {
  const [{ data }] = useSigner();
  const rosetteContract = useContract({
    addressOrName: rosetteContractAddress,
    contractInterface: rosetteStoneAbi,
    signerOrProvider: data,
  });

  const upsertEntries = useCallback(
   async (scopes: string[], sigs: string[], cids: string[]) => {
      const tx = await rosetteContract.upsertEntries(
        scopes,
        sigs,
        cids.map((cid) => utils.hexlify(utils.toUtf8Bytes(cid))),
        { value: COLLATERAL_AMOUNT } // TODO: Update on colateral token change
      ); 
      await tx.wait()
    },
    [rosetteContract]
  );

  return { upsertEntries };
}
