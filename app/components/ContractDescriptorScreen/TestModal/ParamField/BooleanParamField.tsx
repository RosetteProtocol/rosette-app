import { GU, Radio, RadioGroup } from "@blossom-labs/rosette-ui";
import styled from "styled-components";
import type { TypedParamFieldProps } from ".";

export const BooleanParamField = (props: TypedParamFieldProps) => {
  const { value, onChange } = props;
  return (
    <RadioGroup
      onChange={(value: string) => onChange(value === "true")}
      selected={value.toString()}
    >
      <BooleanWrapper>
        {["True", "False"].map((label) => (
          <BooleanLabel key={label}>
            <Radio id={label.toLowerCase()} />
            {label}
          </BooleanLabel>
        ))}
      </BooleanWrapper>
    </RadioGroup>
  );
};

const BooleanWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: ${2 * GU}px;
`;
const BooleanLabel = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.surfaceContent};
`;
