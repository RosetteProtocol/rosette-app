import { useSubmit } from "@remix-run/react";
import { utils } from "ethers";
import { useCallback, useEffect, useState } from "react";
import type { LoaderFunction } from "remix";
import { json, useCatch, useFetcher, useLoaderData } from "remix";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { ContractDescriptorScreen } from "~/components/ContractDescriptorScreen";
import { useContractDescriptorStore } from "~/components/ContractDescriptorScreen/use-contract-descriptor-store";
import useRosetteActions from "~/components/ContractDescriptorScreen/useRosetteActions";
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

  return json({
    contracts,
    contractAddress,
    rosetteContractAddress: process.env.ROSETTE_STONE_ADDRESS,
  });
};

export default function Describe() {
  const { contracts, contractAddress, rosetteContractAddress } =
    useLoaderData<LoaderData>();
  const contractDescriptionsFetcher = useFetcher();
  const [selectedContractData, setSelectedContractData] =
    useState<ContractData>();

  // Submit entries handler
  const { userFnDescriptions } = useContractDescriptorStore();
  const { upsertEntries } = useRosetteActions(rosetteContractAddress);
  const actionFetcher = useFetcher();
  const handleUpsertEntries = useCallback(
    (event) => {
      event.preventDefault();

      console.log("submitting");
      actionFetcher.submit(
        { hola: "hola" },
        {
          method: "post",
          action: "/fn-descriptions-upload",
        }
      );
      const sigs = Object.values(userFnDescriptions).map(
        ({ sigHash }) => sigHash
      );
      const scopes = new Array(sigs.length).fill(contractAddress);
      const cids: string[] = [];

      upsertEntries(scopes, sigs, cids);
    },
    [actionFetcher, contractAddress, upsertEntries, userFnDescriptions]
  );

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
              onUpsertEntries={handleUpsertEntries}
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
