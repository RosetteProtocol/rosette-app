import {
  GU,
  ButtonIcon,
  IconDown,
  IconUp,
  IconRight,
  IconLeft,
} from "@1hive/1hive-ui";
import styled from "styled-components";

type PrevNextProps = {
  isHorizontal?: boolean;
  type: "next" | "previous";
  onClick: () => void;
};
export const PrevNext = ({
  isHorizontal = true,
  type,
  onClick,
}: PrevNextProps) => {
  const NextIcon = isHorizontal ? IconRight : IconDown;
  const PrevIcon = isHorizontal ? IconLeft : IconUp;
  const next = type === "next";
  const Icon = next ? NextIcon : PrevIcon;

  return (
    <Container next={next} isHorizontal={isHorizontal}>
      <ButtonIcon onClick={onClick} label={next ? "Next" : "Previous"}>
        <Icon size="large" />
      </ButtonIcon>
    </Container>
  );
};

const Container = styled.div<{ isHorizontal: boolean; next: boolean }>`
  position: absolute;
  z-index: 1;
  ${({ isHorizontal, next }) =>
    isHorizontal
      ? `
    top: calc(50% - ${5 * GU}px);
    ${next ? "right" : "left"}: ${0.5 * GU}px;
  `
      : `
    top: calc(${next ? `100% - ${5 * GU}px` : "0"});
    left: 50%;
  `};
  color: ${({ theme }) => theme.surfaceContentSecondary};
  height: ${6 * GU}px;
`;
