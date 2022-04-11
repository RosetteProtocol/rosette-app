import type { LoaderFunction } from "remix";
import { json } from "remix";
import { useLoaderData } from "remix";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import type { FnEntry } from "~/types";
import { fetchFnEntry } from "~/utils/server/subgraph.server";

export const loader: LoaderFunction = async ({ params }) => {
  const entryId = params.entry;

  if (!entryId) {
    throw new Response("Expected entryId param", {
      status: 400,
      statusText: "Expected search params",
    });
  }

  const entry = await fetchFnEntry(entryId);

  return json({ entry });
};

type LoaderData = {
  entry?: FnEntry;
};

export default function EntryRoute() {
  const { entry } = useLoaderData<LoaderData>();

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
