import { Actions, type Client } from 'viem'
import type { Address } from 'viem/utils'

export async function withTemporaryBalance(
  client: Client.Client,
  options: withTemporaryBalance.Options,
) {
  const { address, value } = options
  const before = await Actions.address.getBalance(client, { address })
  const id = await Actions.state.snapshot(client)
  const during = await (async () => {
    try {
      await Actions.address.setBalance(client, { address, value })
      return await Actions.address.getBalance(client, { address })
    } finally {
      await Actions.state.revert(client, { id })
    }
  })()
  const after = await Actions.address.getBalance(client, { address })
  return { before, during, after }
}

export declare namespace withTemporaryBalance {
  type Options = {
    address: Address.Address
    value: bigint
  }
}
