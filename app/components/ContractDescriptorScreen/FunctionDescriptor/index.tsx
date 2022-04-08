import { Button, textStyle, GU } from "@1hive/1hive-ui";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useDebounce } from "~/hooks/useDebounce";
import { FnDescriptionStatus, UserFnDescription } from "~/types";
import { getFnEntryStatusIconData } from "~/utils/client/icons.client";
import type { Function } from "../use-contract-descriptor-store";
import { DescriptionField } from "./DescriptionField";

type FunctionDescriptorProps = {
  fnDescriptorEntry: Function;
  onEntryChange(userFnDescription: UserFnDescription): void;
  isCompleted?: boolean;
};

export const FunctionDescriptor = ({
  fnDescriptorEntry,
  onEntryChange,
}: FunctionDescriptorProps) => {
  const entry = fnDescriptorEntry.entry;
  const { notice, status } = entry || {};
  const [description, setDescription] = useState<string>();
  const debouncedDescription = useDebounce<string | undefined>(
    description,
    350
  );
  const descriptorStatus =
    status ||
    (debouncedDescription
      ? FnDescriptionStatus.Added
      : FnDescriptionStatus.Available);

  useEffect(() => {
    if (debouncedDescription !== undefined) {
      onEntryChange({
        sigHash: fnDescriptorEntry.sigHash,
        minimalName: fnDescriptorEntry.minimalName,
        description: debouncedDescription,
      });
    }
  }, [
    fnDescriptorEntry.sigHash,
    fnDescriptorEntry.minimalName,
    debouncedDescription,
    onEntryChange,
  ]);

  return (
    <Container>
      <DescriptorHeader>
        Description
        <StatusLabel status={descriptorStatus} />
      </DescriptorHeader>
      <DescriptionField
        height={`${23.5 * GU}px`}
        value={notice || description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={!!notice}
      />
      <div style={{ margin: `${2 * GU}px 0` }}>
        {fnDescriptorEntry.fullName}
      </div>
      <Button
        label="Test function"
        wide
        onClick={() => {}}
        disabled={!(notice || description)}
      />
    </Container>
  );
};

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
