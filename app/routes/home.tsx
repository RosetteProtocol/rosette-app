import { LoadingRing, GU } from "@1hive/1hive-ui";
import {
  json,
  LoaderFunction,
  useLoaderData,
  useNavigate,
  useTransition,
} from "remix";
import styled from "styled-components";
import { allChains, Chain } from "wagmi";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { ContractForm } from "~/components/ContractForm";

const networkExplorerRegex = /([A-Z]+)_EXPLORER_API_KEY/;

export const loader: LoaderFunction = async () => {
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
};

export default function Home() {
  const availableNetworks: Chain[] = useLoaderData();
  const navigate = useNavigate();
  const t = useTransition();

  return (
    <AppScreen>
      <MainContainer>
        {t.state === "loading" ? (
          <div style={{ display: "flex", gap: GU }}>
            {" "}
            <LoadingRing mode="half-circle" />
            Fetching contract data...
          </div>
        ) : (
          <ContractForm
            availableNetworks={availableNetworks}
            onSubmit={(contractAddress, networkIndex) =>
              navigate(
                `/describe?contract=${contractAddress}&networkId=${availableNetworks[networkIndex].id}`
              )
            }
          />
        )}
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
