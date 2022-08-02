import { useEffect } from "react";
import { GU, textStyle, useViewport } from "@blossom-labs/rosette-ui";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { SmoothDisplayContainer } from "~/components/SmoothDisplayContainer";
import { StatusLabel } from "~/components/StatusLabel";
import { EntriesFilters } from "~/components/EntriesFilters";
import { useFnEntriesFilters } from "~/providers/FnEntriesFilters";
import type { FnEntry } from "~/types";
import { fetchFnEntries } from "~/utils/server/subgraph.server";

import dateStyles from "react-date-range/dist/styles.css";
import defaultDateStyles from "react-date-range/dist/theme/default.css";
import dateRangeCustomStyles from "../../components/EntryScreen/DateRangeCustom/style.css";

export function links() {
  return [
    { rel: "stylesheet", href: dateStyles },
    { rel: "stylesheet", href: defaultDateStyles },
    { rel: "stylesheet", href: dateRangeCustomStyles },
  ];
}

export const loader: LoaderFunction = async () => {
  const fns = await fetchFnEntries();

  return json({ fns });
};

type LoaderData = {
  fns: FnEntry[];
};

export default function Entries() {
  const { fns } = useLoaderData<LoaderData>();
  const { below, within } = useViewport();
  console.log(useFnEntriesFilters);
  const {
    setEntries,
    externalFilters,
    internalFilters,
    clearValues,
    filteredEntries,
  } = useFnEntriesFilters();
  console.log(
    setEntries,
    externalFilters,
    internalFilters,
    clearValues,
    filteredEntries
  );

  const { submitterFilter, statusFilter, dateRangeFilter, searchFilter } =
    externalFilters;

  const { sortingOption } = internalFilters;

  const [, setSubmitterFilter] = submitterFilter;
  const [, setStatusFilter] = statusFilter;
  const [dateRangeFilterSelected, setDateRangeFilter] = dateRangeFilter;
  const [searchFilterSelected, setSearchFilter] = searchFilter;

  const [, setSortingOption] = sortingOption;

  const compactMode = below("medium");
  const tabletMode = within("medium", "large");

  useEffect(() => {
    setEntries(fns);
  }, [fns, setEntries]);

  return (
    <AppScreen hideBottomBar>
      <SmoothDisplayContainer>
        <EntriesFilters
          compactMode={compactMode}
          tabletMode={tabletMode}
          search={searchFilterSelected}
          dateRange={dateRangeFilterSelected}
          setDateRange={setDateRangeFilter}
          setSearch={setSearchFilter}
          setStatusFilter={setStatusFilter}
          setSorting={setSortingOption}
          clearValues={clearValues}
          setSubmitterFilter={setSubmitterFilter}
        />
        <Container compactMode={compactMode} tabletMode={tabletMode}>
          {filteredEntries.length ? (
            <ListContainer compactMode={compactMode} tabletMode={tabletMode}>
              {filteredEntries.map((f) => (
                <EntryCard key={f.id} fn={f} />
              ))}
            </ListContainer>
          ) : (
            <EmptyContent>No entries found</EmptyContent>
          )}
        </Container>
      </SmoothDisplayContainer>
    </AppScreen>
  );
}

function EntryCard({ fn }: { fn: FnEntry }) {
  const navigate = useNavigate();

  return (
    <EntryContainer onClick={() => navigate(`/entries/${fn.id}`)}>
      <NoticeContainer>{fn.abi?.split("function")}</NoticeContainer>
      <InfoContainer>
        <Hash>{fn.sigHash}</Hash>
        <StatusLabel status={fn.status} />
      </InfoContainer>
    </EntryContainer>
  );
}

const Container = styled.div<{ compactMode: boolean; tabletMode: boolean }>`
  display: flex;
  justify-content: center;
  align-items: start;
  padding-top: ${({ compactMode, tabletMode }) =>
    compactMode ? 3 * GU : tabletMode ? 5 * GU : 9 * GU}px;
  height: 100%;
  width: 100%;
`;

const ListContainer = styled.div<{ compactMode: boolean; tabletMode: boolean }>`
  display: grid;
  grid-gap: ${({ compactMode, tabletMode }) =>
    compactMode ? 3 * GU : tabletMode ? 3 * GU : 5 * GU}px;
  grid-template-columns: ${({ compactMode, tabletMode }) =>
    `repeat(${compactMode ? "1" : tabletMode ? "2" : "3"}, ${
      compactMode ? "327" : tabletMode ? "336" : "350"
    }px)`};
  margin-bottom: ${5 * GU}px;
`;

const EntryContainer = styled.div`
  padding: ${3 * GU}px;
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: ${2.5 * GU}px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 223px;
`;

const NoticeContainer = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  word-wrap: break-word;
  overflow: hidden;
  ${textStyle("title3")};
  color: ${({ theme }) => theme.content};
`;

const InfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.border};
  padding-top: ${4 * GU}px;
`;

const Hash = styled.div`
  ${textStyle("title4")};
  color: ${({ theme }) => theme.content};
`;

const EmptyContent = styled.div`
  ${textStyle("body2")};
  color: ${({ theme }) => theme.content};
`;
