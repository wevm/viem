// [!region imports]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// [!endregion imports]

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
