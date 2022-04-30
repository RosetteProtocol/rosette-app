import { GU, useTheme, useViewport } from "@blossom-labs/rosette-ui";
import { a } from "@react-spring/web";
import styled from "styled-components";
import { useAppReady } from "~/providers/AppReady";
import { BlossomLabsLogo } from "~/components/BlossomLabs";

const OPACITY = 0.8;
export const BottomBar = () => {
  const { below } = useViewport();
  const theme = useTheme();
  const { appReadyTransition } = useAppReady();
  const compactMode = below("large");

  return (
    <Container>
      {appReadyTransition(
        ({ progress, bottomBarTransform }, ready) =>
          ready && (
            <AnimatedContainer
              style={{ opacity: progress, transform: bottomBarTransform }}
              $compactMode={compactMode}
            >
              <div style={{ color: theme.surfaceContent, opacity: OPACITY }}>
                powered by &nbsp; <BlossomLabsLogo />
              </div>
            </AnimatedContainer>
          )
      )}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  height: ${7 * GU}px;
`;

const AnimatedContainer = styled(a.div)<{ $compactMode: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  padding: 0 ${7 * GU}px;

  justify-content: ${({ $compactMode }) =>
    $compactMode ? "center" : "flex-start"};
`;
