import { IconEllipsis } from "@1hive/1hive-ui";
import { memo } from "react";
import styled from "styled-components";

type PaginationSeparatorProps = {
  isHorizontal?: boolean;
  size: number;
};

export const PaginationSeparator = memo(function PaginationSeparator({
  isHorizontal = false,
  size,
}: PaginationSeparatorProps) {
  return (
    <Container isHorizontal={isHorizontal} size={size}>
      <StyledIconEllipsis />
    </Container>
  );
});

const Container = styled.div<{ isHorizontal: boolean; size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ size }) => `
    width: ${size}px;
    height: ${size}px;
  `};
  transform: rotate(${({ isHorizontal }) => (isHorizontal ? 0 : "90deg")});
`;

const StyledIconEllipsis = styled(IconEllipsis)`
  color: ${({ theme }) => theme.surfaceContentSecondary.alpha(0.4)};
`;
