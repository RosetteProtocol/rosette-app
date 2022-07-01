import { Field, GU } from "@blossom-labs/rosette-ui";
import { useCallback } from "react";
import type { ReactNode } from "react";
import type { ParamValues } from "~/utils/client/param-value.client";
import { buildTestingParamKey } from "../../use-contract-descriptor-store";
import type { actions } from "../../use-contract-descriptor-store";
import { BooleanParamField } from "./BooleanParamField";
import { NumericParamField } from "./NumericParamField";
import { TextParamField } from "./TextParamField";

export type ParamFieldProps = {
  children?: ReactNode;
  name: string;
  type: string;
  value: ParamValues | ParamValues[];
  onChange: typeof actions.upsertFnTestingParam;
  sigHash: string;
  error?: string | string[];
};

export type TypedParamFieldProps = Pick<
  ParamFieldProps,
  "children" | "type"
> & {
  value: any;
  decimals?: any;
  error?: boolean;
  index?: number;
  onChange(value: any, decimals?: number, index?: number): void;
};

const TypedParamField = ({
  type,
  value,
  decimals,
  index,
  error,
  onChange,
}: TypedParamFieldProps) => {
  if (["address", "bytes", "string"].filter((t) => type.includes(t)).length) {
    return (
      <TextParamField
        index={index}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (["uint", "int"].filter((t) => type.includes(t)).length) {
    return (
      <NumericParamField
        index={index}
        decimals={decimals}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (type.includes("bool")) {
    return <BooleanParamField value={value} onChange={onChange} />;
  }

  return (
    <TextParamField
      index={index}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
};

export const ParamField = ({
  name,
  sigHash,
  onChange,
  type,
  value,
  error,
}: ParamFieldProps) => {
  const isArray = Array.isArray(value);

  const handleInputChange = useCallback(
    (newValue, decimals, index) =>
      onChange(
        sigHash,
        buildTestingParamKey(name, type),
        {
          value: newValue,
          decimals,
        },
        index
      ),
    [sigHash, name, type, onChange]
  );

  return (
    <Field
      label={`${name}(${type})`}
      error={!!error}
      helperText={isArray ? "" : error}
    >
      {Array.isArray(value) ? (
        value.map((p, index) => {
          const err = error ? error[index] : undefined;

          return (
            <Field
              key={`${name}-${index}`}
              label=""
              style={{ marginTop: -(index > 0 ? 3 : 1) * GU }}
              error={!!err}
              helperText={err}
            >
              <TypedParamField
                type={type}
                value={p.value}
                decimals={p.decimals}
                index={index}
                onChange={handleInputChange}
                error={!!err}
              />
            </Field>
          );
        })
      ) : (
        <TypedParamField
          type={type}
          value={value.value}
          decimals={value.decimals}
          error={!!error}
          onChange={handleInputChange}
        />
      )}
    </Field>
  );
};
