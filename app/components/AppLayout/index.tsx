import { useViewport } from "@blossom-labs/rosette-ui";
import type { ReactNode } from "react";
import styled from "styled-components";
import background from "~/assets/background.png";
import tablet from "~/assets/tablet.png";
import mobile from "~/assets/mobile.png";
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
}: AppLayoutProps) => {
  const { below, within } = useViewport();

  const compactMode = below("medium");
  const tabletMode = within("medium", "large");

  return (
    <Container compactMode={compactMode} tabletMode={tabletMode}>
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
};

const Container = styled.div<{
  compactMode: boolean;
  tabletMode: boolean;
}>`
  position: relative;
  overflow: auto;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-image: url(${({ compactMode, tabletMode }) =>
    compactMode ? mobile : tabletMode ? tablet : background});
`;

const ChildrenWrapper = styled.div`
  display: flex;
  flex: auto;
  flex-direction: column;
  scroll-behavior: smooth;
`;
