import {
  Button,
  ButtonBase,
  GU,
  IconCheck,
  IconCopy,
  IdentityBadge,
  RADIUS,
  textStyle,
  useTheme,
} from "@1hive/1hive-ui";
import { useCallback } from "react";
import styled from "styled-components";
import { Chain, Connector } from "wagmi";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { getWalletIconPath } from "../wallet-icons";

type ScreenConnectedProps = {
  account: string;
  chain: Chain;
  wallet: Connector;
  onDisconnect: () => void;
};

export const ScreenConnected = ({
  account,
  chain,
  wallet,
  onDisconnect,
}: ScreenConnectedProps) => {
  const theme = useTheme();
  const copy = useCopyToClipboard();

  const handleCopyAddress = useCallback(() => copy(account), [account, copy]);

  return (
    <div
      style={{
        padding: 2 * GU,
      }}
    >
      <Title>Active Wallet</Title>
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            marginRight: 3 * GU,
          }}
        >
          <WalletIcon src={getWalletIconPath(wallet.id)} alt="" size={3 * GU} />
          <span>{wallet.id === "unknown" ? "Wallet" : wallet.name}</span>
        </div>
        <div style={{ width: "100%" }}>
          <CopyButton onClick={handleCopyAddress} focusRingRadius={RADIUS}>
            <IdentityBadge
              entity={account}
              compact
              badgeOnly
              style={{ cursor: "pointer" }}
            />
            <IconCopy style={{ verticalAlign: "middle" }} color={theme.hint} />
          </CopyButton>
        </div>
      </div>
      {chain.name && (
        <div style={{ padding: `${2 * GU}px 0` }}>
          <NetworkInfo>
            <IconCheck size="small" />
            <span style={{ marginLeft: 0.5 * GU }}>
              {`Connected to ${chain.name} Network`}
            </span>
          </NetworkInfo>
        </div>
      )}
      <Button onClick={onDisconnect} wide style={{ marginTop: 1 * GU }}>
        Disconnect wallet
      </Button>
    </div>
  );
};

const Title = styled.h4`
  color: ${(props) => props.theme.contentSecondary};
  margin-bottom: ${2 * GU}px, ${textStyle("label2")};
  ${textStyle("label2")};
`;

const WalletIcon = styled.img<{ size: string | number }>`
  ${({ size }) => size && `width: ${size}px; height: ${size}px;`};
  margin-right: ${0.5 * GU}px;
  transform: translateY(-2px);
`;

const CopyButton = styled(ButtonBase)`
  display: flex;
  align-items: center;
  justify-self: flex-end;
  padding: ${0.5 * GU}px;
  &:active {
    background: ${(props) => props.theme.surfacePressed};
  }
`;

const NetworkInfo = styled.div`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.positive};
  ${textStyle("label2")};
`;
