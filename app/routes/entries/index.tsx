import { GU, textStyle, useViewport } from "@blossom-labs/rosette-ui";
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

type LoaderData = {
  fns: FnEntry[];
};

export default function Entries() {
  const { fns } = useLoaderData<LoaderData>();
  const { below, within } = useViewport();

  const compactMode = below("medium");
  const tabletMode = within("medium", "large");

  return (
    <AppScreen hideBottomBar>
      <SmoothDisplayContainer>
        <Container compactMode={compactMode} tabletMode={tabletMode}>
          {fns.length ? (
            <ListContainer compactMode={compactMode} tabletMode={tabletMode}>
              {fns.map((f) => (
                <EntryCard key={f.id} fn={f} />
              ))}
            </ListContainer>
          ) : (
            <div>No entries found</div>
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
      <NoticeContainer>
        swapExactETHForTokens(uint256,address[],address,uint256)
      </NoticeContainer>
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
