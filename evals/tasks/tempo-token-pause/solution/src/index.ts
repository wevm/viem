import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

export async function setupToken(client: Client.Client) {
  const account = client.account
  if (!account) throw new Error('account is required')
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Halt USD',
    symbol: 'HUSD',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer', 'pause', 'unpause'],
    to: account.address,
    token,
  })
  await Actions.token.mintSync(client, {
    amount: { decimals: 6, formatted: '1000' },
    to: account.address,
    token,
  })
  return token
}

export async function pauseToken(
  client: Client.Client,
  options: pauseToken.Options,
) {
  await Actions.token.pauseSync(client, options)
}

export async function unpauseToken(
  client: Client.Client,
  options: unpauseToken.Options,
) {
  await Actions.token.unpauseSync(client, options)
}

export async function transferToken(
  client: Client.Client,
  options: transferToken.Options,
) {
  const { amount, to, token } = options
  return Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: amount },
    to,
    token,
  })
}

export declare namespace pauseToken {
  type Options = {
    token: Address.Address
  }
}

export declare namespace transferToken {
  type Options = {
    amount: string
    to: Address.Address
    token: Address.Address
  }
}

export declare namespace unpauseToken {
  type Options = {
    token: Address.Address
  }
}
