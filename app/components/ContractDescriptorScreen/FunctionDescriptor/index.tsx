import { Button, GU } from "@1hive/1hive-ui";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { StatusLabel } from "~/components/StatusLabel";
import { useDebounce } from "~/hooks/useDebounce";
import type { UserFnDescription } from "~/types";
import { FnDescriptionStatus } from "~/types";
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DescriptorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${1 * GU}px;
`;
