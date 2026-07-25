import { Actions, Chain, Client, http } from 'viem'
import { Value } from 'viem/utils'

const chain = Chain.from({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { http: 'http://anvil:8545' },
  fees: {
    maxPriorityFeePerGas: Value.fromGwei('3'),
  },
})

const client = Client.create({
  chain,
  transport: http(),
})

export async function example() {
  return {
    chain,
    fees: await Actions.fee.estimateFeesPerGas(client),
  }
}
