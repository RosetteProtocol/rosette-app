import { utils } from "ethers";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { ContractDescriptorScreen } from "~/components/ContractDescriptorScreen";
import { ContractSelectorScreen } from "~/components/ContractSelectorScreen";
import { SmoothDisplayContainer } from "~/components/SmoothDisplayContainer";
import type { ContractData, AggregatedContract } from "~/types";
import { fetchContracts } from "~/utils/server/contract-data.server";
import { getSearchParams } from "~/utils/server/utils.server";

type LoaderData = {
  contractAddress: string;
  contracts: AggregatedContract[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const [contractAddress] = getSearchParams(request.url, ["contractAddress"]);

  if (!contractAddress) {
    throw new Response("Expected contract param", {
      status: 400,
      statusText: "Expected search params",
    });
  }

  const contracts = await fetchContracts(contractAddress);

  return json({
    contracts,
    contractAddress,
  });
};

export default function Describe() {
  const { contracts, contractAddress } = useLoaderData<LoaderData>();
  const contractDescriptionsFetcher = useFetcher();
  const [selectedContractData, setSelectedContractData] =
    useState<ContractData>();

  useEffect(() => {
    if (
      !selectedContractData?.bytecode ||
      contractDescriptionsFetcher.type !== "init"
    ) {
      return;
    }

    contractDescriptionsFetcher.load(
      `/contract-descriptions-search?bytecodeHash=${utils.id(
        selectedContractData.bytecode
      )}`
    );
  }, [selectedContractData?.bytecode, contractDescriptionsFetcher]);

  return (
    <AppScreen hideBottomBar>
      <Container>
        {selectedContractData && contractDescriptionsFetcher.type === "done" ? (
          <SmoothDisplayContainer>
            <ContractDescriptorScreen
              contractAddress={contractAddress}
              contractData={selectedContractData}
              currentFnEntries={contractDescriptionsFetcher.data}
            />
          </SmoothDisplayContainer>
        ) : (
          <ContractSelectorScreen
            contracts={contracts}
            loaderText="Fetching descriptions…"
            onContractDataSelected={setSelectedContractData}
          />
        )}
      </Container>
    </AppScreen>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  height: 100%;
  width: 100%;
`;
