import { ButtonBase, RADIUS, textStyle } from "@1hive/1hive-ui";
import { useCallback } from "react";
import styled from "styled-components";

type Direction = "horizontal" | "vertical";

type PaginationItemProps = {
  direction?: Direction;
  index: number;
  selected: boolean;
  size: number;
  touchMode: boolean;
  onChange(index: number): void;
};

export const PaginationItem = ({
  direction = "horizontal",
  touchMode,
  selected,
  size,
  index,
  onChange,
}: PaginationItemProps) => {
  const handleClick = useCallback(() => {
    onChange(index);
  }, [index, onChange]);

  return (
    <div style={{ position: "relative" }}>
      {selected && <Dot direction={direction} />}
      <StyledButtonBase
        onClick={handleClick}
        focusRingRadius={RADIUS}
        disabled={selected}
        touchMode={touchMode}
        selected={selected}
        size={size}
      >
        <span>{index + 1}</span>
      </StyledButtonBase>
    </div>
  );
};

const Dot = styled.div<{ direction: Direction }>`
  width: 3px;
  height: 3px;
  position: absolute;
  ${({ direction }) =>
    direction === "horizontal"
      ? `
      bottom: calc(-20%);
      left: calc(50% - 2px);
  `
      : `
      top: calc(50% - 1px);
      left: calc(-10%);
  `};
  background: ${({ theme }) => theme.accentContent};
`;

const StyledButtonBase = styled(ButtonBase)<{
  selected: boolean;
  touchMode: boolean;
}>`
  border-radius: ${RADIUS}px;
  ${({ selected, theme, touchMode, size }) => `
    width: ${size}px;
    height: ${size}px;
    color: ${theme.surfaceContent};
    ${textStyle(touchMode ? "body1" : "title2")};

    &:active {
      background: ${theme.surfacePressed};
    }
    ${
      selected &&
      `
        && {
          color: ${theme.accentContent};
        }
      `
    };
  `}
`;
