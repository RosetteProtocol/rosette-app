import { json, LoaderFunction, useCatch, useLoaderData } from "remix";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { ContractDescriptorScreen } from "~/components/ContractDescriptorScreen";
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

  const contractData = await fetchContractData(contractAddress, networkId);

  return json(contractData);
};

export default function Describe() {
  const contractData = useLoaderData();

  return (
    <AppScreen>
      <Container>
        <ContractDescriptorScreen contractData={contractData} />
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
