import { Actions, Chain, type Client } from 'viem'
import { Value } from 'viem/utils'

export const chain = Chain.from({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { http: 'http://anvil:8545' },
  fees: {
    maxPriorityFeePerGas: Value.fromGwei('3'),
  },
})

export function estimateFees(client: Client.Client) {
  return Actions.fee.estimateFeesPerGas(client)
}
