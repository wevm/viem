import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const makerClient = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})
const takerClient = Client.create({
  account: Account.fromSecp256k1(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const { token: base } = await Actions.token.createSync(makerClient, {
    currency: 'USD',
    name: 'Eval Market',
    symbol: 'EVAL',
  })
  await Actions.token.grantRolesSync(makerClient, {
    roles: ['issuer'],
    to: makerClient.account.address,
    token: base,
  })
  await Actions.token.mintSync(makerClient, {
    amount: 1_000_000_000_000n,
    to: makerClient.account.address,
    token: base,
  })
  const { quote } = await Actions.dex.createPairSync(makerClient, { base })
  const order = await Actions.dex.placeSync(makerClient, {
    amount: 500_000_000n,
    tick: 100,
    token: base,
    type: 'sell',
  })

  const firstAmountOut = 25_000_000n
  const firstQuote = await Actions.dex.getBuyQuote(takerClient, {
    amountOut: firstAmountOut,
    tokenIn: pathUsd,
    tokenOut: base,
  })
  const firstBuy = await Actions.dex.buySync(takerClient, {
    amountOut: firstAmountOut,
    maxAmountIn: firstQuote,
    tokenIn: pathUsd,
    tokenOut: base,
  })

  const secondAmountOut = 10_000_000n
  const secondQuote = await Actions.dex.getBuyQuote(takerClient, {
    amountOut: secondAmountOut,
    tokenIn: pathUsd,
    tokenOut: base,
  })
  const secondBuy = await Actions.dex.buySync(takerClient, {
    amountOut: secondAmountOut,
    maxAmountIn: secondQuote,
    tokenIn: pathUsd,
    tokenOut: base,
  })

  return {
    base,
    first: {
      amountOut: firstAmountOut,
      buy: firstBuy,
      quote: firstQuote,
    },
    order,
    quote,
    second: {
      amountOut: secondAmountOut,
      buy: secondBuy,
      quote: secondQuote,
    },
  }
}
