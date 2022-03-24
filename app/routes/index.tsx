import { json, useLoaderData } from "remix";
import styled from "styled-components";
import { allChains } from "wagmi";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { ContractForm } from "~/components/ContractForm";

const networkExplorerRegex = /([A-Z]+)_EXPLORER_API_KEY/;

export async function loader() {
  const availableExplorers = Object.keys(process.env)
    .filter((key) => networkExplorerRegex.test(key))
    .map((key) => key.split("_")[0].toLowerCase());

  return json(
    allChains.filter(
      (chain) =>
        // Check if chain has the same explorer
        !!chain.blockExplorers?.find(({ name }) =>
          availableExplorers.includes(name.toLowerCase())
        )
    )
  );
}

export default function Index() {
  return (
    <AppScreen>
      <MainContainer>
        <ContractForm availableNetworks={useLoaderData()} onSubmit={() => {}} />
      </MainContainer>
    </AppScreen>
  );
}

const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;