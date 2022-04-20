import { Button, textStyle, GU } from "@1hive/1hive-ui";
import { forwardRef, useEffect, useState } from "react";
import type { KeyboardEventHandler } from "react";
import styled from "styled-components";
import { useDebounce } from "~/hooks/useDebounce";
import type { UserFnDescription } from "~/types";
import { FnDescriptionStatus } from "~/types";
import { getFnEntryStatusIconData } from "~/utils/client/icons.client";
import { actions } from "../use-contract-descriptor-store";
import type { Function } from "../use-contract-descriptor-store";
import { DescriptionField } from "./DescriptionField";

type FunctionDescriptorProps = {
  fnDescriptorEntry: Function;
  description?: string;
  onEntryChange(userFnDescription: UserFnDescription): void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  isCompleted?: boolean;
};

export const FunctionDescriptor = forwardRef<
  HTMLTextAreaElement,
  FunctionDescriptorProps
>(({ fnDescriptorEntry, description, onEntryChange, onKeyDown }, ref) => {
  const entry = fnDescriptorEntry.entry;
  const { notice, status } = entry || {};
  const [textAreaValue, setTextAreaValue] = useState<string | undefined>(
    description
  );
  const debouncedTextAreaValue = useDebounce<string | undefined>(
    textAreaValue,
    150
  );

  const descriptorStatus = status || FnDescriptionStatus.Available;

  useEffect(() => {
    if (debouncedTextAreaValue !== undefined) {
      onEntryChange({
        sigHash: fnDescriptorEntry.sigHash,
        minimalName: fnDescriptorEntry.minimalName,
        description: debouncedTextAreaValue,
      });
    }
  }, [
    fnDescriptorEntry.sigHash,
    fnDescriptorEntry.minimalName,
    onEntryChange,
    debouncedTextAreaValue,
  ]);

  useEffect(() => {
    setTextAreaValue(description);
  }, [description]);

  return (
    <Container>
      <DescriptorHeader>
        Description
        <StatusLabel status={descriptorStatus} />
      </DescriptorHeader>
      <DescriptionField
        ref={ref}
        height={`${23.5 * GU}px`}
        value={notice ?? textAreaValue}
        onChange={(e) => setTextAreaValue(e.target.value)}
        onBlur={(e) => {
          actions.lastCaretPos(e.target.selectionStart);
        }}
        onKeyDown={onKeyDown}
        disabled={!!notice}
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
});

FunctionDescriptor.displayName = "FunctionDescriptor";

const StatusLabel = ({ status }: { status: FnDescriptionStatus }) => {
  const iconData = getFnEntryStatusIconData(status);

  if (!iconData) {
    return null;
  }

  const { Icon, color } = iconData;

  return (
    <LabelContainer
      color={color}
      status={status}
      visible={status !== FnDescriptionStatus.Available}
    >
      <div>
        <Icon />
      </div>
      {status}
    </LabelContainer>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DescriptorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${1 * GU}px;
`;

const LabelContainer = styled.div<{
  status: FnDescriptionStatus;
  visible: boolean;
}>`
  display: flex;
  visibility: ${({ visible }) => (visible ? "visible" : "hidden")};
  align-items: center;
  height: 24px;
  border: 1px solid ${({ color }) => color};
  width: fit-content;
  text-transform: lowercase;
  border-radius: 4px;
  padding-right: ${1 * GU}px;
  ${textStyle("body4")};

  div:first-child {
    display: flex;
    height: 100%;
    align-items: center;
    color: ${({ theme }) => theme.content};
    background-color: ${({ color }) => color};
    margin-right: ${1 * GU}px;
  }
`;
