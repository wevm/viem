import { http, createPublicClient, stringify } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const el = document.getElementById('app')

// TODO: convert to `parseAbiItem`.
const event = {
  inputs: [
    { indexed: false, name: 'name', type: 'string' },
    { indexed: true, name: 'label', type: 'bytes32' },
    { indexed: true, name: 'owner', type: 'address' },
    { indexed: false, name: 'cost', type: 'uint256' },
    { indexed: false, name: 'expires', type: 'uint256' },
  ],
  name: 'NameRegistered',
  type: 'event',
} as const

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
