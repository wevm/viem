import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function readNonce(
  client: Client.Client,
  options: readNonce.Options,
) {
  return Actions.nonce.get(client, options)
}

export async function sendParallelTransfers(
  client: Client.Client,
  options: sendParallelTransfers.Options,
) {
  const receipts = await Promise.all(
    options.transfers.map(async ({ amount, nonceKey, to }) => {
      const { receipt } = await Actions.token.transferSync(client, {
        amount: { decimals: 6, formatted: amount },
        nonceKey,
        to,
        token: pathUsd,
      })
      return receipt
    }),
  )
  return { receipts }
}

export declare namespace readNonce {
  type Options = {
    account: Address.Address
    nonceKey: bigint
  }
}

export declare namespace sendParallelTransfers {
  type Options = {
    transfers: readonly Transfer[]
  }

  type Transfer = {
    amount: string
    nonceKey: bigint
    to: Address.Address
  }
}
