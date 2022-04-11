import { utils } from "ethers";
import type { LoaderFunction } from "remix";
import { json } from "remix";
import { useLoaderData, useParams } from "remix";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import type { FnEntry } from "~/types";
import { fetchFnEntries } from "~/utils/server/subgraph.server";

export const loader: LoaderFunction = async () => {
  const fns = await fetchFnEntries();

  return json({ fns });
};

type LoaderData = {
  fns: FnEntry[];
};

export default function EntryRoute() {
  const { fns } = useLoaderData<LoaderData>();
  const { entryId } = useParams();

  const entry = fns.find((f) => utils.id(f.id) === entryId);

  return (
    <AppScreen hideBottomBar>
      <Container>{entry?.sigHash}</Container>
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
