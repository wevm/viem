import { http, createPublicClient, stringify } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

client.watchBlockNumber({
  onBlockNumber: (blockNumber) => {
    document.getElementById('block-number')!.innerHTML =
      `Block number: ${blockNumber}`
  },
})

client.watchBlocks({
  onBlock: (block) => {
    document.getElementById('block')!.innerHTML =
      `Block: <pre><code>${stringify(block, null, 2)}</code></pre>`
  },
})
