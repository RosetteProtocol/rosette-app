import { GU, RADIUS, textStyle } from "@1hive/1hive-ui";
import { forwardRef } from "react";
import type { ChangeEventHandler, FocusEventHandler } from "react";
import styled from "styled-components";

type DescriptionFieldProps = {
  value?: string;
  disabled?: boolean;
  height?: string;
  placeholder?: string;
  textSize?: string;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
};

export const DescriptionField = forwardRef<
  HTMLTextAreaElement,
  DescriptionFieldProps
>(
  (
    {
      value,
      disabled = false,
      height = `${10 * GU}px`,
      textSize = "body2",
      placeholder = "Add description…",
      ...props
    },
    ref
  ) => (
    <DescriptionTextArea
      tabIndex={-1}
      ref={ref}
      height={height}
      textSize={textSize}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  )
);

DescriptionField.displayName = "DescriptionField";

const DescriptionTextArea = styled.textarea<{
  height: string;
  textSize: string;
}>`
  height: ${(props) => props.height};
  padding: ${1 * GU}px ${1.5 * GU}px;
  background: ${(props) => props.theme.surfaceUnder};
  color: ${(props) => props.theme.surfaceContent};
  appearance: none;
  border-radius: ${RADIUS}px;
  width: 100%;
  outline: none;
  resize: none;
  ${(props) => textStyle(props.textSize)};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.selected};
  }
  &:read-only {
    color: ${(props) => props.theme.hint};
    border-color: ${(props) => props.theme.border};
  }
  &::placeholder {
    color: ${(props) => props.theme.hint};
    opacity: 0.5;
  }
  &:invalid {
    box-shadow: none;
  }

  &::-webkit-scrollbar {
    width: 12px;
    background-color: ${(props) => props.theme.surfaceSelected};
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
    background-color: ${(props) => props.theme.surfaceIcon};
  }
`;
