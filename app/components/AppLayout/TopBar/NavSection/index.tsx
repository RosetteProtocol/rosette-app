import { GU, textStyle } from "@1hive/1hive-ui";
import { NavLink } from "remix";
import styled from "styled-components";
import { CompactMenu } from "./CompactMenu";

export type NavigationItem = {
  icon: string;
  label: string;
  to: string;
};

const navigationItem: NavigationItem[] = [
  { icon: "", label: "Home", to: "/home" },
  { icon: "", label: "All Entries", to: "/entries" },
  { icon: "", label: "Guidelines", to: "/guidelines" },
];

export const NavSection = ({ compact }: { compact: boolean }) => {
  return compact ? (
    <CompactMenu items={navigationItem} />
  ) : (
    <NavLinksList>
      {navigationItem.map(({ label, to }) => (
        <li key={label}>
          <NavLink to={to}>{label === "Home" ? "Rosette" : label}</NavLink>
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
