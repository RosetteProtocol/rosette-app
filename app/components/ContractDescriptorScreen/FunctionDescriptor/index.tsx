import {
  Button,
  Modal,
  GU,
  Field,
  TextInput,
  Header,
  textStyle,
  addressesEqual,
} from "@blossom-labs/rosette-ui";
import { forwardRef, memo, useCallback, useState } from "react";
import type {
  FocusEventHandler,
  KeyboardEventHandler,
  ChangeEvent,
} from "react";
import styled from "styled-components";
import { StatusLabel } from "~/components/StatusLabel";
import { FnDescriptionStatus } from "~/types";
import { actions } from "../use-contract-descriptor-store";
import type { Function } from "../use-contract-descriptor-store";
import { DescriptionField } from "./DescriptionField";
import { canTab, getSelectionRange } from "~/utils/client/selection.client";
import { useAccount } from "wagmi";

type FunctionDescriptorProps = {
  fnDescriptorEntry: Function;
  description?: string;
  onEntryChange(sigHash: string, description: string): void;
};

export const FunctionDescriptor = memo(
  forwardRef<HTMLTextAreaElement, FunctionDescriptorProps>(
    ({ fnDescriptorEntry, description, onEntryChange, ...props }, ref) => {
      const [{ data: accountData }] = useAccount();
      const [showModal, setShowModal] = useState(false);
      const [callData, setCallData] = useState("");
      const entry = fnDescriptorEntry.entry;
      const { notice, status, submitter } = entry || {};
      const descriptorStatus = status || FnDescriptionStatus.Available;
      const disableDescriptionField =
        !!submitter && !addressesEqual(submitter, accountData?.address ?? "");

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

      const handleTestModal = () => {
        setShowModal(true);
      };

      const handleDescribeCalldata = () => {};

      return (
        <Container>
          <DescriptorHeader>
            Description
            <StatusLabel status={descriptorStatus} />
          </DescriptorHeader>
          <DescriptionField
            ref={ref}
            height={`${23.5 * GU}px`}
            description={description ?? notice}
            onChange={handleOnChange}
            disabled={disableDescriptionField}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            {...props}
          />
          <DescriptorEntry>
            {fnDescriptorEntry.fullName.split(" returns (")[0]}
          </DescriptorEntry>
          <Button
            label="Test function"
            wide
            onClick={handleTestModal}
            disabled={!(notice || description)}
          />
          <Modal visible={showModal} onClose={() => setShowModal(false)}>
            <Header primary="Test function" />
            <Field label="Calldata">
              <TextInput
                value={callData}
                placeholder="0x…"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setCallData(e.target.value);
                }}
                size="medium"
                wide
              />
            </Field>
            <Button
              label="Test"
              wide
              onClick={handleDescribeCalldata}
              mode="strong"
            />
          </Modal>
        </Container>
      );
    }
  )
);

FunctionDescriptor.displayName = "FunctionDescriptor";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const DescriptorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${1 * GU}px;
  color: ${({ theme }) => theme.content};
  ${textStyle("body2")};
`;

const DescriptorEntry = styled.div`
  margin: ${2 * GU}px 0;
  word-break: break-word;
  color: ${({ theme }) => theme.content};
  ${textStyle("title4")};
`;
