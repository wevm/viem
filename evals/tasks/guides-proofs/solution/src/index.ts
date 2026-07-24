import { Actions, type Client } from 'viem'
import type { Address, Hex } from 'viem/utils'

export async function getStorageProof(
  client: Client.Client,
  options: getStorageProof.Options,
) {
  const { address, storageKey } = options
  return Actions.address.getProof(client, {
    address,
    storageKeys: [storageKey],
  })
}

export declare namespace getStorageProof {
  type Options = {
    address: Address.Address
    storageKey: Hex.Hex
  }
}
