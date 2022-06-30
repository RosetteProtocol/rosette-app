import type { Bindings, Transaction } from "@blossom-labs/rosette";
import { decodeCalldata } from "@blossom-labs/rosette";
import {
  Button,
  Field,
  GU,
  Header,
  IconCheck,
  Info,
  LoadingRing,
  Modal,
  TextInput,
  textStyle,
  useTheme,
} from "@blossom-labs/rosette-ui";
import { useFetcher } from "@remix-run/react";
import { Fragment, Interface } from "ethers/lib/utils";
import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ParamField } from "./ParamField";
import {
  actions,
  buildTestingParamKey,
  parseTestingParamKey,
  useTestModalData,
} from "../use-contract-descriptor-store";
import type { FnTestingParams } from "../use-contract-descriptor-store";
import type { ParamValues } from "../use-contract-descriptor-store";
import { toDecimals } from "~/utils";
import { Details } from "~/components/Details";
import { buildHref } from "~/utils/client/utils.client";

const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

const computeTestingParamValue = (paramValue: ParamValues): any => {
  const { decimals, value } = paramValue;

  if (decimals) {
    return toDecimals(value, decimals);
  }

  return value;
};

const validateTestingParams = (
  fnInterface: Interface,
  params: FnTestingParams
): Record<string, string> | null => {
  const fnFragment = Object.values(fnInterface.functions)[0];
  let errors: Record<string, string> = {};

  fnFragment.inputs.forEach((paramType) => {
    const paramKey = buildTestingParamKey(paramType.name, paramType.type);
    const paramValue = computeTestingParamValue(params[paramKey]);
    try {
      fnInterface._encodeParams([paramType], [paramValue]);
    } catch (err) {
      const err_ = err as Error;
      errors[paramKey] = err_.message.split("(")[0].trim();
    }
  });

  return Object.keys(errors).length ? errors : null;
};

const convertBindings = (
  bindings: Bindings,
  fnAbi: string
): FnTestingParams => {
  return Fragment.from(fnAbi).inputs.reduce(
    (testingParams: FnTestingParams, { name, type }) => {
      testingParams[buildTestingParamKey(name, type)] = {
        value: bindings[name].value.toString(),
      };

      return testingParams;
    },
    {}
  );
};

const processTransaction = (
  tx: Transaction,
  sigHash: string,
  fnAbi: string
): { result?: FnTestingParams; error?: string } => {
  if (!tx) {
    return {
      error: "No transaction was found for the given hash",
    };
  }

  const errorPrefix = "Invalid fetched tx:";
  const txSigHash = tx.data.slice(0, 10);

  if (txSigHash !== sigHash) {
    return {
      error: `${errorPrefix} function signature mismatch`,
    };
  }

  try {
    const bindings = decodeCalldata(fnAbi, tx);

    return {
      result: convertBindings(bindings, fnAbi),
    };
  } catch (err) {
    return {
      error: `${errorPrefix} couldn't decode calldata`,
    };
  }
};

const getEvaluationConfig = (
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
    // Mode isn't defined on rosette-ui .d.ts file
    // @ts-ignore
    mode: "success",
    title: "Evaluated description",
    titleColor: "rgb(194, 255, 140)",
  };
};

type SectionProps = {
  header?: string;
  description?: string;
  children: ReactNode;
};

const Section = ({ header, description, children }: SectionProps) => {
  const theme = useTheme();

  return (
    <div>
      {header && <Subheader>{header}</Subheader>}
      {description && (
        <div style={{ color: theme.surfaceContent, marginBottom: 1 * GU }}>
          {description}
        </div>
      )}
      {children}
    </div>
  );
};

const Subheader = styled.div`
  margin-bottom: ${1 * GU}px;
  font-weight: bold;
  color: ${({ theme }) => theme.surfaceContentSecondary};
  ${textStyle("title4")};
`;

type TestModalProps = {
  show: boolean;
  onClose(): void;
};

