import { textStyle, GU } from "@blossom-labs/rosette-ui";
import styled from "styled-components";
import { FnDescriptionStatus } from "~/types";
import { getFnEntryStatusIconData } from "~/utils/client/icons.client";

export const StatusLabel = ({ status }: { status: FnDescriptionStatus }) => {
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
  color: ${({ theme }) => theme.content};

  div:first-child {
    display: flex;
    height: 100%;
    align-items: center;
    color: ${({ theme }) => theme.content};
    background-color: ${({ color }) => color};
    margin-right: ${1 * GU}px;
  }
`;
