import { Button, textStyle, IdentityBadge, GU } from "@1hive/1hive-ui";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useDebounce } from "~/hooks/useDebounce";
import type { Function } from "../use-contract-descriptor-store";
import { DescriptionField } from "./DescriptionField";

type FunctionDescriptorProps = {
  fnDescriptorEntry: Function;
  onEntryChange(sigHash: string, description: string): void;
  isCompleted?: boolean;
};

export const FunctionDescriptor = ({
  fnDescriptorEntry,
  onEntryChange,
}: FunctionDescriptorProps) => {
  const entry = fnDescriptorEntry.entry;
  const isCompleted = !!entry;
  const { notice, submitter } = entry || {};
  const [description, setDescription] = useState<string>();
  const debouncedDescription = useDebounce<string | undefined>(
    description,
    350
  );

  useEffect(() => {
    if (debouncedDescription !== undefined) {
      onEntryChange(fnDescriptorEntry.sigHash, debouncedDescription);
    }
  }, [fnDescriptorEntry.sigHash, debouncedDescription, onEntryChange]);

  return (
    <div>
      <DescriptionField
        height={`${23.5 * GU}px`}
        value={notice || description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {isCompleted && (
        <InfoSection>
          <div>
            <strong>Submitter:</strong>
            <IdentityBadge entity={submitter} />
          </div>
          <Button label="Dispute" />
        </InfoSection>
      )}
      <div style={{ marginBottom: 2 * GU }}>{fnDescriptorEntry.fullName}</div>
      <Button label="Test function" wide onClick={() => {}} />
    </div>
  );
};

const InfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin: ${-2.8 * GU}px 0 ${3.5 * GU}px 0;
  align-items: center;
  ${textStyle("body2")};

  div:first-child {
    display: flex;
    gap: 2 * GU;
  }
`;