export const TestModal = ({ show, onClose: handleClose }: TestModalProps) => {
  const txFetcher = useFetcher<{ tx: { to: string; data: string } }>();
  const evaluatorFetcher = useFetcher<{ result: string; error: string }>();
  const {
    contractAddress,
    contractNetworkId,
    description,
    fnAbi,
    testingParams,
    sigHash,
  } = useTestModalData();
  const [evaluatedDescription, setEvaluatedDescription] = useState("");
  const [evaluatorErrorMsg, setEvaluatorErrorMsg] = useState("");
  const [paramErrorMsgs, setParamErrorMsgs] = useState<Record<string, string>>(
    {}
  );
  /**
   * Need to pass value to input otherwise the tx hash isn't displayed when
   * adornment shows up
   */
  const [txHash, setTxHash] = useState("");
  const [txHashErrorMsg, setTxHashErrorMsg] = useState("");
  const [isEveryParamFilled, setIsEveryParamFilled] = useState(false);
  const isEvaluatorLoading = evaluatorFetcher.state === "loading";
  const { mode, title, titleColor } = getEvaluationConfig(
    !!evaluatorErrorMsg.length
  );

  const handleParamFieldChange = useCallback(
    (sigHash, paramName, paramValue) => {
      // When updating field remove any existing error if any
      setParamErrorMsgs((prevErrors) => ({
        ...prevErrors,
        [paramName]: undefined,
      }));
      actions.upsertFnTestingParam(sigHash, paramName, paramValue);
    },
    []
  );

  const paramFields = useMemo(
    () =>
      Object.keys(testingParams).map((key) => {
        const [name, type] = parseTestingParamKey(key);
        const { value, decimals } = testingParams[key];

        return (
          <ParamField
            key={key}
            sigHash={sigHash}
            name={name}
            type={type}
            value={value}
            onChange={handleParamFieldChange}
            decimals={decimals}
            errorMsg={paramErrorMsgs[key]}
          />
        );
      }),
    [handleParamFieldChange, sigHash, testingParams, paramErrorMsgs]
  );

  useEffect(() => {
    if (evaluatorFetcher.type !== "done") {
      return;
    }

    const { result, error } = evaluatorFetcher.data;

    if (error) {
      setEvaluatorErrorMsg(error);
      return;
    }

    setEvaluatedDescription(result);
  }, [evaluatorFetcher]);

  useEffect(() => {
    if (txFetcher.type !== "done") {
      return;
    }

    const { result, error } = processTransaction(
      txFetcher.data.tx,
      sigHash,
      fnAbi
    );

    if (error || !result) {
      setTxHashErrorMsg(
        error ?? "An unknown error occurred when fetching the transaction"
      );
      return;
    }

    setIsEveryParamFilled(true);

    actions.upsertFnTestingParams(sigHash, result);
  }, [fnAbi, sigHash, txFetcher.type, txFetcher.data]);

  const clear = () => {
    setTxHash("");
    setTxHashErrorMsg("");
    setParamErrorMsgs({});
    setEvaluatorErrorMsg("");
    setEvaluatedDescription("");
    setIsEveryParamFilled(false);
    /**
     * Set fetcher to initial state to avoid re-using fetched data from a previous
     * function on a new one.
     */
    txFetcher.type = "init";
  };

  const handleFetch = (txHash: string) => {
    if (!txHash || !TX_HASH_REGEX.test(txHash)) {
      setTxHashErrorMsg(txHash ? "Invalid hash" : "");
      return;
    }

    txFetcher.load(
      buildHref("/transaction-search", [
        ["networkId", contractNetworkId],
        ["transactionHash", txHash],
      ])
    );
  };

  const handleTest = () => {
    const fnInterface = new Interface([fnAbi]);
    const errors = validateTestingParams(fnInterface, testingParams);

    if (errors) {
      setParamErrorMsgs(errors);
      return;
    }

    const data = fnInterface.encodeFunctionData(
      sigHash,
      Object.keys(testingParams).map((key) =>
        computeTestingParamValue(testingParams[key])
      )
    );

    evaluatorFetcher.load(
      buildHref("/description-evaluation", [
        ["abi", fnAbi],
        ["to", contractAddress],
        ["data", data],
        ["networkId", contractNetworkId],
        ["description", description],
      ])
    );
  };

  return (
    <Modal visible={show} onClose={handleClose} onClosed={clear}>
      <Header primary="Function Tester" />
      <Section header="Parameters">{paramFields}</Section>
      <div style={{ margin: `${2 * GU}px 0` }}>
        <Details label="Load transaction">
          <Section description="Fill the parameter fields from a given transaction.">
            <Field
              label="Transaction hash"
              error={txHashErrorMsg.length}
              helperText={txHashErrorMsg}
            >
              <div style={{ display: "flex", gap: GU }}>
                <TextInput
                  value={txHash}
                  adornment={
                    txFetcher.state === "loading" ? (
                      <LoadingRing />
                    ) : isEveryParamFilled ? (
                      <IconCheck />
                    ) : null
                  }
                  adornmentPosition="end"
                  adornmentSettings={{
                    width: 70,
                    padding: 15,
                  }}
                  placeholder="0x…"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setTxHash(e.target.value);
                    handleFetch(e.target.value);
                  }}
                  size="small"
                  wide
                  disabled={txFetcher.state === "loading"}
                  error={txHashErrorMsg.length}
                />
              </div>
            </Field>
          </Section>
        </Details>
      </div>
      <Button
        label={
          isEvaluatorLoading ? (
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
        disabled={isEvaluatorLoading}
      />
      {(evaluatorErrorMsg || evaluatedDescription) && (
        <div style={{ marginTop: 3 * GU }}>
          <Info mode={mode} title={title} titleColor={titleColor}>
            {evaluatorErrorMsg || evaluatedDescription}
          </Info>
        </div>
      )}
    </Modal>
  );
};
