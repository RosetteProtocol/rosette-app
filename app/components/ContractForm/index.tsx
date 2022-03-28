import {
  Box,
  Button,
  DropDown,
  Field,
  GU,
  Info,
  TextInput,
} from "@1hive/1hive-ui";
import { utils } from "ethers";
import { ChangeEvent, FormEventHandler, useEffect, useState } from "react";
import styled from "styled-components";
import { Chain } from "wagmi";
import { getNetworkLogo } from "~/utils";
import { NetworkItem } from "./NetworkItem";

const DEFAULT_NETWORK_ID_INDEX = -1;

type ContractFormProps = {
  availableNetworks: Chain[];
  onSubmit(contractAddress: string, networkId: number): void;
};

export const ContractForm = ({
  availableNetworks = [],
  onSubmit,
}: ContractFormProps) => {
  const [contractAddress, setContractAddress] = useState("");
  const [networkIdIndex, setNetworkIdIndex] = useState(
    DEFAULT_NETWORK_ID_INDEX
  );
  const [errorMsg, setErrorMsg] = useState("");
  const disableSubmit =
    networkIdIndex === DEFAULT_NETWORK_ID_INDEX || !contractAddress.length;

  useEffect(() => {
    setErrorMsg("");
  }, [contractAddress, networkIdIndex]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (
      !contractAddress ||
      !utils.isAddress(contractAddress) ||
      networkIdIndex === DEFAULT_NETWORK_ID_INDEX
    ) {
      setErrorMsg("Invalid contract address.");
      return;
    }

    onSubmit(contractAddress, networkIdIndex);
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
            <Field label="Network" required>
              <DropDown
                placeholder="Select a network"
                header="Network"
                items={availableNetworks.map(({ id, name, testnet }) => (
                  <NetworkItem
                    key={id}
                    label={name}
                    icon={getNetworkLogo(id)}
                    isTestnet={testnet}
                  />
                ))}
                selected={networkIdIndex}
                onChange={setNetworkIdIndex}
                wide
              />
            </Field>
            {errorMsg && <Info mode="error">{errorMsg}</Info>}
          </div>
          <Button
            type="submit"
            label="Describe"
            mode="strong"
            disabled={disableSubmit}
            wide
          />
        </form>
      </div>
    </StyledBox>
  );
};

const StyledBox = styled(Box)`
  width: 25%;
`;
