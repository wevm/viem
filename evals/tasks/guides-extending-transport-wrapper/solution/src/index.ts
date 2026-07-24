import { Actions, type Client, Transport } from 'viem'

let requestCount = 0

/** Wraps `transport`, counting every request forwarded to it. */
export function counted(options: counted.Options) {
  return Transport.from({
    key: 'counted',
    name: 'Counted',
    type: 'counted',
    setup(parameters) {
      const inner = options.transport.setup({
        ...parameters,
        retryCount: 0,
      })
      return {
        retryCount: parameters.retryCount,
        request(args, requestOptions) {
          requestCount++
          return inner.request(args, requestOptions)
        },
      }
    },
  })
}

export declare namespace counted {
  type Options = {
    transport: Transport.Transport
  }
}

export async function readBlockNumber(client: Client.Client) {
  await Actions.block.getNumber(client)
  const blockNumber = await Actions.block.getNumber(client)
  return { blockNumber, requestCount }
}
