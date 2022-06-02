import React, { useEffect, useMemo } from "react";
import { useSigner } from "wagmi";

import { LoadingRing } from "../LoadingRing";
import { useMultiModal } from "../MultiModal/MultiModalProvider";
import MultiModalScreens from "../MultiModal/MultiModalScreens";
import Stepper from "../Stepper/Stepper";

// import { useActivity } from '@providers/ActivityProvider'

type TransactionType = {
  data: any;
  from: string | undefined;
  to: string | undefined;
  description?: string;
  type?: string;
  gasLimit?: number;
};

const INDEX_NUMBER = ["First", "Second", "Third", "Fourth", "Fifth"];

type ModalFlowBaseType = {
  loading: boolean;
  screens: Array<any>;
  transactions: Array<any>;
  onComplete: () => void;
  onCompleteActions: any;
  frontLoad?: boolean;
  transactionTitle?: string;
};

type HandleSignParamsType = {
  setSuccess: () => void;
  setWorking: () => void;
  setError: () => void;
  setHash: (hash: any) => void;
};

type TransactionStepsType = {
  title: string;
  handleSign: (params: HandleSignParamsType) => Promise<void>;
};
type ArrayTransactionStepsType = Array<TransactionStepsType> | null;

function ModalFlowBase({
  loading,
  screens,
  transactions,
  onComplete,
  onCompleteActions,
  frontLoad = true,
  transactionTitle = "Create transaction",
}: ModalFlowBaseType) {
  // const { addActivity } = useActivity();
  const [{ data: signer }] = useSigner();

  const transactionSteps: ArrayTransactionStepsType = useMemo(
    () =>
      transactions
        ? transactions.map((transaction: TransactionType, index: number) => {
            const title = transaction.description
              ? transaction.description
              : transactions.length === 1
              ? "Sign transaction"
              : `${INDEX_NUMBER[index]} transaction`;

            return {
              // TODO: Add titles from description
              title,
              handleSign: async ({
                setSuccess,
                setWorking,
                setError,
                setHash,
              }: HandleSignParamsType) => {
                try {
                  const trx = {
                    from: transaction.from,
                    to: transaction.to,
                    data: transaction.data,
                    gasLimit: transaction.gasLimit,
                  };

                  // TODO: use useTransaction hook
                  const tx = await signer!.sendTransaction(trx);

                  // await addActivity(
                  //   tx,
                  //   transaction.type,
                  //   transaction.description
                  // );
                  setHash(tx.hash);

                  setWorking();

                  // We need to wait for pre-transactions to mine before asking for the next signature
                  // TODO: Provide a better user experience than waiting on all transactions
                  await tx.wait();

                  // setAccountSetting("lastTxHash", account, chainId, tx.hash);

                  setSuccess();
                } catch (err) {
                  console.error(err);
                  setError();
                }
              },
            };
          })
        : null,
    [transactions, signer] // addActivity
  );

  const extendedScreens = useMemo(() => {
    const allScreens = [];

    // Add loading screen as first item if enabled
    if (frontLoad) {
      allScreens.push({
        content: <LoadingScreen loading={loading} />,
      });
    }

    // Spread in our flow screens
    if (screens) {
      allScreens.push(...screens);
    }

    // Apply transaction singing at the end
    if (transactionSteps) {
      allScreens.push({
        title: transactionTitle,
        width: modalWidthFromCount(transactions.length),
        content: (
          <Stepper
            steps={transactionSteps}
            onComplete={onComplete}
            onCompleteActions={onCompleteActions}
          />
        ),
      });
    }

    return allScreens;
  }, [
    frontLoad,
    loading,
    screens,
    transactions,
    transactionSteps,
    transactionTitle,
    onComplete,
    onCompleteActions,
  ]);

  return <MultiModalScreens screens={extendedScreens} />;
}

function LoadingScreen({ loading }: { loading: boolean }) {
  const { next } = useMultiModal();

  useEffect(() => {
    let timeout: number;

    if (!loading) {
      // Provide a minimum appearance duration to avoid visual confusion on very fast requests
      timeout = window.setTimeout(() => {
        next();
      }, 100);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [loading, next]);

  return <LoadingRing />;
}

function modalWidthFromCount(count: number) {
  if (count >= 3) {
    return 865;
  }

  if (count === 2) {
    return 700;
  }

  // Modal will fallback to the default
  return null;
}

export default ModalFlowBase;
