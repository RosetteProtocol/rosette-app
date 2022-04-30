import { GU, useViewport } from "@blossom-labs/rosette-ui";
import {
  useCatch,
  useNavigate,
  useResolvedPath,
  useTransition,
} from "@remix-run/react";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { ContractForm } from "~/components/ContractForm";

export default function Home() {
  const { below } = useViewport();
  const navigate = useNavigate();

  const transition = useTransition();
  const pathDescribe = useResolvedPath("/describe");

  const describeIsPending =
    transition.state === "loading" &&
    transition.location.pathname === pathDescribe.pathname;

  return (
    <AppScreen>
      <MainContainer compactMode={below("medium")}>
        <ContractForm
          loading={describeIsPending}
          onSubmit={(contractAddress) =>
            navigate(`/describe?contract=${contractAddress}`)
          }
        />
      </MainContainer>
    </AppScreen>
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

// https://remix.run/docs/en/v1/api/conventions#catchboundary
export function CatchBoundary() {
  const caught = useCatch();

  let message;

  switch (caught.status) {
    case 400:
      message = caught.data;
    case 500:
      message = caught.data;
      break;
    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <div>
      <div>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </div>
    </div>
  );
}
