import {
  Button,
  Box,
  Modal,
  GU,
  Field,
  TextInput,
  Header,
  textStyle,
  Info,
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
import { useTxDescribe } from "@blossom-labs/rosette-react";
import { constants } from "ethers";

type FunctionDescriptorProps = {
  fnDescriptorEntry: Function;
  description?: string;
  onEntryChange(sigHash: string, description: string): void;
};

export const FunctionDescriptor = memo(
  forwardRef<HTMLTextAreaElement, FunctionDescriptorProps>(
    ({ fnDescriptorEntry, description, onEntryChange, ...props }, ref) => {
      const [showModal, setShowModal] = useState(false);
      const [callData, setCallData] = useState("");
      const [testDescriptionError, setTestDescriptionError] = useState("");
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

      const handleTestModal = () => {
        setShowModal(true);
      };

      const handleDescribeCalldata = useCallback( () => {
        useTxDescribe({
          to: constants.AddressZero,
          data: callData
        })
        setTestDescriptionError()
      },[]);


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
            <Info></Info>
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
