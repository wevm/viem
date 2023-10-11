import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

export const config = {
  runtime: 'edge',
}

export async function load() {
  const client = createPublicClient({
    chain: mainnet,
    transport: webSocket(
      'wss://eth-mainnet.g.alchemy.com/v2/4iIl6mDHqX3GFrpzmfj2Soirf3MPoAcH',
    ),
  })

  await client.getBlockNumber()

  return {
    success: true,
  }
}
