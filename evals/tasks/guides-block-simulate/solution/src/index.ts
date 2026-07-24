import { Actions, type Client } from 'viem'
import type { Address } from 'viem/utils'

export async function simulateTransfers(
  client: Client.Client,
  options: simulateTransfers.Options,
) {
  const { from, transfers } = options
  const [block] = await Actions.block.simulate(client, {
    blocks: [
      {
        calls: transfers.map(({ to, value }) => ({ account: from, to, value })),
      },
    ],
  })
  return block.calls.map(({ status, gasUsed }) => ({ status, gasUsed }))
}

export declare namespace simulateTransfers {
  type Options = {
    from: Address.Address
    transfers: readonly Transfer[]
  }

  type Transfer = {
    to: Address.Address
    value: bigint
  }
}
