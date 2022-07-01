import { TextInput } from "@blossom-labs/rosette-ui";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useDebounce } from "~/hooks/useDebounce";

type TextParamFieldProps = {
  index?: number;
  value: any;
  onChange(value: any, decimals?: number, index?: number): void;
  error?: boolean;
};

export const TextParamField = ({
  index,
  value,
  onChange,
  error,
}: TextParamFieldProps) => {
  const [value_, setValue_] = useState(value);
  const debouncedValue = useDebounce(value_, 400);

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
    onChange(debouncedValue, undefined, index);
  }, [debouncedValue, index, onChange]);

  return (
    <TextInput
      value={value_}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue_(e.target.value)}
      wide
      error={error}
    />
  );
};
