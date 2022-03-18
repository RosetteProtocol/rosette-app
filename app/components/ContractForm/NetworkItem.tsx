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
}: NetworkItemProps) => {
  return (
    <div>
      <NetworkImg src={icon} alt="" isTestnet={isTestnet} />
      {label}
    </div>
  );
};

const NetworkImg = styled.img<{ isTestnet: boolean }>`
  border-radius: 50%;
  width: 19px;
  height: 19px;
  vertical-align: -4px;
  margin-right: 1gu;9
  ${(props) => (props.isTestnet ? "filter: grayscale(80%);" : "")};
`;
