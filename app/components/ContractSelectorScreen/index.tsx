import { Button, GU, textStyle } from "@blossom-labs/rosette-ui";
import styled from "styled-components";
import { a, useTransition } from "@react-spring/web";
import type { ContractData, AggregatedContract } from "~/types";
import { ContractItem } from "./ContractItem";
import { useNavigate } from "@remix-run/react";

type ContractSelectorScreenProps = {
  contracts: AggregatedContract[];
  loaderText?: string;
  onContractDataSelected(contractData: ContractData): void;
};

export const ContractSelectorScreen = ({
  contracts,
  loaderText,
  onContractDataSelected,
}: ContractSelectorScreenProps) => {
  const navigate = useNavigate();
  const transition = useTransition(contracts, {
    trail: 700 / contracts.length,
    from: { opacity: 0, scale: 0 },
    enter: { opacity: 1, scale: 1 },
  });

  return (
    <Container>
      {contracts.length ? (
        <>
          <div>The following contracts have been found:</div>
          {transition((styles, item) => (
            <a.div style={styles}>
              <ContractItem
                contract={item}
                loaderText={loaderText}
                onClick={onContractDataSelected}
              />
            </a.div>
          ))}
        </>
      ) : (
        <NoFoundContainer>
          <div>No contract found.</div>
          <Button
            mode="strong"
            label="Go back"
            onClick={() => navigate("/home")}
          />
        </NoFoundContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${2 * GU}px;
  padding: ${1 * GU}px;
  margin-top: ${15 * GU}px;
  margin-bottom: ${3 * GU}px;

  & > div:first-child {
    ${textStyle("body1")};
    color: ${({ theme }) => theme.content};
    margin: 0 ${2 * GU}px;
    margin-bottom: ${3 * GU}px;
  }
`;

const NoFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${4 * GU}px;
`;
