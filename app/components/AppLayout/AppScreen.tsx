import { ReactNode } from "react";
import { a } from "react-spring";
import styled from "styled-components";

import { useAppReady } from "~/providers/AppReady";

export const AppScreen = ({ children }: { children: ReactNode }) => {
  const { appReadyTransition } = useAppReady();
  return appReadyTransition(
    ({ progress, screenTransform }, ready) =>
      ready && (
        <AnimatedContainer
          style={{ opacity: progress, transform: screenTransform }}
        >
          <InnerContainer>{children}</InnerContainer>
        </AnimatedContainer>
      )
  );
};

const AnimatedContainer = styled(a.div)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  margin: 0 auto;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
