// [!region setup]
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const account = privateKeyToAccount('0x...')
export const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
}).extend(publicActions)
// [!endregion setup]
