import type { Connector } from "wagmi";
import create from "zustand";

import {
  ScreenConnected,
  ScreenConnecting,
  ScreenError,
  ScreenPromptedAction,
  ScreenWallets,
} from "./screens";

export enum ScreenType {
  Wallets,
  Connecting,
  Error,
  Action,
  Connected,
}

export type PromptedAction = {
  title: string;
  subtitle?: string;
  image?: string;
};

type Direction = -1 | 1;

type AccountModuleData = {
  opened: boolean;
  promptedAction: PromptedAction | null;
  selectedConnector: Connector | null;
  currentScreen: ScreenType;
  screenDirection: Direction;
};

type AccountModuleMethods = {
  toggleOpened(): void;
  updateOpened(opened: boolean): void;
  updatePromptedAction(promptedAction: PromptedAction | null): void;
  updateSelectedConnector(selectedConnector: Connector | null): void;
  reset(): void;
  goToInitialScreen(): void;
  goToScreen(screen: ScreenType): void;
};

type AccountModuleState = AccountModuleData & AccountModuleMethods;

export const SCREENS = [
  ScreenWallets,
  ScreenConnecting,
  ScreenError,
  ScreenPromptedAction,
  ScreenConnected,
];

const initialState: AccountModuleData = {
  opened: false,
  promptedAction: null,
  selectedConnector: null,
  currentScreen: ScreenType.Wallets,
  screenDirection: -1,
};

export const useAccountModuleState = create<AccountModuleState>((set, get) => ({
  ...initialState,

  toggleOpened: () => {
    set({ opened: !get().opened });
  },
  updateOpened: (opened) => {
    set({ opened });
  },
  updatePromptedAction: (promptedAction) => {
    set({ promptedAction });
  },
  updateSelectedConnector: (selectedConnector) => {
    set({ selectedConnector });
  },
  reset() {
    set(initialState);
  },
  goToInitialScreen: () => {
    set({ ...initialState, opened: true, screenDirection: -1 });
  },
  goToScreen: (screen) => {
    const previousScreen = get().currentScreen;
    const screenDirection = previousScreen > screen ? -1 : 1;

    set({ currentScreen: screen, screenDirection });
  },
}));
