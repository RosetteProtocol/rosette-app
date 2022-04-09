import { GU, useViewport } from "@1hive/1hive-ui";
import { Outlet, useNavigate } from "remix";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";

export default function Home() {
  const { below } = useViewport();
  const navigate = useNavigate();

  return (
    <AppScreen>
      <MainContainer compactMode={below("medium")}>
        <Outlet />
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
