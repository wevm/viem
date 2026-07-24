import type { Client } from 'viem'
import { Actions } from 'viem/tempo'

export async function setupMarket(
  client: Client.Client,
  options: setupMarket.Options,
) {
  const account = client.account
  if (!account) throw new Error('account is required')
  const { name, symbol } = options
  const { token: base } = await Actions.token.createSync(client, {
    currency: 'USD',
    name,
    symbol,
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: account.address,
    token: base,
  })
  await Actions.token.mintSync(client, {
    amount: 1_000_000_000_000n,
    to: account.address,
    token: base,
  })
  const { quote } = await Actions.dex.createPairSync(client, { base })
  await Actions.dex.placeSync(client, {
    amount: 500_000_000n,
    tick: 100,
    token: base,
    type: 'sell',
  })
  return { base, quote }
}

export declare namespace setupMarket {
  type Options = {
    name: string
    symbol: string
  }
}

export async function quoteBuy(
  client: Client.Client,
  options: Actions.dex.getBuyQuote.Args,
) {
  return Actions.dex.getBuyQuote(client, options)
}

export async function buyExact(
  client: Client.Client,
  options: Actions.dex.buySync.Args,
) {
  return Actions.dex.buySync(client, options)
}
