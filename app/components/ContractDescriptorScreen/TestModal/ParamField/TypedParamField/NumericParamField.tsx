import { GU, TextInput, textStyle } from "@blossom-labs/rosette-ui";
import { useEffect, useState } from "react";
import type { ChangeEventHandler } from "react";
import styled from "styled-components";
import { useDebounce } from "~/hooks/useDebounce";
import { DEBOUNCE_TIME } from "~/utils/client/utils.client";
import type { SpecificTypedParamFieldProps } from ".";

type NumericInputProps = {
  error?: boolean;
  value: string | number;
  onChange(value: any): void;
  placeholder?: string;
  wide?: boolean;
};

type NumericParamFieldProps = SpecificTypedParamFieldProps<{
  decimals?: number;
  value: any;
  error?: boolean;
}>;

const NumericInput = ({
  value,
  onChange,
  error,
  ...props
}: NumericInputProps) => {
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    const _value = Number(value);
    if (!value.length || (!isNaN(_value) && _value >= 0)) {
      onChange(value);
    }
  };

  return (
    <TextInput
      value={value}
      onChange={handleInputChange}
      error={error}
      {...props}
    />
  );
};

export const NumericParamField = ({
  decimals,
  value,
  nestingPos,
  onChange,
  error,
}: NumericParamFieldProps) => {
  const [decimalValue_, setDecimalValue_] = useState(decimals ?? 0);
  const [value_, setValue_] = useState(value);
  const debouncedValue = useDebounce(value_, DEBOUNCE_TIME);
  const debouncedDecimalValue = useDebounce(decimalValue_, DEBOUNCE_TIME);

  /**
   * Keep inner value in sync as it can be updated from other places of
   * the component tree (e.g filling fields from a fetched transaction)
   */
  useEffect(() => {
    setValue_(value);
  }, [value]);

  useEffect(() => {
    if (!decimals) {
      return;
    }

    setDecimalValue_(decimals);
  }, [decimals]);

  useEffect(() => {
    onChange(nestingPos, debouncedValue, Number(debouncedDecimalValue));
  }, [debouncedValue, debouncedDecimalValue, nestingPos, onChange]);

  return (
    <InlineContainer>
      <div style={{ width: "80%" }}>
        <NumericInput value={value_} onChange={setValue_} error={error} wide />
      </div>
      <div
        style={{
          position: "relative",
          width: "20%",
        }}
      >
        <DecimalsWrapper error={error}>Decimals</DecimalsWrapper>
        <NumericInput
          value={decimalValue_}
          onChange={setDecimalValue_}
          error={error}
          wide
        />
      </div>
    </InlineContainer>
  );
};

const InlineContainer = styled.div`
  display: flex;
  gap: ${2 * GU}px;
  width: 100%;
`;

const DecimalsWrapper = styled.div<{ error?: boolean }>`
  position: absolute;
  top: -20px;
  right: 0;
  color: ${({ theme, error }) =>
    error ? theme.negative : theme.surfaceContent};
  ${textStyle("body4")};
`;
