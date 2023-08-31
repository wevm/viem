import { http, createPublicClient, stringify } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const el = document.getElementById('app')

// Get initial event logs
const blockNumber = await client.getBlockNumber()
const logs = await client.getLogs({
  fromBlock: blockNumber,
  toBlock: blockNumber,
})
el!.innerHTML = `Logs at block ${blockNumber}: <pre><code>${stringify(
  logs,
  null,
  2,
)}</code></pre>`

// Watch for event logs
client.watchEvent({
  onLogs: (logs) => {
    el!.innerHTML = `Logs at block ${
      logs[0].blockNumber
    }: <pre><code>${stringify(logs, null, 2)}</code></pre>`
  },
})
