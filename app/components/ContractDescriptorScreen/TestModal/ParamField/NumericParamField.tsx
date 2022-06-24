import { GU, TextInput, textStyle } from "@blossom-labs/rosette-ui";
import { useEffect, useState } from "react";
import type { ChangeEventHandler } from "react";
import type { TypedParamFieldProps } from ".";
import styled from "styled-components";
import { useDebounce } from "~/hooks/useDebounce";

type NumericInputProps = {
  value: string | number;
  onChange(value: any): void;
  placeholder?: string;
  wide?: boolean;
};

const NumericInput = ({ value, onChange, ...props }: NumericInputProps) => {
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    const _value = Number(value);
    if (!value.length || (!isNaN(_value) && _value >= 0)) {
      onChange(value);
    }
  };

  return <TextInput value={value} onChange={handleInputChange} {...props} />;
};

export const NumericParamField = (props: TypedParamFieldProps) => {
  const { decimals, value, onChange } = props;
  const [decimalValue_, setDecimalValue_] = useState(decimals ?? "18");
  const [value_, setValue_] = useState(value);
  const debouncedValue = useDebounce(value_, 400);
  const debouncedDecimalValue = useDebounce(decimalValue_, 400);

  useEffect(() => {
    onChange(debouncedValue, Number(debouncedDecimalValue));
  }, [debouncedValue, debouncedDecimalValue, onChange]);

  return (
    <InlineContainer>
      <div style={{ width: "80%" }}>
        <NumericInput value={value_} onChange={setValue_} wide />
      </div>
      <div
        style={{
          position: "relative",
          width: "20%",
        }}
      >
        <DecimalsWrapper>Decimals</DecimalsWrapper>
        <NumericInput value={decimalValue_} onChange={setDecimalValue_} wide />
      </div>
    </InlineContainer>
  );
};

const InlineContainer = styled.div`
  display: flex;
  gap: ${2 * GU}px;
  width: 100%;
`;

const DecimalsWrapper = styled.div`
  position: absolute;
  top: -20px;
  right: 0;
  color: ${({ theme }) => theme.surfaceContent};
  ${textStyle("body4")};
`;
