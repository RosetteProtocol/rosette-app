import { TextInput } from "@blossom-labs/rosette-ui";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useDebounce } from "~/hooks/useDebounce";
import type { TypedParamFieldProps } from ".";

export const TextParamField = (props: TypedParamFieldProps) => {
  const { value, onChange } = props;
  const [value_, setValue_] = useState(value);
  const debouncedValue = useDebounce(value_, 400);

  useEffect(() => {
    if (debouncedValue === undefined) {
      return;
    }
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <TextInput
      value={value_}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue_(e.target.value)}
      wide
    />
  );
};
