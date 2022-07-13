import { Field, GU, LoadingRing, TextInput } from "@blossom-labs/rosette-ui";
import { utils } from "ethers";
import type { ChangeEventHandler } from "react";
import { useState } from "react";
import styled from "styled-components";

type ContractFormProps = {
  loading: boolean;
  onSubmit(contractAddress: string): void;
};

export const ContractForm = ({ loading, onSubmit }: ContractFormProps) => {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const errorExists = !!errorMsg.length;

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    setContractAddress(value);
    setErrorMsg("");

    if (!value.length) {
      return;
    }

    if (!utils.isAddress(value)) {
      setErrorMsg("Invalid contract address");
      return;
    }

    onSubmit(value);
  };

  return (
    <Container>
      <form>
        <Field
          label="Contract address"
          error={errorExists}
          helperText={errorMsg}
        >
          <TextInput
            adornment={loading ? <LoadingRing /> : null}
            adornmentPosition="end"
            adornmentSettings={{
              width: 70,
              padding: 15,
            }}
            value={contractAddress}
            placeholder="0x…"
            onChange={handleChange}
            error={errorExists}
            disabled={loading}
            size="medium"
            wide
          />
        </Field>
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
