import { GU, useViewport } from "@1hive/1hive-ui";
import { a } from "@react-spring/web";
import styled from "styled-components";

import { useAppReady } from "~/providers/AppReady";
import { AccountModule } from "~/components/AccountModule";
import { NavSection } from "./NavSection";

export const TopBar = () => {
  const { appReadyTransition } = useAppReady();
  const { below } = useViewport();
  const compactMode = below("large");
  const mobileMode = below("medium");

  return (
    <NavContainer>
      {appReadyTransition(
        ({ progress, topBarTransform }, ready) =>
          ready && (
            <AnimatedContainer
              style={{
                opacity: progress,
                transform: topBarTransform,
              }}
              $compactMode={compactMode}
            >
              <NavSection compact={compactMode} />
              <AccountModule compact={mobileMode} />
            </AnimatedContainer>
          )
      )}
    </NavContainer>
  );
};

const NavContainer = styled.nav`
  position: relative;
  margin: 0 auto;
  height: ${8 * GU}px;
`;

const AnimatedContainer = styled(a.div)<{ $compactMode: boolean }>`
  position: absolute;
  inset: 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  ${({ $compactMode }) =>
    $compactMode
      ? `
    padding-right: ${1 * GU}px;
  `
      : `
    padding-right: ${5 * GU}px;
    padding-left: ${5 * GU}px;
  `};
  display: flex;
  justify-content: space-between;
`;
