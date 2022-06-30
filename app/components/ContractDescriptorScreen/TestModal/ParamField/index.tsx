import { Field } from "@blossom-labs/rosette-ui";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { buildTestingParamKey } from "../../use-contract-descriptor-store";
import type { actions } from "../../use-contract-descriptor-store";
import { BooleanParamField } from "./BooleanParamField";
import { NumericParamField } from "./NumericParamField";
import { TextParamField } from "./TextParamField";

export type ParamFieldProps = {
  children?: ReactNode;
  name: string;
  type: string;
  value: any;
  decimals?: number;
  onChange: typeof actions.upsertFnTestingParam;
  sigHash: string;
  errorMsg?: string;
};

export type TypedParamFieldProps = Pick<
  ParamFieldProps,
  "children" | "name" | "type" | "value" | "decimals"
> & {
  error?: boolean;
  onChange(value: any, decimals?: number): void;
};

const TypedParamField = (props: TypedParamFieldProps) => {
  const type = props.type;

  if (type === "string" || type === "bytes") {
    return <TextParamField {...props} />;
  }

  if (["uint", "int"].filter((t) => type.includes(t)).length) {
    return <NumericParamField {...props} />;
  }

  if (type === "bool") {
    return <BooleanParamField {...props} />;
  }

  return <TextParamField {...props} />;
};

export const ParamField = (props: ParamFieldProps) => {
  const { name, sigHash, onChange, type, errorMsg } = props;

  const handleInputChange = useCallback(
    (newValue, decimals) =>
      onChange(sigHash, buildTestingParamKey(name, type), {
        value: newValue,
        decimals,
      }),
    [sigHash, name, type, onChange]
  );

  return (
    <Field label={`${name}(${type})`} error={!!errorMsg} helperText={errorMsg}>
      <TypedParamField
        {...{ ...props, error: !!errorMsg, onChange: handleInputChange }}
      />
    </Field>
  );
};
