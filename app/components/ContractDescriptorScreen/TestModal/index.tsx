import { Button, Header, Modal } from "@blossom-labs/rosette-ui";
import { useMemo } from "react";
import { ParamField } from "./ParamField";
import {
  actions,
  parseTestingParamKey,
  useTestModalData,
} from "../use-contract-descriptor-store";

type TestModalProps = {
  show: boolean;
  onClose(): void;
};

export const TestModal = ({ show, onClose: handleClose }: TestModalProps) => {
  const { testingParams, sigHash } = useTestModalData();
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

  return (
    <Modal visible={show} onClose={handleClose}>
      <Header primary="Function Tester" />
      {paramFields}
      <Button
        label="Test"
        wide
        onClick={() => console.log("test")}
        mode="strong"
      />
    </Modal>
  );
};
