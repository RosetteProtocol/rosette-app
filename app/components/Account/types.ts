export enum ScreenType {
  Connecting,
  Connected,
  Error,
  Wallets,
  Action,
}

export type Screen = {
  id: ScreenType
  title?: string
}

export type PromptedAction = {
  title: string
  subtitle?: string
  image?: string
}
