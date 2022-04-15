import { useCallback } from "react";
import { utils } from "ethers";
import { useContract, useSigner } from "wagmi";
import rosetteStoneAbi from "~/abi/RosetteStone.json";

const GAS_LIMIT = 6000000;

export default function useRosetteActions() {
  const [{ data }] = useSigner();
  const rosetteContract = useContract({
    addressOrName: window.ENV.ROSETTE_STONE_ADDRESS,
    contractInterface: rosetteStoneAbi,
    signerOrProvider: data,
  });

  const upsertEntries = useCallback(
    async (scopes: string[], sigs: string[], cids: string[]) => {
      const tx = await rosetteContract.upsertEntries(
        scopes,
        sigs,
        cids.map((cid) => utils.hexlify(utils.toUtf8Bytes(cid))),
        { gasLimit: GAS_LIMIT }
      );
      await tx.wait();
    },
    [rosetteContract]
  );

  return { upsertEntries };
}
