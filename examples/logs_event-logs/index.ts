import { http, createPublicClient, parseAbiItem, stringify } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const el = document.getElementById('app')

const event = parseAbiItem(
  'event NameRegistered(string name,bytes32 indexed label,address indexed owner,uint256 cost,uint256 expires)',
)

// Get initial event logs (last 20 blocks)
const blockNumber = await client.getBlockNumber()
const logs = await client.getLogs({
  event,
  fromBlock: blockNumber - 20n,
  toBlock: blockNumber,
})
el!.innerHTML = `Logs for NameRegistered from block ${
  blockNumber - 20n
} to ${blockNumber}: <pre><code>${stringify(logs, null, 2)}</code></pre>`

// Watch for new event logs
client.watchEvent({
  event,
  onLogs: (logs) => {
    el!.innerHTML = `Logs for NameRegistered at block ${
      logs[0].blockNumber
    }: <pre><code>${stringify(logs, null, 2)}</code></pre>`
  },
})
