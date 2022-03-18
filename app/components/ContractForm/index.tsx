// import { Box, Button, DropDown, Field, Info, TextInput } from "@1hive/1hive-ui";
// import { utils } from "ether";
// import {
//   ChangeEvent,
//   FormEventHandler,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { NETWORK_IDS, NETWORKS, isTestnet } from "../../../utils";
// import { NetworkItem } from "./NetworkItem";
// const DEFAULT_NETWORK_ID_INDEX = -1;

export const ContractForm = () => <div style={{}}>ContractForm</div>;

// type ContractFormProps = {
//   onSubmit(contractAddress: string, networkId: number): void;
// };

// const ContractForm = ({ onSubmit }: ContractFormProps) => {
//   const [contractAddress, setContractAddress] = useState("");
//   const [networkIdIndex, setNetworkIdIndex] = useState(
//     DEFAULT_NETWORK_ID_INDEX
//   );
//   const [errorMsg, setErrorMsg] = useState("");
//   const networkItems = useMemo(
//     () =>
//       NETWORK_IDS.map((id) => (
//         <NetworkItem
//           key={id}
//           label={NETWORKS[id].name}
//           icon={NETWORKS[id].logo}
//           isTestnet={isTestnet(id)}
//         />
//       )),
//     []
//   );
//   const disableSubmit =
//     networkIdIndex === DEFAULT_NETWORK_ID_INDEX || !contractAddress.length;

//   useEffect(() => {
//     setErrorMsg("");
//   }, [contractAddress, networkIdIndex]);

//   const handleSubmit: FormEventHandler = (e) => {
//     e.preventDefault();

//     if (
//       !contractAddress ||
//       !utils.isAddress(contractAddress) ||
//       networkIdIndex === DEFAULT_NETWORK_ID_INDEX
//     ) {
//       setErrorMsg("Invalid contract address.");
//       return;
//     }

//     onSubmit(contractAddress, NETWORK_IDS[networkIdIndex]);
//   };

//   return (
//     <Box
//       css={css`
//         width: 25%;
//       `}
//     >
//       <div
//         css={css`
//           display: flex;
//           flex-direction: column;
//         `}
//       >
//         <form onSubmit={handleSubmit}>
//           <div
//             css={css`
//               display: flex;
//               flex-direction: column;
//               margin-bottom: 3gu;
//             `}
//           >
//             <Field label="Contract to describe" required>
//               <TextInput
//                 value={contractAddress}
//                 placeholder="Type in contract address…"
//                 onChange={(e: ChangeEvent<HTMLInputElement>) => {
//                   setContractAddress(e.target.value);
//                 }}
//                 wide
//               />
//             </Field>
//             <Field label="Network" required>
//               <DropDown
//                 placeholder="Select a network"
//                 header="Network"
//                 items={networkItems}
//                 selected={networkIdIndex}
//                 onChange={setNetworkIdIndex}
//                 wide
//               />
//             </Field>
//             {errorMsg && <Info mode="error">{errorMsg}</Info>}
//           </div>
//           <Button
//             type="submit"
//             label="Describe"
//             mode="strong"
//             disabled={disableSubmit}
//             wide
//           />
//         </form>
//       </div>
//     </Box>
//   );
// };

// export default ContractForm;
