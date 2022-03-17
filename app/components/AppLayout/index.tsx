import { ReactNode } from "react";
import styled from "styled-components";
import { BottomBar } from "./BottomBar";
import { TopBar } from "./TopBar";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Container>
      <div style={{ flex: "none" }}>
        <TopBar />
      </div>
      <ChildrenWrapper>{children}</ChildrenWrapper>
      <div style={{ flex: "none" }}>
        <BottomBar />
      </div>
    </Container>
  );
};

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
