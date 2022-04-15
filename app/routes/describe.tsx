import { utils } from "ethers";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useCatch, useFetcher, useLoaderData } from "@remix-run/react";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { ContractDescriptorScreen } from "~/components/ContractDescriptorScreen";
import { ContractSelectorScreen } from "~/components/ContractSelectorScreen";
import { SmoothDisplayContainer } from "~/components/SmoothDisplayContainer";
import type { ContractData, AggregateContract } from "~/types";
import { fetchContracts } from "~/utils/server/contract-data.server";

type LoaderData = {
  contractAddress: string;
  contracts: AggregateContract[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const contractAddress = searchParams.get("contract");

  if (!contractAddress) {
    throw new Response("Expected contract param", {
      status: 400,
      statusText: "Expected search params",
    });
  }

  const contracts = await fetchContracts(contractAddress);

  return json({ contracts });
};

export default function Describe() {
  const { contracts } = useLoaderData<LoaderData>();
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

// https://remix.run/docs/en/v1/api/conventions#catchboundary
export function CatchBoundary() {
  const caught = useCatch();

  let message;

  switch (caught.status) {
    case 400:
      message = caught.data;
    case 500:
      message = caught.data;
      break;
    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <div>
      <div>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </div>
    </div>
  );
}
