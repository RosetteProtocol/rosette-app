import type { ParamFieldProps } from "..";
import { BooleanParamField } from "./BooleanParamField";
import { NumericParamField } from "./NumericParamField";
import { TextParamField } from "./TextParamField";

type TypedParamFieldProps = Pick<ParamFieldProps, "nestingPos" | "onChange"> & {
  type: string;
  value: any;
  decimals?: any;
  error?: boolean;
};

export type SpecificTypedParamFieldProps<T> = Pick<
  TypedParamFieldProps,
  "nestingPos" | "onChange"
> &
  T;

export const TypedParamField = ({
  type,
  value,
  decimals,
  nestingPos,
  error,
  onChange,
}: TypedParamFieldProps) => {
  if (["address", "bytes", "string"].filter((t) => type.includes(t)).length) {
    return (
      <TextParamField
        nestingPos={nestingPos}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (["uint", "int"].filter((t) => type.includes(t)).length) {
    return (
      <NumericParamField
        nestingPos={nestingPos}
        decimals={decimals}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (type.includes("bool")) {
    return (
      <BooleanParamField
        nestingPos={nestingPos}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <TextParamField
      nestingPos={nestingPos}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
};
