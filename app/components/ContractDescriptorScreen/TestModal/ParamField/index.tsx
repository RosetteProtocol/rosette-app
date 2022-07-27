import { Field } from "@blossom-labs/rosette-ui";
import type { utils } from "ethers";
import type { ReactNode } from "react";
import type { TestingParam } from "../../use-contract-descriptor-store";
import { ArrayParamField } from "./ArrayParamField";
import { TypedParamField } from "./TypedParamField";

export type ParamFieldProps = {
  children?: ReactNode;
  paramType: utils.ParamType;
  nestingPos: string;
  valueOrValues: TestingParam;
  onAdd(nestingPos: string, paramType: utils.ParamType): void;
  onRemove(nestingPos: string): void;
  onChange(nestingPos: string, value: any, decimals?: number): void;
  errors: Record<string, string>;
};

export const ParamField = (props: ParamFieldProps) => {
  const { paramType, errors, nestingPos, valueOrValues, onChange } = props;
  const { type, name } = paramType;
  const label = `${name}(${type})`;
  const isArray = Array.isArray(valueOrValues);
  const e = errors[nestingPos];

  if (isArray) {
    return (
      <ArrayParamField
        {...props}
        valueOrValues={valueOrValues}
        baseType={type.split("[")[0]}
        dimension={(type.match(/\[/g) || []).length}
      />
    );
  }

  return (
    <Field label={label} error={!!e} helperText={isArray ? "" : e}>
      <TypedParamField
        nestingPos={nestingPos}
        type={paramType.type}
        value={valueOrValues.value}
        decimals={valueOrValues.decimals}
        error={!!e}
        onChange={onChange}
      />
    </Field>
  );
};
