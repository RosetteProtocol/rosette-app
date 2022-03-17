import { GU, useTheme } from "@1hive/1hive-ui";
import { a } from "react-spring";
import styled from "styled-components";
import { useAppReady } from "~/providers/AppReady";
import { BlossomLabsLogo } from "../../BlossomLabsLogo";

const OPACITY = 0.65;

export const BottomBar = () => {
  const theme = useTheme();
  const { appReadyTransition } = useAppReady();

  console.log(theme.surfaceContent);
  return (
    <Container>
      {appReadyTransition(
        ({ progress, bottomBarTransform }, ready) =>
          ready && (
            <AnimatedContainer
              style={{ opacity: progress, transform: bottomBarTransform }}
            >
              <div style={{ color: theme.surfaceContent, opacity: OPACITY }}>
                Made by <BlossomLabsLogo /> with{" "}
                <span
                  style={{
                    fontSize: "25px",
                    color: theme.red.alpha(OPACITY),
                  }}
                >
                  &hearts;
                </span>
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

const AnimatedContainer = styled(a.div)`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  padding-right: ${7 * GU}px;
`;
