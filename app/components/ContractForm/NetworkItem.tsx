import { GU } from "@1hive/1hive-ui";
import styled from "styled-components";

type NetworkItemProps = {
  icon?: string;
  label: string;
  isTestnet?: boolean;
};

export const NetworkItem = ({
  icon,
  label,
  isTestnet = false,
}: NetworkItemProps) => (
  <div>
    <NetworkImg src={icon} alt="" isTestnet={isTestnet} />
    {label}
  </div>
);

const NetworkImg = styled.img<{ isTestnet: boolean }>`
  border-radius: 50%;
  width: 19px;
  height: 19px;
  vertical-align: -4px;
  margin-right: ${1 * GU}px;
  ${(props) => (props.isTestnet ? "filter: grayscale(80%);" : "")};
`;
