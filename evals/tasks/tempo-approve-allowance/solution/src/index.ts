import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function approveSpender(
  client: Client.Client,
  options: approveSpender.Options,
) {
  const { amount, spender } = options
  return Actions.token.approveSync(client, {
    amount: { decimals: 6, formatted: amount },
    spender,
    token: pathUsd,
  })
}

export async function getAllowance(
  client: Client.Client,
  options: getAllowance.Options,
) {
  const { owner, spender } = options
  const { amount } = await Actions.token.getAllowance(client, {
    account: owner,
    spender,
    token: pathUsd,
  })
  return amount
}

export async function spendAllowance(
  client: Client.Client,
  options: spendAllowance.Options,
) {
  const { amount, owner, to } = options
  return Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: amount },
    from: owner,
    to,
    token: pathUsd,
  })
}

export declare namespace approveSpender {
  type Options = {
    amount: string
    spender: Address.Address
  }
}

export declare namespace getAllowance {
  type Options = {
    owner: Address.Address
    spender: Address.Address
  }
}

export declare namespace spendAllowance {
  type Options = {
    amount: string
    owner: Address.Address
    to: Address.Address
  }
}
