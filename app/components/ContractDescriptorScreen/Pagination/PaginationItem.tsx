import { ButtonBase, RADIUS, textStyle } from "@blossom-labs/rosette-ui";
import { useCallback } from "react";
import styled from "styled-components";

type Direction = "horizontal" | "vertical";

type PaginationItemProps = {
  direction?: Direction;
  index: number;
  selected: boolean;
  size: number;
  onChange(index: number): void;
};

export const PaginationItem = ({
  direction = "horizontal",
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
  background: ${({ theme }) => theme.content};
`;

const StyledButtonBase = styled(ButtonBase)<{
  selected: boolean;
}>`
  border-radius: ${RADIUS}px;
  ${({ selected, theme, size }) => `
    width: ${size}px;
    height: ${size}px;
    color: ${theme.border};
    ${textStyle("title3")};
    ${
      selected &&
      `
        && {
          color: ${theme.content};
        }
      `
    };
  `}
`;
