import type { Client } from 'viem'
import { Account, Actions, Expiry } from 'viem/tempo'
import { type Address, Value } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function authorizeSessionKey(
  client: Client.Client,
  options: authorizeSessionKey.Options,
) {
  const { accessKey, limit } = options
  return Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Expiry.hours(1),
    limits: [{ limit: Value.from(limit, 6), token: pathUsd }],
  })
}

export async function sendWithSessionKey(
  client: Client.Client,
  options: sendWithSessionKey.Options,
) {
  const { amount, to } = options
  return Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: amount },
    feeToken: pathUsd,
    to,
    token: pathUsd,
  })
}

export declare namespace authorizeSessionKey {
  type Options = {
    accessKey: Account.AccessKeyAccount
    limit: string
  }
}

export declare namespace sendWithSessionKey {
  type Options = {
    amount: string
    to: Address.Address
  }
}
