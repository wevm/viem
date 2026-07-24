import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

export async function createToken(
  client: Client.Client,
  options: createToken.Options,
) {
  const { name, symbol } = options
  const account = client.account
  if (!account) throw new Error('account is required')
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name,
    symbol,
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: account.address,
    token,
  })
  return { token }
}

export async function mintToken(
  client: Client.Client,
  options: mintToken.Options,
) {
  const { amount, to, token } = options
  const { receipt } = await Actions.token.mintSync(client, {
    amount: { decimals: 6, formatted: amount },
    to,
    token,
  })
  const [balance, totalSupply] = await Promise.all([
    Actions.token.getBalance(client, {
      account: to,
      decimals: 6,
      token,
    }),
    Actions.token.getTotalSupply(client, {
      decimals: 6,
      token,
    }),
  ])
  return { balance: balance.amount, receipt, totalSupply: totalSupply.amount }
}

export async function burnToken(
  client: Client.Client,
  options: burnToken.Options,
) {
  const { amount, token } = options
  const { receipt } = await Actions.token.burnSync(client, {
    amount: { decimals: 6, formatted: amount },
    token,
  })
  const [balance, totalSupply] = await Promise.all([
    Actions.token.getBalance(client, { decimals: 6, token }),
    Actions.token.getTotalSupply(client, {
      decimals: 6,
      token,
    }),
  ])
  return { balance: balance.amount, receipt, totalSupply: totalSupply.amount }
}

export declare namespace burnToken {
  type Options = {
    amount: string
    token: Address.Address
  }
}

export declare namespace createToken {
  type Options = {
    name: string
    symbol: string
  }
}

export declare namespace mintToken {
  type Options = {
    amount: string
    to: Address.Address
    token: Address.Address
  }
}
