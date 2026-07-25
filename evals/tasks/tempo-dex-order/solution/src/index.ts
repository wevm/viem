import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const { token: base } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Desk Dollar',
    symbol: 'DESKUSD',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: client.account.address,
    token: base,
  })
  await Actions.token.mintSync(client, {
    amount: 1_000_000_000_000n,
    to: client.account.address,
    token: base,
  })
  const { quote } = await Actions.dex.createPairSync(client, { base })

  const buyPlaced = await Actions.dex.placeSync(client, {
    amount: 250_000_000n,
    tick: 40,
    token: base,
    type: 'buy',
  })
  const buyOrder = await Actions.dex.getOrder(client, {
    orderId: buyPlaced.orderId,
  })
  const buyBook = await Actions.dex.getOrderbook(client, { base, quote })
  const buyCanceled = await Actions.dex.cancelSync(client, {
    orderId: buyPlaced.orderId,
  })

  const sellPlaced = await Actions.dex.placeSync(client, {
    amount: 100_000_000n,
    tick: -60,
    token: base,
    type: 'sell',
  })
  const sellOrder = await Actions.dex.getOrder(client, {
    orderId: sellPlaced.orderId,
  })
  const sellBook = await Actions.dex.getOrderbook(client, { base, quote })
  const sellCanceled = await Actions.dex.cancelSync(client, {
    orderId: sellPlaced.orderId,
  })

  return {
    base,
    buy: {
      book: buyBook,
      canceled: buyCanceled,
      order: buyOrder,
      placed: buyPlaced,
    },
    quote,
    sell: {
      book: sellBook,
      canceled: sellCanceled,
      order: sellOrder,
      placed: sellPlaced,
    },
  }
}
