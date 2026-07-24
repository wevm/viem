import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

export async function createMarket(
  client: Client.Client,
  options: createMarket.Options,
) {
  const { name, symbol } = options
  const account = client.account
  if (!account) throw new Error('account is required')
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
  return { base, quote }
}

export async function placeLimitOrder(
  client: Client.Client,
  options: placeLimitOrder.Options,
) {
  const { amount, side, tick, token } = options
  const { orderId, receipt } = await Actions.dex.placeSync(client, {
    amount,
    tick,
    token,
    type: side,
  })
  return { orderId, receipt }
}

export declare namespace placeLimitOrder {
  type Options = {
    amount: bigint
    side: 'buy' | 'sell'
    tick: number
    token: Address.Address
  }
}

export async function getOrderInfo(
  client: Client.Client,
  options: getOrderInfo.Options,
) {
  const { amount, isBid, maker, remaining, tick } = await Actions.dex.getOrder(
    client,
    options,
  )
  return { amount, isBid, maker, remaining, tick }
}

export async function getBestTicks(
  client: Client.Client,
  options: getBestTicks.Options,
) {
  const { bestAskTick, bestBidTick } = await Actions.dex.getOrderbook(
    client,
    options,
  )
  return { bestAskTick, bestBidTick }
}

export async function cancelOrder(
  client: Client.Client,
  options: cancelOrder.Options,
) {
  const { receipt } = await Actions.dex.cancelSync(client, options)
  return { receipt }
}

export declare namespace cancelOrder {
  type Options = {
    orderId: bigint
  }
}

export declare namespace createMarket {
  type Options = {
    name: string
    symbol: string
  }
}

export declare namespace getBestTicks {
  type Options = {
    base: Address.Address
    quote: Address.Address
  }
}

export declare namespace getOrderInfo {
  type Options = {
    orderId: bigint
  }
}
