import { GU, textStyle } from "@1hive/1hive-ui";
import { NavLink } from "@remix-run/react";
import { a } from "react-spring";
import styled from "styled-components";
import { AccountModule } from "~/components/AccountModule";
import { useAppReady } from "~/providers/AppReady";

export const TopBar = () => {
  const { appReadyTransition } = useAppReady();

  return (
    <NavContainer>
      {appReadyTransition(
        ({ progress, topBarTransform }, ready) =>
          ready && (
            <AnimatedContainer
              style={{ opacity: progress, transform: topBarTransform }}
            >
              <NavLinksList>
                <li>
                  <NavLink to="/">Rosette</NavLink>
                </li>
                <li>
                  <NavLink to="/entries">Entries</NavLink>
                </li>
                <li>
                  <NavLink to="/guidelines">Guidelines</NavLink>
                </li>
              </NavLinksList>
              <AccountModule />
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

const AnimatedContainer = styled(a.div)`
  position: absolute;
  inset: 0;
  padding: ${1.7 * GU}px ${5 * GU}px;
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
