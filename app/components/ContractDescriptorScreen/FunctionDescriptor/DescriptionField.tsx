import { GU, RADIUS, textStyle } from "@blossom-labs/rosette-ui";
import { forwardRef, useEffect, useState } from "react";
import type { FocusEventHandler, KeyboardEventHandler } from "react";
import styled from "styled-components";
import { useDebounce } from "~/hooks/useDebounce";

type DescriptionFieldProps = {
  description?: string;
  disabled?: boolean;
  height?: string;
  placeholder?: string;
  textSize?: string;
  onChange(value: string): void;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
};

export const DescriptionField = forwardRef<
  HTMLTextAreaElement,
  DescriptionFieldProps
>(
  (
    {
      description,
      disabled = false,
      height = `${10 * GU}px`,
      textSize = "title4",
      placeholder = "Add description…",
      onChange,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState<string | undefined>(description);
    const debouncedValue = useDebounce(value, 400);

    useEffect(() => {
      if (debouncedValue !== undefined) {
        onChange(debouncedValue);
      }
    }, [debouncedValue, onChange]);

    /**
     * Keep inner description value in sync as it can be updated from other places
     * of the component tree (e.g. adding a function from the picker)
     */
    useEffect(() => {
      setValue(description);
    }, [description]);

    return (
      <DescriptionTextArea
        tabIndex={-1}
        ref={ref}
        height={height}
        textSize={textSize}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        {...props}
      />
    );
  }
);

DescriptionField.displayName = "DescriptionField";

const DescriptionTextArea = styled.textarea<{
  height: string;
  textSize: string;
}>`
  height: ${(props) => props.height};
  padding: ${1 * GU}px ${1.5 * GU}px;
  background: ${(props) => props.theme.surface.alpha(0.5)};
  color: ${(props) => props.theme.contentSecondary};
  appearance: none;
  border-radius: ${RADIUS}px;
  width: 100%;
  outline: none;
  resize: none;
  ${(props) => textStyle(props.textSize)};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.focus};
  }
  &:read-only {
    color: ${(props) => props.theme.hint};
    border-color: ${(props) => props.theme.borderDark};
  }
  &::placeholder {
    color: ${(props) => props.theme.border};
    opacity: 0.5;
  }
  &:invalid {
    box-shadow: none;
  }

  // TODO: Check with Paulo how the following styles render to check if we need to update the colors
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
