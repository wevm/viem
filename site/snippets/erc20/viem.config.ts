// [!region setup]
import { createClient, erc20Actions, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: mainnet,
  transport: http(),
}).extend(erc20Actions())

// [!endregion setup]
