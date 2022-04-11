import { useCallback } from "react";
import { utils } from "ethers";
import { useContract, useSigner } from "wagmi";
import rosetteStoneAbi from "~/abi/RosetteStone.json";

export default function useRosetteActions(rosetteContractAddress: string) {
  const [{ data }] = useSigner();
  const rosetteContract = useContract({
    addressOrName: rosetteContractAddress,
    contractInterface: rosetteStoneAbi,
    signerOrProvider: data,
  });

  const upsertEntries = useCallback(
    (scopes: string[], sigs: string[], cids: string[]) => {
      console.log("scopes", scopes, "sigs", sigs, "cids", cids);
      rosetteContract.upsertEntries(
        scopes,
        sigs,
        cids.map((cid) => utils.hexlify(utils.toUtf8Bytes(cid))),
        { value: "10000000000000000" }
      );
    },
    [rosetteContract]
  );

  return { upsertEntries };
}
