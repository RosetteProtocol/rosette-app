import { GU, IconAdd, IconRemove, textStyle } from "@blossom-labs/rosette-ui";
import type { ReactNode } from "react";
import styled from "styled-components";
import type { ParamFieldProps } from ".";
import { parseNestingPos } from "../../use-contract-descriptor-store";
import type { TestingParam } from "../../use-contract-descriptor-store";
import { TypedParamField } from "./TypedParamField";

type ArrayParamFieldProps = ParamFieldProps & {
  baseType: string;
  dimension: number;
  displayRemove?: boolean;
};

const computeArrayDimensions = (nestingPos: string, dimension: number) => {
  const indexes = parseNestingPos(nestingPos).slice(1);
  const displayedIndexes = [...Array(dimension)].map((_, i) =>
    (i < indexes.length ? indexes[i] : "x").toString()
  );

  return displayedIndexes.map((i) => `[${i}]`).join("");
};

export const ButtonWrapper = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => (
  <div
    title={title}
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

export const ArrayParamField = (
  props: ArrayParamFieldProps & { valueOrValues: TestingParam[] }
) => {
  const { nestingPos, paramType, onAdd, valueOrValues } = props;
  const { arrayChildren, arrayLength, name, type } = paramType;
  const label = `${name}(${type})`;

  return (
    <div>
      <ArrayLabel>
        <div>{label}</div>
        {/* Only add new array elements when having a dynamic array
          or remaining space on a fixed array */}
        {arrayLength === -1 || valueOrValues.length < arrayLength ? (
          <ButtonWrapper title="Add a new element">
            <ButtonIconAdd onClick={() => onAdd(nestingPos, arrayChildren)} />
          </ButtonWrapper>
        ) : null}
      </ArrayLabel>
      {valueOrValues.length ? (
        <RecursiveArrayParamField
          {...props}
          paramType={arrayChildren}
          baseType={type.split("[")[0]}
          dimension={(type.match(/\[/g) || []).length}
        />
      ) : (
        <EmptyLabel>Empty array</EmptyLabel>
      )}
    </div>
  );
};

const RecursiveArrayParamField = ({
  valueOrValues,
  nestingPos,
  baseType,
  dimension,
  paramType,
  onAdd,
  onRemove,
  onChange,
  errors,
}: ArrayParamFieldProps) => {
  const { arrayChildren, arrayLength, type } = paramType;
  const isArray = Array.isArray(valueOrValues);
  const errMsg = errors[nestingPos];

  return (
    <div>
      {isArray ? (
        valueOrValues.map((v, i) => {
          const childNestingPos = `${nestingPos}.${i}`;
          const arrayLabel = computeArrayDimensions(childNestingPos, dimension);
          const isChildArray = Array.isArray(v);
          const canAdd =
            arrayLength === -1 || (isChildArray && v.length < arrayLength);

          return (
            <div
              key={childNestingPos}
              style={{
                margin: `${1 * GU}px 0`,
                marginLeft: parseNestingPos(nestingPos).length * 0.5 * GU,
              }}
            >
              {isChildArray && (
                <ArrayLabel>
                  <div>{arrayLabel}</div>
                  {canAdd && (
                    <ButtonWrapper title="Add a new element">
                      <ButtonIconAdd
                        onClick={() => onAdd(childNestingPos, arrayChildren)}
                      />
                    </ButtonWrapper>
                  )}
                </ArrayLabel>
              )}
              <RecursiveArrayParamField
                nestingPos={childNestingPos}
                baseType={baseType}
                dimension={dimension}
                paramType={isChildArray ? arrayChildren : paramType}
                onChange={onChange}
                onAdd={onAdd}
                onRemove={onRemove}
                valueOrValues={v}
                errors={errors}
              />
            </div>
          );
        })
      ) : (
        <div style={{ marginBottom: `${2.5 * GU}px`, position: "relative" }}>
          <ArrayLabel>
            {computeArrayDimensions(nestingPos, dimension)}
          </ArrayLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 1 * GU }}>
            <TypedParamField
              nestingPos={nestingPos}
              type={type}
              value={valueOrValues.value}
              decimals={valueOrValues.decimals}
              error={!!errMsg}
              onChange={onChange}
            />
            <ButtonWrapper title="Remove element">
              <ButtonIconRemove onClick={() => onRemove(nestingPos)} />
            </ButtonWrapper>
          </div>
          {errMsg && <SubfieldError>{errMsg}</SubfieldError>}
        </div>
      )}
    </div>
  );
};

const ArrayLabel = styled.div<{ error?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5 * GU;
  position: relative;
  color: ${({ theme, error }) =>
    error ? theme.negative : theme.surfaceContentSecondary};
  ${textStyle("body3")};
  width: 100%;
  height: 100%;
`;

const SubfieldError = styled.div`
  position: absolute;
  left: 0;
  bottom: -20px;
  color: ${({ theme }) => theme.negative};
  ${textStyle("body4")};
`;

const ButtonIconAdd = styled(IconAdd)`
  cursor: pointer;
  color: ${({ theme }) => theme.positive};
`;

const ButtonIconRemove = styled(IconRemove)`
  cursor: pointer;
  color: ${({ theme }) => theme.negative};
`;

const EmptyLabel = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  color: ${({ theme }) => theme.surfaceContentSecondary.alpha(0.7)};
  margin-bottom: ${2 * GU}px;
`;
