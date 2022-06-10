import { useCallback } from "react";
import { utils } from "ethers";
import { useContract, useSigner } from "wagmi";
import rosetteStoneAbi from "~/abi/RosetteStone.json";
import { useRosetteStone } from "~/providers/RosetteStone";

const GAS_LIMIT = 6000000;

export default function useRosetteActions() {
  const { currentGuideline } = useRosetteStone();
  const [{ data }] = useSigner();
  const rosetteContract = useContract({
    addressOrName: window.ENV.ROSETTE_STONE_ADDRESS,
    contractInterface: rosetteStoneAbi,
    signerOrProvider: data,
  });

  const upsertEntries = useCallback(
    async (scopes: string[], sigs: string[], cids: string[]) => {
      if (!currentGuideline?.collateralAmount) {
        throw new Error("Unknown collateral amount needed to upsert an entry");
      }

      const tx = await rosetteContract.upsertEntries(
        scopes,
        sigs,
        cids.map((cid) => utils.hexlify(utils.toUtf8Bytes(cid))),
        { gasLimit: GAS_LIMIT, value: currentGuideline.collateralAmount }
      );
      await tx.wait();
    },
    [rosetteContract, currentGuideline?.collateralAmount]
  );

  return { upsertEntries };
}
