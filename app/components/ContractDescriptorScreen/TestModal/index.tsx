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
import type { utils } from "ethers";
import { defaultAbiCoder, Fragment, Interface } from "ethers/lib/utils";
import type { ChangeEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { actions, useTestModalData } from "../use-contract-descriptor-store";
import type { TestingParam } from "../use-contract-descriptor-store";
import { getFnSelector, toDecimals } from "~/utils";
import { buildHref } from "~/utils/client/utils.client";
import { SOLIDITY_TYPE_REGEX } from "~/utils/client/param-value.client";
import type { FieldParamValue } from "~/utils/client/param-value.client";
import { Details } from "~/components/Details";
import { ParamField } from "./ParamField";
import type { ParamFieldProps } from "./ParamField";
import { ValueOrArray } from "~/types";

const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

const computeTestingParamValue_ = ({ decimals, value }: FieldParamValue): any =>
  // Cap the decimals value to avoid encoding huge values later on
  decimals ? toDecimals(value, Math.min(9999, decimals)) : value;

const computeTestingParamValue = (paramValue: TestingParam): any => {
  if (!Array.isArray(paramValue)) {
    return computeTestingParamValue_(paramValue);
  }

  return paramValue.map((p) => computeTestingParamValue(p));
};

const processEncodeError = (err: unknown) => {
  const err_ = err as Error;

  return err_.message.split("(")[0].trim();
};

const validateTestingParams_ = (
  params: TestingParam,
  nestingPos: string,
  type: string,
  errorRegistry: Record<string, string>
): void => {
  if (Array.isArray(params)) {
    params.map((p, i) =>
      validateTestingParams_(p, `${nestingPos}.${i}`, type, errorRegistry)
    );
    return;
  }

  try {
    defaultAbiCoder.encode([type], [computeTestingParamValue(params)]);
  } catch (err) {
    errorRegistry[nestingPos] = processEncodeError(err);
  }
};

const validateTestingParams = (
  fnInterface: Interface,
  params: TestingParam[]
): Record<string, string> => {
  const errorRegistry: Record<string, string> = {};
  const fnFragment = Object.values(fnInterface.functions)[0];

  fnFragment.inputs.map((paramType, index) => {
    const res = SOLIDITY_TYPE_REGEX.exec(paramType.type);
    const { type, range = "" } = res?.groups || {};
    const paramError = validateTestingParams_(
      params[index],
      index.toString(),
      `${type}${range}`,
      errorRegistry
    );
    return paramError;
  });

  return errorRegistry;
};

const convertBindings_ = (valueOrValues: ValueOrArray<any>): TestingParam => {
  if (!Array.isArray(valueOrValues)) {
    return { value: valueOrValues.toString(), decimals: 0 };
  }

  return valueOrValues.map((v: ValueOrArray<any>) => convertBindings_(v));
};

const convertBindings = (bindings: Bindings, fnAbi: string): TestingParam[] => {
  return Fragment.from(fnAbi).inputs.map((input, index) => {
    const valueOrValues = bindings[input.name].value;

    return convertBindings_(valueOrValues);
  });
};

const processFetchedTransaction = (
  tx: Transaction,
  sigHash: string,
  fnAbi: string
): { result?: TestingParam[]; error?: string } => {
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
  const disableTestButton =
    isEvaluatorLoading || !!Object.keys(paramErrorMsgs).length;
  const fnFragment = useMemo(() => Fragment.from(fnAbi), [fnAbi]);

  const handleParamFieldChange: ParamFieldProps["onChange"] = useCallback(
    (nestingPos, value, decimals) => {
      // When updating field remove any existing error if any
      setParamErrorMsgs((prevErrorRegistry) => {
        const newErrorRegistry = { ...prevErrorRegistry };
        delete newErrorRegistry[nestingPos];
        return newErrorRegistry;
      });
      const paramValues: FieldParamValue = { value, decimals };

      actions.updateFnTestingParam(
        getFnSelector(fnFragment),
        paramValues,
        nestingPos
      );
    },
    [fnFragment]
  );

  const handleParamFieldAdd: ParamFieldProps["onAdd"] = useCallback(
    (nestingPosition: string, paramType: utils.ParamType) => {
      actions.insertFnTestingArrayParam(sigHash, nestingPosition, paramType);
    },
    [sigHash]
  );

  const handleParamFieldRemove: ParamFieldProps["onRemove"] = useCallback(
    (id: string) => {
      setParamErrorMsgs({});
      actions.removeFnTestingArrayParam(sigHash, id);
    },
    [sigHash]
  );

  const paramFields = useMemo(
    () =>
      fnFragment.inputs.map((input, index) => {
        const { type, name } = input;

        return (
          <ParamField
            key={`${type}-${name}`}
            nestingPos={index.toString()}
            paramType={input}
            valueOrValues={testingParams[index]}
            onAdd={handleParamFieldAdd}
            onChange={handleParamFieldChange}
            onRemove={handleParamFieldRemove}
            errors={paramErrorMsgs}
          />
        );
      }),
    [
      testingParams,
      fnFragment,
      paramErrorMsgs,
      handleParamFieldAdd,
      handleParamFieldChange,
      handleParamFieldRemove,
    ]
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

    const { result: newFnTestingParams, error } = processFetchedTransaction(
      txFetcher.data.tx,
      sigHash,
      fnAbi
    );

    if (error || !newFnTestingParams) {
      setTxHashErrorMsg(
        error ?? "An unknown error occurred when fetching the transaction"
      );
      return;
    }

    setIsEveryParamFilled(true);

    actions.updateFnTestingParams(sigHash, newFnTestingParams);
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

    if (Object.keys(errors).length) {
      setParamErrorMsgs(errors);
      return;
    }

    const data = fnInterface.encodeFunctionData(
      sigHash,
      Object.values(testingParams).map((value) =>
        computeTestingParamValue(value)
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
      <div style={{ marginTop: -2 * GU, marginBottom: 1 * GU }}>
        <Details label="Load transaction">
          <Section description="Fill the parameter fields from a given transaction.">
            <form>
              <Field
                label="Transaction hash"
                error={!!txHashErrorMsg.length}
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
                    onChange={({
                      target: { value },
                    }: ChangeEvent<HTMLInputElement>) => {
                      setTxHash(value);
                      handleFetch(value);
                    }}
                    size="small"
                    wide
                    disabled={txFetcher.state === "loading"}
                    error={!!txHashErrorMsg.length}
                  />
                </div>
              </Field>
            </form>
          </Section>
        </Details>
      </div>
      <Section header="Parameters">
        <form>
          {paramFields}
          <Button
            label={
              isEvaluatorLoading ? (
                <div style={{ display: "flex", gap: 1 * GU }}>
                  <LoadingRing /> Testing…
                </div>
              ) : (
                "Test"
              )
            }
            wide
            onClick={handleTest}
            mode="strong"
            disabled={disableTestButton}
          />
        </form>
      </Section>
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
