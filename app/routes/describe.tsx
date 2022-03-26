import { GU, LoadingRing, useViewport } from "@1hive/1hive-ui";
import { utils } from "ethers";
import { Fragment } from "ethers/lib/utils";
import { useMemo } from "react";
import { json, LoaderFunction, useCatch, useLoaderData } from "remix";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { Carousel } from "~/components/Carousel";
import { FunctionDescription } from "~/components/FunctionDescription";
import { getFnSelector } from "~/utils";
import { fetchContractData } from "~/utils/server/contract-data.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const contractAddress = searchParams.get("contract");
  const networkId = Number(searchParams.get("networkId"));

  if (!contractAddress || !networkId) {
    const message = `Expected  ${!networkId ? "networkId" : "contract"} param`;
    throw new Response(message, {
      status: 400,
      statusText: "Expected search params",
    });
  }

  const contractData = await fetchContractData(contractAddress);

  return json(contractData);
};

export default function DescribeScreen() {
  const contractData = useLoaderData();
  const { below } = useViewport();
  const fnFragments = useMemo(
    () =>
      new utils.Interface(contractData.abi).fragments.filter(
        (f: Fragment) => f.type === "function"
      ),
    [contractData.abi]
  );
  const compactMode = below("large");

  return (
    <AppScreen>
      <Container>
        {!contractData ? (
          <div style={{ display: "flex", gap: GU }}>
            {" "}
            <LoadingRing mode="half-circle" />
            Loading...
          </div>
        ) : (
          <Carousel
            items={fnFragments.map((f) => {
              const key = getFnSelector(f);
              return (
                <FunctionDescription
                  key={key}
                  description={""}
                  fragment={f}
                  onEntryChange={() => {}}
                />
              );
            })}
            direction={compactMode ? "horizontal" : "vertical"}
            itemSpacing={450}
            size="527px"
          />
        )}
      </Container>
    </AppScreen>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
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
