import { IconEllipsis } from "@1hive/1hive-ui";
import { memo } from "react";
import styled from "styled-components";

export const PaginationSeparator = memo(function PaginationSeparator({
  isHorizontal = true,
}: {
  isHorizontal: boolean;
}) {
  return (
    <Container isHorizontal={isHorizontal}>
      <StyledIconEllipsis />
    </Container>
  );
});

const Container = styled.div<{ isHorizontal: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(${({ isHorizontal }) => (isHorizontal ? 0 : "90deg")});
`;

const StyledIconEllipsis = styled(IconEllipsis)`
  color: ${({ theme }) => theme.surfaceContentSecondary.alpha(0.4)};
`;
