import React, { useCallback, useEffect, useMemo, useState } from "react";
import ModalFlowBase from "./ModalFlowBase";
import { useMultiModal } from "../MultiModal/MultiModalProvider";

function SubmitEntriesScreens() {
  const [transactions, setTransactions] = useState([]);

  const getTransactions = useCallback(
    async (onComplete) => {
      await priceOracleActions.updatePriceOracle((intent) => {
        setTransactions(intent);
        onComplete();
      });
    },
    [priceOracleActions]
  );

  const screens = useMemo(
    () => [
      {
        title: "Update Price Oracle",
        graphicHeader: true,
        content: <PriceOracle getTransactions={getTransactions} />,
      },
    ],
    [getTransactions]
  );

  return (
    <ModalFlowBase
      frontLoad={false}
      transactions={transactions}
      transactionTitle="Update Price Oracle"
      screens={screens}
    />
  );
}

const PriceOracle = React.memo(function ExecuteProposal({ getTransactions }) {
  const { next } = useMultiModal();

  useEffect(() => {
    getTransactions(() => {
      next();
    });
  }, [getTransactions, next]);

  return <div />;
});

export default SubmitEntriesScreens;

// const handleSubmit = useCallback(
//   (event) => {
//     event.preventDefault();

//     const fnDescriptionsJSON = buildUploadDataJSON(
//       fnDescriptorEntries,
//       userFnDescriptions
//     );

//     actionFetcher.submit(
//       {
//         fnDescriptions: JSON.stringify(fnDescriptionsJSON),
//       },
//       {
//         method: "post",
//         action: "/fn-descriptions-upload",
//       }
//     );
//   },
//   [actionFetcher, fnDescriptorEntries, userFnDescriptions]
// );
