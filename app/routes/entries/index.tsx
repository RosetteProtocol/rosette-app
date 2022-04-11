import { GU, textStyle, useTheme, useViewport } from "@1hive/1hive-ui";
import { utils } from "ethers";
import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { json, useNavigate } from "remix";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import type { FnEntry } from "~/types";
import { fetchFnEntries } from "~/utils/server/subgraph.server";

export const loader: LoaderFunction = async () => {
  const fns = await fetchFnEntries();

  // const contractsToFns = fns.reduce((acc, fn) => {
  //   return {
  //     ...acc,
  //     [fn.contract]: [fn],
  //   };
  // }, {});

  // console.log(contractsToFns);

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
        <div>
          {fns.length ? (
            <div>
              <div
                style={{
                  display: "grid",
                  gridGap: 2 * GU,
                  gridTemplateColumns: "repet(auto-fill, minmax(280px, 1fr))",
                  marginBottom: 2 * GU,
                }}
              >
                {fns.map((f) => (
                  <EntryCard key={f.id} fn={f} />
                ))}
              </div>
            </div>
          ) : (
            <div>No entries found</div>
          )}
        </div>
      </Container>
    </AppScreen>
  );
}

function EntryCard({ fn }: { fn: FnEntry }) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/entries/${utils.id(fn.id)}`)}
      style={{
        padding: `${5 * GU}px ${4 * GU}px ${3 * GU}px ${4 * GU}px`,
        background: `${theme.surface}`,
        border: `1px solid ${theme.border}`,
        borderRadius: `${2.5 * GU}px`,
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.15)",
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "72px 32px 92px auto auto",
        gridGap: `${2 * GU}px`,
        textAlign: "center",
      }}
    >
      {/* <div
        style={{
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          style={{
            borderRadius: "100%",
          }}
          src={garden.logo || defaultGardenLogo}
          alt=""
          height="72"
        />
      </div> */}
      {/* <div
        style={{
          textStyle("title4"),
        }}
      >
        {fn.abi}
      </div>
      <div
        css={`
          color: ${theme.contentSecondary};
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        `}
      >
        {garden.description || "No description"}
      </div>
      <div
        css={`
          display: flex;
          align-items: center;
          margin-bottom: ${1 * GU}px;
          ${textStyle("title4")};
          justify-content: center;
          color: ${theme.content};
        `}
      >
        <img
          src={token?.logo || defaultTokenLogo}
          alt=""
          height="20"
          width="20"
        />
        <span
          css={`
            margin-left: ${0.75 * GU}px;
          `}
        >
          {token?.symbol}
        </span>
      </div>
      <div
        css={`
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: ${theme.contentSecondary};
        `}
      >
        <div>
          {garden.proposalCount} Proposal{garden.proposalCount === 1 ? "" : "s"}
        </div>
        <div>
          {garden.supporterCount} Member{garden.supporterCount === 1 ? "" : "s"}
        </div>
      </div> */}
      {fn.sigHash}
    </div>
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
