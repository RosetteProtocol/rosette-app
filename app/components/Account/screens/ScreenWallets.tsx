import { ButtonBase, GU, Link, RADIUS, textStyle } from "@1hive/1hive-ui";
import styled from "styled-components";
import { Connector } from "wagmi";
import { getWalletIconPath } from "../wallet-icons";

type ScreenWalletsProps = {
  wallets: Connector[];
  onClick: (wallet: Connector) => void;
};

export const ScreenWallets = ({ wallets, onClick }: ScreenWalletsProps) => {
  return (
    <div>
      <MainHeader>Ethereum Wallets</MainHeader>
      <Container>
        <WalletButtonsContainer>
          {wallets.map((wallet) => (
            <WalletButton
              key={wallet.id}
              icon={getWalletIconPath(wallet.id)}
              name={wallet.name}
              ready={wallet.ready}
              onClick={() => onClick(wallet)}
            />
          ))}
        </WalletButtonsContainer>
        <LinkContainer>
          <Link href="https://ethereum.org/wallets/" external>
            What is a wallet?
          </Link>
        </LinkContainer>
      </Container>
    </div>
  );
};

type WalletButtonProps = {
  icon?: string;
  name?: string;
  ready?: boolean;
  onClick: (connector: Connector) => void;
};

function WalletButton({
  icon,
  name,
  ready = true,
  onClick,
}: WalletButtonProps): JSX.Element {
  return (
    <WalletButtonBase onClick={onClick} disabled={!ready} ready={ready}>
      {name && (
        <>
          {icon && (
            <img style={{ height: `${5.25 * GU}px` }} src={icon} alt="" />
          )}
          <WalletName>{name}</WalletName>
          {!ready && <Subtitle>(Unsupported)</Subtitle>}
        </>
      )}
    </WalletButtonBase>
  );
}

const MainHeader = styled.h4`
  padding-top: ${2 * GU}px;
  padding-left: ${2 * GU}px;
  color: ${(props) => props.theme.contentSecondary};
  margin-bottom: ${2 * GU}px;
  ${textStyle("label2")};
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: ${2 * GU}px ${2 * GU}px 0;
`;

const WalletButtonsContainer = styled.div`
  display: grid;
  grid-gap: ${1.5 * GU}px;
  grid-auto-flow: row;
  grid-template-columns: repeat(2, 1fr);
`;

const LinkContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${2 * GU}px;
  margin-bottom: ${1 * GU}px;
`;

const WalletButtonBase = styled(ButtonBase)`
  position: relative;
  opacity: ${(props) => (props.ready ? 1 : 0.6)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${12 * GU}px;
  background: ${(props) => props.surface};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
  border-radius: ${RADIUS}px;
  &:active {
    top: 1px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const WalletName = styled.div`
  margin-top: ${1 * GU}px;
  ${textStyle("body1")};
`;

const Subtitle = styled.div`
  margin-top: ${-0.5 * GU}px;
  ${textStyle("body4")};
`;