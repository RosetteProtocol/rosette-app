import { BackButton, textStyle, IdentityBadge, GU, useViewport } from '@blossom-labs/rosette-ui'
import { useEffect, useState } from 'react'
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { StatusModule } from "~/components/EntryScreen/StatusModule";
import { DescriptionHolder } from "~/components/EntryScreen/DescriptionHolder/index"
import type { FnEntry } from "~/types";
import { fetchFnEntry } from "~/utils/server/subgraph.server";

function formatRawDate(rawDate: Date) {
  const string = rawDate.toString()
  const dateArray = string.split(' ')
  const formattedDate = `${dateArray[1]} ${dateArray[2]}, ${dateArray[3]}`
  return formattedDate
}

function formatAbi(abi: string) {
  const formattedAbi = abi.replace('function ', '')
  return formattedAbi
}

export const loader: LoaderFunction = async ({ params }) => {
  const entryId = params.entry;

  if (!entryId) {
    throw new Response("Expected entryId param", {
      status: 400,
      statusText: "Expected search params",
    });
  }

  const entry = await fetchFnEntry(entryId);

  // Contract name is not available in the subgraph

  if (entry) {
    const abi = formatAbi(entry.abi)
    entry.abi = abi
  }

  return json({ entry });
};

type LoaderData = {
  entry?: FnEntry;
};

export default function EntryRoute() {
  const { entry } = useLoaderData<LoaderData>();
  const navigate = useNavigate()
  const [date, setDate] = useState<string>()
  const { below } = useViewport()
  const compactMode = below("large");


  useEffect(() => {
  if (entry) {
    const rawDate = new Date(entry.upsertAt)
    setDate(formatRawDate(rawDate))
  }
  }, [entry]) 
  console.log(entry)

  return (
    <AppScreen hideBottomBar>
      <EntryContainer compactMode={compactMode} tabletMode={false}>
        <EntryInfoContainer>
          <BackButton onClick={() => navigate(`/entries`)} />
          <EntryTitle>{entry?.abi}</EntryTitle>
          <ContractTitle>{`Contract ${''}`}</ContractTitle>
          <DateTitle>{`Publicated on  ${date?.toString()}`}</DateTitle>
          <SubmitterContainer>
            <SubmitterTitle>Submitter</SubmitterTitle>
            <IdentityBadge entity={entry?.submitter} />
          </SubmitterContainer>
          <DescriptionHolder notice={entry?.notice} />
        </EntryInfoContainer>
        <StatusModule status={entry?.status} />
      </EntryContainer>
    </AppScreen>
  );
}

const SubmitterTitle = styled.div`
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.border};
  margin-bottom: ${1 * GU}px;
`

const SubmitterContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${4 * GU}px;
  margin-bottom: ${4 * GU}px;
`

const DateTitle = styled.div`
  ${textStyle("title3")};
  color: ${({ theme }) => theme.border};
`

const ContractTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: start;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.content};
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
`;
const EntryTitle = styled.div`
font-weight: 400;
font-size: 36px;
color: ${({ theme }) => theme.content};}; 
`

const EntryInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
`;

const EntryContainer = styled.div<{ compactMode: boolean; tabletMode: boolean}>`
  display: flex;
  flex-direction: ${({ compactMode }) => (compactMode ? "column" : "row")};
  grid-gap: ${({ compactMode }) => (compactMode ? 10 * GU : 30 * GU)}px;
  justify-content: center;
  align-items: ${({ compactMode }) => (compactMode ? "center" : "start")};
  padding-top: ${({ compactMode, tabletMode }) =>
    compactMode ? 3 * GU : tabletMode ? 5 * GU : 9 * GU}px;
  height: 100%;
  width: 100%;
`;
