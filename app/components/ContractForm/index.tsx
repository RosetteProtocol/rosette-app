import {
  Button,
  Field,
  GU,
  Info,
  LoadingRing,
  TextInput,
} from "@1hive/1hive-ui";
import { utils } from "ethers";
import type { ChangeEvent, FormEventHandler } from "react";
import { useState } from "react";
import { useTransition } from "remix";
import styled from "styled-components";

type ContractFormProps = {
  onSubmit(contractAddress: string): void;
};

export const ContractForm = ({ onSubmit }: ContractFormProps) => {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const transition = useTransition();

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (!contractAddress) {
      setErrorMsg("Type in a contract address.");
      return;
    }
    if (!utils.isAddress(contractAddress)) {
      setErrorMsg("Invalid contract address.");
      return;
    }

    onSubmit(contractAddress);
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: 3 * GU,
          }}
        >
          <Field label="Contract address">
            <MainTextInput
              value={contractAddress}
              placeholder="0x…"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setErrorMsg("");
                setContractAddress(e.target.value);
              }}
              wide
            />
          </Field>
          {errorMsg && <Info mode="error">{errorMsg}</Info>}
        </div>
        <NextButton
          type="submit"
          mode="strong"
          disabled={transition.state === "loading"}
          wide
        >
          {transition.state === "loading" ? (
            <>
              <LoadingRing style={{ marginRight: 1 * GU }} mode="half-circle" />
              Loading…
            </>
          ) : (
            <>Next</>
          )}
        </NextButton>
      </form>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 440px;
  margin: 0 ${3 * GU}px;
  display: flex;
  flex-direction: column;
`;

const MainTextInput = styled(TextInput)`
  height: ${8 * GU}px;
`;

const NextButton = styled(Button)`
  height: ${8 * GU}px;
`;
