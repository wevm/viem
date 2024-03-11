import { http, createPublicClient } from 'viem'
import { sepolia } from 'viem/chains'

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
})

const el = document.getElementById('app')

// Polling frequency (in ms)
const pollingInterval = 1000

client.watchPendingTransactions({
  poll: true,
  pollingInterval,
  onTransactions: (hashes) => {
    for (let i = 0; i < hashes.length; i++) {
      const newElement = document.createElement('p')
      newElement.textContent = hashes[i]
      el!.appendChild(newElement)
    }
  },
})
