import { Actions, Client, http, Transport } from 'viem'
import { mainnet } from 'viem/chains'

let requestCount = 0

function counted(transport: Transport.Transport) {
  return Transport.from({
    key: 'counted',
    name: 'Counted',
    type: 'counted',
    setup(parameters) {
      const inner = transport.setup({ ...parameters, retryCount: 0 })
      return {
        retryCount: parameters.retryCount,
        request(args, options) {
          requestCount++
          return inner.request(args, options)
        },
      }
    },
  })
}

const client = Client.create({
  cacheTime: 0,
  chain: mainnet,
  transport: counted(http('http://anvil:8545')),
})

async function read() {
  const blockNumber = await Actions.block.getNumber(client)
  return { blockNumber, requestCount }
}

export async function example() {
  const first = await read()
  const second = await read()
  return { first, second }
}
