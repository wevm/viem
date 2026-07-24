import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function transferToken(
  client: Client.Client,
  options: transferToken.Options,
) {
  const { amount, to } = options
  return Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: amount },
    to,
    token: pathUsd,
  })
}

export declare namespace transferToken {
  type Options = {
    amount: string
    to: Address.Address
  }
}
