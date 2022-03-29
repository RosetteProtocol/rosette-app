import { ReactNode, useEffect } from "react";
import { a } from "react-spring";
import { useOutletContext } from "remix";
import styled from "styled-components";
import { useAppReady } from "~/providers/AppReady";
import { AppContext } from "~/App";

type AppScreenProps = {
  children: ReactNode;
  hideBottomBar?: boolean;
  hideTopBar?: boolean;
};

export const AppScreen = ({
  children,
  hideBottomBar = false,
  hideTopBar = false,
}: AppScreenProps) => {
  const { appReadyTransition } = useAppReady();
  const { displayBottomBar, displayTopBar } = useOutletContext<AppContext>();

  useEffect(() => {
    if (hideBottomBar) {
      displayBottomBar(false);
    }
    if (hideTopBar) {
      displayTopBar(false);
    }
  }, [hideBottomBar, hideTopBar, displayBottomBar, displayTopBar]);

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
