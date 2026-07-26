import { Actions, Client, http, Transport } from 'viem'
import { mainnet } from 'viem/chains'

let requestCount = 0

const client = Client.create({
  cacheTime: 0,
  chain: mainnet,
  transport: Transport.from({
    key: 'counted',
    name: 'Counted',
    type: 'counted',
    setup(parameters) {
      const inner = http('http://anvil:8545').setup({
        ...parameters,
        retryCount: 0,
      })
      return {
        retryCount: parameters.retryCount,
        request(args, options) {
          requestCount++
          return inner.request(args, options)
        },
      }
    },
  }),
})

export async function example() {
  const first = {
    blockNumber: await Actions.block.getNumber(client),
    requestCount,
  }
  const second = {
    blockNumber: await Actions.block.getNumber(client),
    requestCount,
  }
  return { first, second }
}
