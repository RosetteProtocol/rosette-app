import { GU, useViewport } from "@1hive/1hive-ui";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { SmoothDisplayContainer } from "~/components/SmoothDisplayContainer";
import { StatusLabel } from "~/components/StatusLabel";
import type { FnEntry } from "~/types";
import { fetchFnEntries } from "~/utils/server/subgraph.server";

export const loader: LoaderFunction = async () => {
  const fns = await fetchFnEntries();

  return json({ fns });
};

export default function Entries() {
  const { below } = useViewport();

  return (
    <AppScreen>
      <SmoothDisplayContainer>
        <MainContainer compactMode={below("medium")}>
          <EntriesList />
        </MainContainer>
      </SmoothDisplayContainer>
    </AppScreen>
  );
}

type LoaderData = {
  fns: FnEntry[];
};

export function EntriesList() {
  const { fns } = useLoaderData<LoaderData>();
  const { below, within } = useViewport();

  return (
    <AppScreen hideBottomBar>
      <Container>
        {fns.length ? (
          <ListContainer
            compactMode={below("medium")}
            tabletMode={within("medium", "large")}
          >
            {fns.map((f) => (
              <EntryCard key={f.id} fn={f} />
            ))}
          </ListContainer>
        ) : (
          <div>No entries found</div>
        )}
      </Container>
    </AppScreen>
  );
}

function EntryCard({ fn }: { fn: FnEntry }) {
  const navigate = useNavigate();

  return (
    <EntryContainer onClick={() => navigate(`/entries/${fn.id}`)}>
      <NoticeContainer>
        swapExactETHForTokens(uint256,address[],address,uint256)
      </NoticeContainer>
      <InfoContainer>
        <div>{fn.sigHash}</div>
        <StatusLabel status={fn.status} />
      </InfoContainer>
    </EntryContainer>
  );
}

const MainContainer = styled.div<{ compactMode: boolean }>`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: ${({ compactMode }) => (compactMode ? 5 * GU : 17 * GU)}px;
  width: 100%;
  height: 100%;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  height: 100%;
  width: 100%;
`;

const ListContainer = styled.div<{ compactMode: boolean; tabletMode: boolean }>`
  display: grid;
  grid-gap: ${5 * GU}px;
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
  display: grid;
  grid-gap: ${3 * GU}px;
  height: 223px;
`;

const NoticeContainer = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid ${(props) => props.theme.border};
`;
