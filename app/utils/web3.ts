import { utils } from "ethers";
import { Fragment } from "ethers/lib/utils";

export const getFnSelector = (fragment: Fragment): string =>
  utils.id(fragment.format("sighash")).substring(0, 10);
