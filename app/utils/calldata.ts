import { constants, utils } from "ethers";

// const DEFAULT_VALUE_TYPES = [
//   ["address", constants.AddressZero],
//   ["bytes", constants.HashZero],
//   ["number", 0],
//   ["string", "Lorem iptsu"],
//   ["bool", "true"],
// ];

// function generateCalldata(abiFullName: string): string {
//   const fragment = new utils.Interface(abiFullName).fragments[0];
//   const types = fragment.inputs;

//   return types.reduce((prev, curr, index) => {
//     if (curr._isParamType) {
//       prev.concat(DEFAULT_VALUE_TYPES[curr.baseType]);
//     }

//     for (const i = 0; i < curr.arrayLength; i++) {

//     }
//   }, "");
// }
