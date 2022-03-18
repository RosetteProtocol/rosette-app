import { Button, GU, IconConnect } from "@1hive/1hive-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLoaderData } from "remix";
import styled from "styled-components";
import {
  Chain,
  useAccount,
  useConnect,
  useNetwork,
  UserRejectedRequestError,
  ChainNotConfiguredError,
} from "wagmi";
import { AccountButton } from "./AccountButton";
import { HeaderPopover } from "./HeaderPopover";
import {
  ScreenPromptedAction,
  ScreenConnected,
  ScreenConnecting,
  ScreenError,
  ScreenWallets,
} from "./screens";
import { PromptedAction, Screen, ScreenType } from "./types";

const SCREENS: Screen[] = [
  {
    id: ScreenType.Wallets,
  },
  {
    id: ScreenType.Connecting,
  },
  {
    id: ScreenType.Action,
  },
  {
    id: ScreenType.Connected,
  },
  {
    id: ScreenType.Error,
  },
];

const getNetworkError = (
  networkError: Error | undefined,
  networkData: { chain?: { unsupported: boolean | undefined }; chains: Chain[] }
): Error | undefined => {
  if (networkData.chain?.unsupported) {
    return new ChainNotConfiguredError();
  }

  if (networkError) {
    return networkError;
  }

  return;
};

export const AccountModule = ({ compact }: { compact?: boolean }) => {
  const buttonRef = useRef();
  const previousScreenIndex = useRef(-1);
  const [
    { data: accountData, error: accountError, loading: accountLoading },
    disconnect,
  ] = useAccount();
  const [
    { data: connectData, error: connectError, loading: connectLoading },
    connect,
  ] = useConnect();
  const [
    { data: networkData, error: networkError, loading: networkLoading },
    switchNetwork,
  ] = useNetwork();
  const [opened, setOpened] = useState(false);
  const [promptedActionSucceded, setPromptedActionSucceded] = useState(false);
  const [promptedAction, setPromptedAction] = useState<PromptedAction>();
  const [activatingDelayed, setActivatingDelayed] = useState<boolean | null>(
    false
  );
  const loading = accountLoading || connectLoading || networkLoading;
  const error =
    getNetworkError(networkError, networkData) || accountError || connectError;

  const accountAddress = accountData?.address;
  const currentChain = networkData?.chain;

  const {
    direction,
    screenIndex,
  }: { direction: -1 | 1; screenIndex: ScreenType } = useMemo(() => {
    const screenId = (() => {
      if (promptedAction) {
        return ScreenType.Action;
      }
      if (activatingDelayed || promptedActionSucceded) {
        return ScreenType.Connecting;
      }
      // Ignore user rejection errors
      if (error && !(error instanceof UserRejectedRequestError)) {
        return ScreenType.Error;
      }
      if (accountAddress) {
        return ScreenType.Connected;
      }

      return ScreenType.Wallets;
    })();

    const screenIndex = SCREENS.findIndex((screen) => screen.id === screenId);
    const direction = previousScreenIndex.current > screenIndex ? -1 : 1;

    previousScreenIndex.current = screenIndex;

    return { direction, screenIndex };
  }, [
    activatingDelayed,
    accountAddress,
    error,
    promptedAction,
    promptedActionSucceded,
  ]);

  const screen = SCREENS[screenIndex];
  const screenId = screen.id;

  // Always show the “connecting…” screen, even if there are no delay
  useEffect(() => {
    if (loading) {
      setActivatingDelayed(loading);
      return;
    }

    if (error) {
      setActivatingDelayed(null);
    }

    const timer = setTimeout(() => {
      setActivatingDelayed(null);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [error, loading]);

  // Set flag to display "connecting…" screen when prompting actions succeed
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (promptedActionSucceded) {
      timer = setTimeout(() => {
        setPromptedActionSucceded(false);
      }, 500);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [promptedActionSucceded]);

  const toggle = useCallback(() => setOpened((opened) => !opened), []);

  const handleSwitchNetwork = useCallback(
    (switchAction: PromptedAction, chain: Chain) => {
      setPromptedAction(switchAction);

      if (switchNetwork) {
        switchNetwork(chain.id)
          .then(({ data, error }) => {
            if (data) {
              setPromptedActionSucceded(true);
            } else {
              console.error(error);
            }
            setPromptedAction(undefined);
          })
          .catch((err) => console.error(err));
      }
    },
    [switchNetwork]
  );

  const handlePopoverClose = useCallback(() => {
    if (
      screenId === ScreenType.Connecting ||
      screenId === ScreenType.Error ||
      screenId === ScreenType.Action
    ) {
      // reject closing the popover
      return false;
    }
    setOpened(false);
  }, [screenId]);

  useEffect(() => {
    if (screenId === ScreenType.Action) {
      setOpened(true);
    }
  }, [screenId]);

  return (
    <Container ref={buttonRef}>
      {screen.id === ScreenType.Connected ? (
        <AccountButton onClick={toggle} />
      ) : (
        <Button
          icon={<IconConnect />}
          label="Connect account"
          onClick={toggle}
          display={compact ? "icon" : "all"}
        />
      )}
      <HeaderPopover
        direction={direction}
        heading={screen.title}
        onClose={handlePopoverClose}
        opener={buttonRef.current}
        screenId={screenId}
        visible={opened}
        width={(screen.id === ScreenType.Connected ? 41 : 51) * GU}
      >
        {screenId === ScreenType.Connecting && accountData?.connector ? (
          <ScreenConnecting wallet={accountData.connector} />
        ) : screenId === ScreenType.Connected &&
          accountAddress &&
          currentChain &&
          accountData.connector ? (
          <ScreenConnected
            account={accountAddress}
            chain={currentChain as Chain}
            wallet={accountData.connector}
            onDisconnect={disconnect}
          />
        ) : screenId === ScreenType.Error ? (
          <ScreenError
            error={error}
            onBack={disconnect}
            onSwitchNetwork={handleSwitchNetwork}
          />
        ) : screen.id === ScreenType.Action && promptedAction ? (
          <ScreenPromptedAction
            promptedAction={promptedAction}
            onCancel={disconnect}
          />
        ) : (
          <ScreenWallets wallets={connectData.connectors} onClick={connect} />
        )}
      </HeaderPopover>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  outline: 0;
`;
