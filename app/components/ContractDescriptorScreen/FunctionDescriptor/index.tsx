import { Button, GU } from "@1hive/1hive-ui";
import { forwardRef, memo, useCallback } from "react";
import type { FocusEventHandler, KeyboardEventHandler } from "react";
import styled from "styled-components";
import { StatusLabel } from "~/components/StatusLabel";
import { FnDescriptionStatus } from "~/types";
import { actions } from "../use-contract-descriptor-store";
import type { Function } from "../use-contract-descriptor-store";
import { DescriptionField } from "./DescriptionField";
import { canTab, getSelectionRange } from "~/utils/client/selection.client";

type FunctionDescriptorProps = {
  fnDescriptorEntry: Function;
  description?: string;
  onEntryChange(sigHash: string, description: string): void;
};

export const FunctionDescriptor = memo(
  forwardRef<HTMLTextAreaElement, FunctionDescriptorProps>(
    ({ fnDescriptorEntry, description, onEntryChange, ...props }, ref) => {
      const entry = fnDescriptorEntry.entry;
      const { notice, status } = entry || {};
      const descriptorStatus = status || FnDescriptionStatus.Available;

      const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        const textArea = e.target as HTMLTextAreaElement;
        const text = textArea.value;
        const offset = textArea.selectionStart;

        if (e.code === "Tab" && text && canTab(text, offset)) {
          e.preventDefault();
          const [start, end] = getSelectionRange(text, offset);

          textArea.setSelectionRange(start, end);
        }
      };

      const handleBlur: FocusEventHandler<HTMLTextAreaElement> = (e) => {
        actions.lastCaretPos(e.target.selectionStart);
      };

      /**
       * Need to wrap handler on callback to make helper function use logic
       * work.
       */
      const handleOnChange = useCallback(
        (value) => {
          onEntryChange(fnDescriptorEntry.sigHash, value);
        },
        [onEntryChange, fnDescriptorEntry.sigHash]
      );

      return (
        <Container>
          <DescriptorHeader>
            Description
            <StatusLabel status={descriptorStatus} />
          </DescriptorHeader>
          <DescriptionField
            ref={ref}
            height={`${23.5 * GU}px`}
            description={notice ?? description}
            onChange={handleOnChange}
            disabled={!!notice}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            {...props}
          />
          <div style={{ margin: `${2 * GU}px 0` }}>
            {fnDescriptorEntry.fullName}
          </div>
          <Button
            label="Test function"
            wide
            // TODO: implement test functionality
            onClick={() => {}}
            disabled={!(notice || description)}
          />
        </Container>
      );
    }
  )
);

FunctionDescriptor.displayName = "FunctionDescriptor";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DescriptorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${1 * GU}px;
`;
