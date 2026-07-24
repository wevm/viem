import { Actions, type Client, http } from 'viem'

export function createTransport(options: createTransport.Options) {
  return http(options.url, { batch: true })
}

export declare namespace createTransport {
  type Options = {
    url: string
  }
}

export async function getNetworkSnapshot(client: Client.Client) {
  const [blockNumber, chainId, gasPrice] = await Promise.all([
    Actions.block.getNumber(client),
    Actions.chains.getId(client),
    Actions.fee.getGasPrice(client),
  ])
  return { blockNumber, chainId, gasPrice }
}
