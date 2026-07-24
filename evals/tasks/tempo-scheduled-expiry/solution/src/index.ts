import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function transferWithDeadline(
  client: Client.Client,
  options: transferWithDeadline.Options,
) {
  const { amount, deadline, to } = options
  return Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: amount },
    to,
    token: pathUsd,
    validBefore: deadline,
  })
}

export declare namespace transferWithDeadline {
  type Options = {
    amount: string
    deadline: number
    to: Address.Address
  }
}
