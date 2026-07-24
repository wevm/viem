import type { Client } from 'viem'
import { Account, Actions, Expiry } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function grantSpendingKey(
  client: Client.Client,
  options: grantSpendingKey.Options,
) {
  const { accessKey, limit } = options
  return Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Expiry.hours(1),
    feeToken: pathUsd,
    limits: [{ limit, token: pathUsd }],
  })
}

export async function remainingAllowance(
  client: Client.Client,
  options: remainingAllowance.Options,
) {
  const { accessKey, account } = options
  const { remaining } = await Actions.accessKey.getRemainingLimit(client, {
    accessKey,
    account,
    token: pathUsd,
  })
  return remaining
}

export async function spendWithKey(
  client: Client.Client,
  options: spendWithKey.Options,
) {
  const { amount, to } = options
  return Actions.token.transferSync(client, {
    amount,
    feeToken: pathUsd,
    to,
    token: pathUsd,
  })
}

export async function revokeSpendingKey(
  client: Client.Client,
  options: revokeSpendingKey.Options,
) {
  return Actions.accessKey.revokeSync(client, {
    accessKey: options.accessKey,
    feeToken: pathUsd,
  })
}

export declare namespace grantSpendingKey {
  type Options = {
    accessKey: Account.AccessKeyAccount
    limit: bigint
  }
}

export declare namespace remainingAllowance {
  type Options = {
    accessKey: Address.Address
    account: Address.Address
  }
}

export declare namespace revokeSpendingKey {
  type Options = {
    accessKey: Address.Address
  }
}

export declare namespace spendWithKey {
  type Options = {
    amount: bigint
    to: Address.Address
  }
}
