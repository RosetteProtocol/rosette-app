import { GU, useViewport } from "@1hive/1hive-ui";
import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { json, useNavigate } from "remix";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import type { FnEntry } from "~/types";
import { fetchFnEntries } from "~/utils/server/subgraph.server";

export const loader: LoaderFunction = async () => {
  const fns = await fetchFnEntries();

  // TODO: group by contract

  return json({ fns });
};

export default function Entries() {
  const { below } = useViewport();

  return (
    <AppScreen>
      <MainContainer compactMode={below("medium")}>
        <EntriesList />
      </MainContainer>
    </AppScreen>
  );
}

type LoaderData = {
  fns: FnEntry[];
};

export function EntriesList() {
  const { fns } = useLoaderData<LoaderData>();

  return (
    <AppScreen hideBottomBar>
      <Container>
        {fns.length ? (
          <ListContainer>
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
      {fn.sigHash}
    </EntryContainer>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  height: 100%;
  width: 100%;
`;

const MainContainer = styled.div<{ compactMode: boolean }>`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: ${({ compactMode }) => (compactMode ? 5 * GU : 17 * GU)}px;
  width: 100%;
  height: 100%;
`;

const ListContainer = styled.div`
  display: grid;
  grid-gap: ${2 * GU}px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin-bottom: ${2 * GU}px;
`;

const EntryContainer = styled.div`
  padding: ${5 * GU}px ${4 * GU}px ${3 * GU}px ${4 * GU}px;
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: ${2.5 * GU}px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: grid;
  grid-gap: ${2 * GU}px;
  text-align: center;
`;
