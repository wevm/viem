// [!region setup]
import { createClient, http, publicActions, walletActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { Chain, tempoActions } from 'viem/tempo'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: Chain.testnet,
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions)
  .extend(tempoActions())

// [!endregion setup]
