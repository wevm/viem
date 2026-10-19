// [!region setup]
import { createClient, http, publicActions, walletActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: mainnet,
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions)
// [!endregion setup]
