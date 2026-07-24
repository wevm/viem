import { Actions, type Client } from 'viem'
import { type Address, Value } from 'viem/utils'

export async function queueAndMineTransfers(
  client: Client.Client,
  options: queueAndMineTransfers.Options,
) {
  const { amountEther, to } = options

  await Actions.block.setAutomine(client, { enabled: false })
  try {
    for (let i = 0; i < 3; i++)
      await Actions.transaction.send(client, {
        to,
        value: Value.fromEther(amountEther),
      })

    const { pending } = await Actions.txpool.getStatus(client)
    await Actions.block.mine(client, { blocks: 1 })
    const minedTxCount = await Actions.block.getTransactionCount(client)

    return { pooledBefore: pending, minedTxCount }
  } finally {
    await Actions.block.setAutomine(client, { enabled: true })
  }
}

export declare namespace queueAndMineTransfers {
  type Options = {
    amountEther: string
    to: Address.Address
  }
}
