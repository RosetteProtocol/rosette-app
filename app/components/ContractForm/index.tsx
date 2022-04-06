import {
  Box,
  Button,
  Field,
  GU,
  Info,
  LoadingRing,
  TextInput,
} from "@1hive/1hive-ui";
import { utils } from "ethers";
import { ChangeEvent, FormEventHandler, useState } from "react";
import { useTransition } from "remix";
import styled from "styled-components";

type ContractFormProps = {
  onSubmit(contractAddress: string): void;
};

export const ContractForm = ({ onSubmit }: ContractFormProps) => {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const transition = useTransition();

  const disableSubmit =
    !contractAddress.length || transition.state === "loading";

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (!contractAddress || !utils.isAddress(contractAddress)) {
      setErrorMsg("Invalid contract address.");
      return;
    }

    onSubmit(contractAddress);
  };

  return (
    <StyledBox>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 3 * GU,
            }}
          >
            <Field label="Contract to describe" required>
              <TextInput
                value={contractAddress}
                placeholder="Type in contract address…"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setContractAddress(e.target.value);
                }}
                wide
              />
            </Field>
            {errorMsg && <Info mode="error">{errorMsg}</Info>}
          </div>
          <Button type="submit" mode="strong" disabled={disableSubmit} wide>
            {transition.state === "loading" ? (
              <>
                <LoadingRing
                  style={{ marginRight: 1 * GU }}
                  mode="half-circle"
                />
                Loading…
              </>
            ) : (
              <>Describe</>
            )}
          </Button>
        </form>
      </div>
    </StyledBox>
  );
};

const StyledBox = styled(Box)`
  width: 25%;
`;
