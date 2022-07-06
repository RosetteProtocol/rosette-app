import {
  IconCheck,
  GU,
  Button,
  useTheme,
  IconCross,
} from "@blossom-labs/rosette-ui";
import styled from "styled-components";
import { FnDescriptionStatus } from "~/types";
import { useContractDescriptorStore } from "./use-contract-descriptor-store";
import { actions } from "./use-contract-descriptor-store";

type FilterButtonProps = {
  label: string;
  active?: boolean;
  onClick(): void;
};

const { Added, Available, Challenged, Pending } = FnDescriptionStatus;

const { toggleFilter } = actions;

const FilterButton = ({
  label,
  active = false,
  onClick,
}: FilterButtonProps) => {
  const theme = useTheme();

  return (
    <ChipButton
      size="small"
      icon={
        active ? (
          <IconCheck color={theme.positive} />
        ) : (
          <IconCross color={theme.negative} />
        )
      }
      label={label}
      active={active}
      onClick={onClick}
    />
  );
};

const ChipButton = styled(Button)<{ active: boolean }>`
  border-radius: 50px;

  &:focus:after {
    border-radius: 50px;
  }
`;

export const FunctionDescriptorFilters = ({
  compactMode,
}: {
  compactMode: boolean;
}) => {
  const { filters } = useContractDescriptorStore();
  const { added, available, challenged, pending } = filters;

  return (
    <Container compactMode={compactMode}>
      <FlexContainer>
        <div style={{ whiteSpace: "nowrap" }}>Show functions:</div>
        <FilterButton
          label="Available"
          active={available}
          onClick={() => toggleFilter(Available)}
        />
        <FilterButton
          label="Added"
          active={added}
          onClick={() => toggleFilter(Added)}
        />
        <FilterButton
          label="Challenged"
          active={challenged}
          onClick={() => toggleFilter(Challenged)}
        />
        <FilterButton
          label="Pending"
          active={pending}
          onClick={() => toggleFilter(Pending)}
        />
      </FlexContainer>
    </Container>
  );
};

const Container = styled.div<{ compactMode: boolean }>`
  overflow: hidden;
  max-width: 100vw;
  overflow-x: auto;
  padding: ${2 * GU}px;

  &::-webkit-scrollbar {
    display: none;
  }

  /* -webkit-mask-size: 32px; */
  --mask-width: 30px;
  --mask-image-content: linear-gradient(
    to right,
    transparent,
    black var(--mask-width),
    black calc(100% - var(--mask-width)),
    transparent
  );

  padding-left: var(--mask-width);
  mask-image: var(--mask-image-content);
`;
const FlexContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${1 * GU}px;
  /* width: 100%; */
`;
