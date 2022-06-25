import { decodeCalldata, evaluateRaw } from "@blossom-labs/rosette";
import type { Transaction } from "@blossom-labs/rosette";
import {
  Button,
  GU,
  Header,
  Info,
  LoadingRing,
  Modal,
} from "@blossom-labs/rosette-ui";
import { useFetcher } from "@remix-run/react";
import type { providers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { ParamField } from "./ParamField";
import {
  actions,
  parseTestingParamKey,
  useTestModalData,
} from "../use-contract-descriptor-store";
import type { ParamValues } from "../use-contract-descriptor-store";
import { toDecimals } from "~/utils";

type TestModalProps = {
  show: boolean;
  onClose(): void;
};

const paramValueToBindingValue = (paramValue: ParamValues): any => {
  const { decimals, value } = paramValue;

  if (decimals) {
    return toDecimals(value, decimals);
  }

  return value;
};

const getInfoConfig = (
  isError: boolean
): { mode: Info.Modes; title: string; titleColor: string } => {
  if (isError) {
    return {
      mode: "error",
      title: "Description Error",
      titleColor: "rgb(255,183,183)",
    };
  }

  return {
    // @ts-ignore
    mode: "success",
    title: "Evaluated description",
    titleColor: "rgb(194, 255, 140)",
  };
};

export const TestModal = ({ show, onClose: handleClose }: TestModalProps) => {
  const providerFetcher = useFetcher<providers.Provider>();
  const {
    contractAddress,
    contractNetworkId,
    description,
    fnAbi,
    testingParams,
    sigHash,
  } = useTestModalData();
  const [loading, setLoading] = useState(false);
  const [evaluatedDescription, setEvaluatedDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const paramFields = useMemo(
    () =>
      Object.keys(testingParams).map((key) => {
        const [name, type] = parseTestingParamKey(key);
        const { value, decimals } = testingParams[key];

        return (
          <ParamField
            key={key}
            name={name}
            type={type}
            sigHash={sigHash}
            value={value}
            onChange={actions.upsertFnTestingParam}
            decimals={decimals}
          />
        );
      }),
    [sigHash, testingParams]
  );
  const errorExists = !!errorMsg.length;
  const { mode, title, titleColor } = getInfoConfig(errorExists);

  useEffect(() => {
    if (providerFetcher.type !== "init") {
      return;
    }

    providerFetcher.load(`/provider-search?networkId=${contractNetworkId}`);
  }, [contractNetworkId, providerFetcher]);

  const clear = () => {
    setErrorMsg("");
    setEvaluatedDescription("");
  };

  const handleTest = async () => {
    if (!providerFetcher.data) {
      return;
    }

    const data = new Interface([fnAbi]).encodeFunctionData(
      sigHash,
      Object.keys(testingParams).map((key) =>
        paramValueToBindingValue(testingParams[key])
      )
    );
    const transaction: Transaction = {
      to: contractAddress,
      data,
    };
    const bindings = decodeCalldata(fnAbi, transaction);

    try {
      setLoading(true);
      const result = await evaluateRaw(
        description,
        bindings,
        providerFetcher.data,
        {
          transaction,
        }
      );

      if (!result) {
        throw new Error("An unknown error ocurred when evaluating description");
      }

      setEvaluatedDescription(result);
    } catch (err) {
      const err_ = err as Error;
      console.error(err_);
      setErrorMsg(err_.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={show} onClose={handleClose} onClosed={clear}>
      <Header primary="Function Tester" />
      {paramFields}
      <Button
        label={
          loading ? (
            <div style={{ display: "flex", gap: 1 * GU }}>
              <LoadingRing mode="half-circle" /> Testing…
            </div>
          ) : (
            "Test"
          )
        }
        wide
        onClick={handleTest}
        mode="strong"
        disabled={loading}
      />
      {(errorMsg || evaluatedDescription) && (
        <div style={{ marginTop: 3 * GU }}>
          <Info mode={mode} title={title} titleColor={titleColor}>
            {errorMsg || evaluatedDescription}
          </Info>
        </div>
      )}
    </Modal>
  );
};
