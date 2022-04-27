import { GU, textStyle } from "@blossom-labs/rosette-ui";
import styled from "styled-components";
import { a, useTransition } from "@react-spring/web";
import type { ContractData, AggregateContract } from "~/types";
import { ContractItem } from "./ContractItem";

type ContractSelectorScreenProps = {
  contracts: AggregateContract[];
  loaderText?: string;
  onContractDataSelected(contractData: ContractData): void;
};

export const ContractSelectorScreen = ({
  contracts,
  loaderText,
  onContractDataSelected,
}: ContractSelectorScreenProps) => {
  const transition = useTransition(contracts, {
    trail: 100 / contracts.length,
    from: { opacity: 0, scale: 0 },
    enter: { opacity: 1, scale: 1 },
  });

  return (
    <Container>
      <div>The following contracts have been found for the given address:</div>
      {transition((styles, item) => (
        <a.div style={styles}>
          <ContractItem
            contract={item}
            loaderText={loaderText}
            onClick={onContractDataSelected}
          />
        </a.div>
      ))}
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
    margin: 0 ${2 * GU}px;
    margin-bottom: ${3 * GU}px;
  }
`;
