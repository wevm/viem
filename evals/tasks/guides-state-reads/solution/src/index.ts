import { Actions, type Client } from 'viem'
import type { Address } from 'viem/utils'

export async function getAccountState(
  client: Client.Client,
  options: getAccountState.Options,
) {
  const { address } = options
  const [balance, nonce, code, storageSlot0] = await Promise.all([
    Actions.address.getBalance(client, { address }),
    Actions.address.getTransactionCount(client, { address }),
    Actions.address.getCode(client, { address }),
    Actions.address.getStorageAt(client, { address, slot: '0x0' }),
  ])
  return { balance, nonce, code, storageSlot0 }
}

export declare namespace getAccountState {
  type Options = {
    address: Address.Address
  }
}
