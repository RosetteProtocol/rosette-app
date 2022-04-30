import {
  Button,
  Field,
  GU,
  Info,
  LoadingRing,
  TextInput,
} from "@blossom-labs/rosette-ui";
import { utils } from "ethers";
import type { ChangeEvent, FormEventHandler } from "react";
import { useState } from "react";
import styled from "styled-components";

type ContractFormProps = {
  loading: boolean;
  onSubmit(contractAddress: string): void;
};

export const ContractForm = ({ loading, onSubmit }: ContractFormProps) => {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
            <TextInput
              value={contractAddress}
              placeholder="0x…"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setErrorMsg("");
                setContractAddress(e.target.value);
              }}
              size="medium"
              wide
            />
          </Field>
          {errorMsg && <Info mode="error">{errorMsg}</Info>}
        </div>
        <NextButton type="submit" mode="strong" disabled={loading} wide>
          {loading ? (
            <>
              <LoadingRing style={{ marginRight: 1 * GU }} mode="half-circle" />
              <Load>Loading…</Load>
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

const NextButton = styled(Button)`
  height: ${8 * GU}px;
`;

const Load = styled.div`
  color: ${({ theme }) => theme.contentSecondary};
`;
