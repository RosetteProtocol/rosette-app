import {
  ButtonBase,
  GU,
  IconMenu,
  textStyle,
  useViewport,
} from "@1hive/1hive-ui";
import { NavLink } from "@remix-run/react";
import { a } from "react-spring";
import styled from "styled-components";

import { useAppReady } from "~/providers/AppReady";
import { AccountModule } from "~/components/AccountModule";
import { CompactMenu } from "./CompactMenu";

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
              {compactMode ? (
                <CompactMenu />
              ) : (
                <NavLinksList>
                  <li>
                    <NavLink to="/home">Rosette</NavLink>
                  </li>
                  <li>
                    <NavLink to="/entries">Entries</NavLink>
                  </li>
                  <li>
                    <NavLink to="/guidelines">Guidelines</NavLink>
                  </li>
                </NavLinksList>
              )}
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

const NavLinksList = styled.ul`
  display: flex;
  align-items: center;
  gap: ${6 * GU}px;
  list-style: none;

  li:first-child {
    ${textStyle("title2")};
  }

  > li {
    transition: all 200ms ease-out;
    &:hover {
      color: ${(props) => props.theme.surfaceHighlight};
    }
  }

  li > * {
    text-decoration: none;
  }
`;
