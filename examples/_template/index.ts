import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const blockNumber = client.getBlockNumber()

export default [`Block number: ${blockNumber}`]
