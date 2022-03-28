import { Button, textStyle, IdentityBadge, GU } from "@1hive/1hive-ui";
import { Fragment } from "ethers/lib/utils";
import { FocusEvent } from "react";
import styled from "styled-components";
import { getFnSelector } from "~/utils";
import { DescriptionField } from "./DescriptionField";

type Entry = { notice: string; sigHash: string; submitter: string };

type FunctionDescriptionProps = {
  fragment: Fragment;
  entry?: Entry;
  description?: string;
  onEntryChange(sigHash: string, description: string): void;
  isCompleted?: boolean;
};

export const FunctionDescription = ({
  fragment,
  entry,
  onEntryChange,
}: FunctionDescriptionProps) => {
  const isCompleted = !!entry;
  const { notice, submitter } = entry || {};

  const handleDescriptionChange = (e: FocusEvent<HTMLInputElement>) => {
    onEntryChange(getFnSelector(fragment), e.target.value);
  };

  return (
    <div>
      <DescriptionField
        height={`${23.5 * GU}px`}
        value={notice}
        onChange={handleDescriptionChange}
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
      <div style={{ marginBottom: 2 * GU }}>{fragment.format("full")}</div>
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
