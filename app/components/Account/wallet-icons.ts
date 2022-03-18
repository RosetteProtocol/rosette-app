import metamask from "./assets/metamask.svg"
import walletconnect from "./assets/walletconnect.svg"

export const getWalletIconPath = (id: string): string | undefined => {
  switch (id) {
    case "injected":
      return metamask
    case "walletconnect":
      return walletconnect
    default:
      return
  }
}
