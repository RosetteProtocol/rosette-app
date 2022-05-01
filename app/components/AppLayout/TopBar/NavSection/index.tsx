import { GU, textStyle } from "@blossom-labs/rosette-ui";
import { NavLink } from "@remix-run/react";
import styled from "styled-components";
import { CompactMenu } from "./CompactMenu";

import homeIcon from "~/assets/sidebar-home.svg";
import entriesIcon from "~/assets/sidebar-entries.svg";
import guidelinesIcon from "~/assets/sidebar-guidelines.svg";

export type NavigationItem = {
  icon: string;
  label: string;
  to: string;
};

const navigationItem: NavigationItem[] = [
  { icon: homeIcon, label: "Home", to: "/home" },
  { icon: entriesIcon, label: "All Entries", to: "/entries" },
  { icon: guidelinesIcon, label: "Guidelines", to: "/guidelines" },
  { icon: "", label: "Swap RST", to: "/swap" },
];

export const NavSection = ({ compact }: { compact: boolean }) => {
  return compact ? (
    <CompactMenu items={navigationItem} />
  ) : (
    <NavLinksList>
      {navigationItem.map(({ label, to }) => (
        <li key={label}>
          <NavLink to={to}>{label === "Home" ? "rosette" : label}</NavLink>
        </li>
      ))}
    </NavLinksList>
  );
};

const NavLinksList = styled.ul`
  display: flex;
  align-items: center;
  gap: ${6 * GU}px;
  list-style: none;
  ${textStyle("body2")};
  color: ${(props) => props.theme.content};

  li:first-child {
    ${textStyle("title2")};
    text-decoration: none;
  }

  > li {
    transition: all 200ms ease-out;
    &:hover {
      color: ${(props) => props.theme.surfaceUnder.alpha(0.1)};
    }
  }

  li > * {
    text-decoration: none;
  }
`;
