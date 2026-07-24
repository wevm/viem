import { Actions, type Client } from 'viem'
import { type Address, Ens } from 'viem/utils'

export async function resolveEnsAddress(
  client: Client.Client,
  options: resolveEnsAddress.Options,
) {
  return Actions.ens.getAddress(client, {
    name: Ens.normalize(options.name),
  })
}

export async function resolveEnsName(
  client: Client.Client,
  options: resolveEnsName.Options,
): Promise<string | null> {
  return Actions.ens.getName(client, { address: options.address })
}

export declare namespace resolveEnsAddress {
  type Options = {
    name: string
  }
}

export declare namespace resolveEnsName {
  type Options = {
    address: Address.Address
  }
}
