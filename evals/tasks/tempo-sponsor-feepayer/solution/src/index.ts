import type { Client } from 'viem'
import { Account, Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function sponsoredTransfer(
  client: Client.Client,
  options: sponsoredTransfer.Options,
) {
  const { amount, feePayer, to } = options
  return Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: amount },
    feePayer,
    feeToken: pathUsd,
    to,
    token: pathUsd,
  })
}

export declare namespace sponsoredTransfer {
  type Options = {
    amount: string
    feePayer: Account.Account
    to: Address.Address
  }
}
