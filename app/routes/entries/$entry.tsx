import {
  BackButton,
  textStyle,
  IdentityBadge,
  GU,
  useViewport,
} from "@blossom-labs/rosette-ui";
import { useEffect, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { StatusModule } from "~/components/EntryScreen/StatusModule";
import type { FnEntryMetadata, FnEntrySubgraphData } from "~/types";
import { fetchFnEntry } from "~/utils/server/subgraph.server";
import { fetchEntryMetadata } from "~/utils/server/entries-data.server";

export const loader: LoaderFunction = async ({ params }) => {
  const entryId = params.entry;

  if (!entryId) {
    throw new Response("Expected entryId param", {
      status: 400,
      statusText: "Expected search params",
    });
  }

  const entry = await fetchFnEntry(entryId);

  if (!entry) {
    throw new Response("Entry not found", {
      status: 404,
      statusText: "Entry not found",
    });
  }

  const entryMetadata = await fetchEntryMetadata(entry.cid);

  if (entryMetadata.abi) {
    const abi = formatAbi(entryMetadata.abi);
    entryMetadata.abi = abi;
  }

  return json({ entry, entryMetadata });
};

type LoaderData = {
  entry?: FnEntrySubgraphData;
  entryMetadata?: FnEntryMetadata;
};

export default function EntryRoute() {
  const { entry, entryMetadata } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [date, setDate] = useState<string>();
  const { below } = useViewport();
  const compactMode = below("large");

  useEffect(() => {
    if (entry) {
      const rawDate = new Date(entry.upsertAt);
      setDate(formatRawDate(rawDate));
    }
  }, [entry]);

  return (
    <AppScreen hideBottomBar>
      <EntryContainer compactMode={compactMode} tabletMode={false}>
        <EntryInfoContainer>
          <BackButton onClick={() => navigate(`/entries`)} />
          <EntryTitle>{entryMetadata?.abi}</EntryTitle>
          <ContractTitle>{`Contract ${""}`}</ContractTitle>
          <DateTitle>{`Publicated on  ${date?.toString()}`}</DateTitle>
          <SubmitterContainer>
            <SubmitterTitle>Submitter</SubmitterTitle>
            <IdentityBadge entity={entry?.submitter} />
          </SubmitterContainer>
          <DescriptionContainer>
            <DescriptionTitle>Description</DescriptionTitle>
            <DescriptionContent>{entryMetadata?.notice}</DescriptionContent>
          </DescriptionContainer>
        </EntryInfoContainer>
        <StatusModule status={entry?.status} />
      </EntryContainer>
    </AppScreen>
  );
}

function formatRawDate(rawDate: Date) {
  const string = rawDate.toString();
  const dateArray = string.split(" ");
  const formattedDate = `${dateArray[1]} ${dateArray[2]}, ${dateArray[3]}`;
  return formattedDate;
}

function formatAbi(abi: string) {
  const formattedAbi = abi.replace("function ", "");
  return formattedAbi;
}

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DescriptionContent = styled.div`
  font-family: "Avenir";
  font-style: normal;
  ${textStyle("title4")};
  color: ${({ theme }) => theme.positiveContent};
`;

const DescriptionTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: start;
  height: 100%;
  width: 100%;
  ${textStyle("title3")};
  color: ${({ theme }) => theme.surfaceOpened};
`;

const SubmitterTitle = styled.div`
  margin-bottom: ${1 * GU}px;
  ${textStyle("body2")};
  color: ${({ theme }) => theme.surfaceOpened};
`;

const SubmitterContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateTitle = styled.div`
  ${textStyle("title4")};
  color: ${({ theme }) => theme.surfaceOpened};
`;

const ContractTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: start;
  height: 100%;
  width: 100%;
  ${textStyle("title4")};
  color: ${({ theme }) => theme.content};
`;

const EntryTitle = styled.div`
  font-weight: 400;
  font-size: 36px;
  color: ${({ theme }) => theme.content};}; 
`;

const EntryInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 650px;
  gap: ${2 * GU}px;
`;

const EntryContainer = styled.div<{
  compactMode: boolean;
  tabletMode: boolean;
}>`
  display: flex;
  flex-direction: ${({ compactMode }) => (compactMode ? "column" : "row")};
  justify-content: center;
  align-items: ${({ compactMode }) => (compactMode ? "center" : "start")};
  height: 100%;
  width: 100%;
  grid-gap: ${10 * GU}px;
  padding-top: ${({ compactMode, tabletMode }) =>
    compactMode ? 3 * GU : tabletMode ? 5 * GU : 9 * GU}px;
`;
