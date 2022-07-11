import { TextInput } from "@blossom-labs/rosette-ui";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useDebounce } from "~/hooks/useDebounce";
import type { SpecificTypedParamFieldProps } from "./";
import { DEBOUNCE_TIME } from "~/utils/client/utils.client";

type TextParamFieldProps = SpecificTypedParamFieldProps<{
  value: any;
  error?: boolean;
}>;

export const TextParamField = ({
  nestingPos,
  value,
  onChange,
  error,
}: TextParamFieldProps) => {
  const [value_, setValue_] = useState(value);
  const debouncedValue = useDebounce(value_, DEBOUNCE_TIME);

  /**
   * Keep inner value in sync as it can be updated from other places of
   * the component tree (e.g filling fields from a fetched transaction)
   */
  useEffect(() => {
    setValue_(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue === undefined) {
      return;
    }
    onChange(nestingPos, debouncedValue);
  }, [debouncedValue, nestingPos, onChange]);

  return (
    <TextInput
      value={value_}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue_(e.target.value)}
      wide
      error={error}
    />
  );
};
