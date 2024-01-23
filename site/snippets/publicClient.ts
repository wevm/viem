// [!region imports]
import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
// [!endregion imports]

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
