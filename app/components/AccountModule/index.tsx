import { Button, GU, IconConnect } from "@1hive/1hive-ui";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Chain, Connector, useAccount, useConnect, useNetwork } from "wagmi";
import shallow from "zustand/shallow";

import { AccountButton } from "./AccountButton";
import { HeaderPopover } from "./HeaderPopover";
import { getNetworkError } from "./helpers";
import {
  PromptedAction,
  SCREENS,
  ScreenType,
  useAccountModuleState,
} from "./useAccountModuleState";

const { Connecting, Error, Action, Connected } = ScreenType;

export const AccountModule = ({ compact }: { compact?: boolean }) => {
  const buttonRef = useRef();
  const timer = useRef<NodeJS.Timeout>();
  const [{ data: accountData, error: accountError }, disconnect] = useAccount();
  const [{ error: connectError }, connect] = useConnect();
  const [{ data: networkData, error: networkError }, switchNetwork] =
    useNetwork();
  const [
    currentScreen,
    screenDirection,
    opened,
    toggleOpened,
    updateOpened,
    updateSelectedConnector,
    goToScreen,
    updatePromptedAction,
    goToInitialScreen,
  ] = useAccountModuleState(
    (state) => [
      state.currentScreen,
      state.screenDirection,
      state.opened,
      state.toggleOpened,
      state.updateOpened,
      state.updateSelectedConnector,
      state.goToScreen,
      state.updatePromptedAction,
      state.goToInitialScreen,
    ],
    shallow
  );
  const [promptedActionSucceeded, setPromptedActionSucceeded] = useState(false);

  const error =
    getNetworkError(networkError, networkData) || accountError || connectError;
  const displayAccountButton =
    currentScreen === Connected && !error && accountData?.address;

  const Screen = SCREENS[currentScreen];

  const handlePopoverClose = () => {
    if (
      currentScreen === Connecting ||
      currentScreen === Error ||
      currentScreen === Action
    ) {
      // Reject closing the popover
      return false;
    }
    updateOpened(false);
  };

  const handleSwitchNetwork = (switchAction: PromptedAction, chain: Chain) => {
    if (switchNetwork) {
      updatePromptedAction(switchAction);
      goToScreen(Action);
      switchNetwork(chain.id)
        .then(({ data, error }) => {
          if (data) {
            setPromptedActionSucceeded(true);
          } else {
            console.error(error);
            goToInitialScreen();
            updatePromptedAction(null);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const handleConnect = (connector: Connector) => {
    updateSelectedConnector(connector);
    goToScreen(Connecting);
    /**
     * Set a timer to always display connecting screen for
     * a period of time
     */
    timer.current = setTimeout(() => {
      connect(connector).then(({ data, error }) => {
        if (data?.chain?.unsupported || error) {
          goToScreen(Error);
        } else {
          goToScreen(Connected);
        }
      });
    }, 500);
  };

  const handleBack = () => {
    goToInitialScreen();
    disconnect();
  };

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  /**
   * Wait until network switching process is completed before going to
   * the connected screen.
   */
  useEffect(() => {
    if (promptedActionSucceeded && !networkData.chain?.unsupported) {
      goToScreen(Connected);
      updatePromptedAction(null);
      setPromptedActionSucceeded(false);
    }
  }, [
    updatePromptedAction,
    promptedActionSucceeded,
    networkData.chain,
    goToScreen,
  ]);

  return (
    <Container ref={buttonRef}>
      {displayAccountButton ? (
        <AccountButton onClick={toggleOpened} />
      ) : (
        <Button
          icon={<IconConnect />}
          label="Connect account"
          onClick={toggleOpened}
          display={compact ? "icon" : "all"}
        />
      )}
      <HeaderPopover
        direction={screenDirection}
        onClose={handlePopoverClose}
        opener={buttonRef.current}
        screenId={currentScreen}
        visible={opened}
        width={(currentScreen === Connected ? 41 : 51) * GU}
      >
        <Screen
          onConnect={handleConnect}
          onSwitchNetwork={handleSwitchNetwork}
          onBack={handleBack}
        />
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
