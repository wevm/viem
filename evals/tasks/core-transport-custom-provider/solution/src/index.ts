import { Actions, type Client, custom } from 'viem'
import type { Address } from 'viem/utils'

export function createTransport(options: createTransport.Options) {
  return custom(options.provider)
}

export declare namespace createTransport {
  type Options = {
    provider: Parameters<typeof custom>[0]
  }
}

export function getEthBalance(
  client: Client.Client,
  options: getEthBalance.Options,
): Promise<bigint> {
  return Actions.address.getBalance(client, { address: options.address })
}

export declare namespace getEthBalance {
  type Options = {
    address: Address.Address
  }
}
