import styled from "styled-components";
import { ReactNode } from "react";

import { BottomBar } from "./BottomBar";
import { TopBar } from "./TopBar";

type AppLayoutProps = {
  children: ReactNode;
  displayTopBar?: boolean;
  displayBottomBar?: boolean;
};
export const AppLayout = ({
  children,
  displayTopBar = true,
  displayBottomBar = true,
}: AppLayoutProps) => (
  <Container>
    {displayTopBar && (
      <div style={{ flex: "none" }}>
        <TopBar />
      </div>
    )}
    <ChildrenWrapper>{children}</ChildrenWrapper>
    {displayBottomBar && (
      <div style={{ flex: "none" }}>
        <BottomBar />
      </div>
    )}
  </Container>
);

const Container = styled.div`
  position: relative;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

const ChildrenWrapper = styled.div`
  display: flex;
  flex: auto;
  flex-direction: column;
  scroll-behavior: smooth;
`;
