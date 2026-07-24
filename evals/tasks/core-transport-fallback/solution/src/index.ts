import { Actions, type Client, fallback, http } from 'viem'

export function createTransport(options: createTransport.Options) {
  return fallback(options.urls.map((url) => http(url)))
}

export declare namespace createTransport {
  type Options = {
    urls: readonly string[]
  }
}

export function getBlockNumber(client: Client.Client): Promise<bigint> {
  return Actions.block.getNumber(client)
}
