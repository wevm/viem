import 'viem/window'

// ---cut---
// [!region imports]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
// [!endregion imports]

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})
