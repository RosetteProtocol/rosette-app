import { ButtonBase, GU, IconMenu, useViewport } from "@1hive/1hive-ui";
import { useState } from "react";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";

const MenuButton = ({ onClick }: { onClick(): void }) => (
  <ButtonContainer>
    <ButtonBase
      onClick={onClick}
      css={`
        display: flex;
        align-items: center;
      `}
    >
      <StyledMenuIcon color="grey" />
    </ButtonBase>
  </ButtonContainer>
);

export const CompactMenu = () => {
  const { width } = useViewport();
  const [displaySidebar, setDisplaySidebar] = useState(false);

  const toggleSidebar = () => setDisplaySidebar((prev) => !prev);

  return (
    <div>
      <MenuButton onClick={toggleSidebar} />
      <Sidebar
        width={width - 20 * GU}
        show={displaySidebar}
        onToggle={toggleSidebar}
      ></Sidebar>
    </div>
  );
};

const ButtonContainer = styled.div`
  width: ${8 * GU}px;
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-self: stretch;
  justify-content: center;
  align-items: center;
`;

const StyledMenuIcon = styled(IconMenu)`
  width: ${4 * GU}px;
  height: ${4 * GU}px;
`;
