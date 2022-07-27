import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import type { FnEntrySubgraphData } from "~/types";
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
  entry?: FnEntrySubgraphData;
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
  color: ${({ theme }) => theme.content};
`;
