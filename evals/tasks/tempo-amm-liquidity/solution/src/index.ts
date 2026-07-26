import { Account, Actions, Addresses, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import { Value } from 'viem/utils'

const alphaUsd = '0x20c0000000000000000000000000000000000001'
const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const first = await Actions.amm.mintSync(client, {
    to: client.account.address,
    userTokenAddress: alphaUsd,
    validatorTokenAddress: Addresses.pathUsd,
    validatorTokenAmount: Value.from('25', 6),
  })
  const second = await Actions.amm.mintSync(client, {
    to: client.account.address,
    userTokenAddress: alphaUsd,
    validatorTokenAddress: Addresses.pathUsd,
    validatorTokenAmount: Value.from('10', 6),
  })
  const [liquidityBeforeBurn, poolBeforeBurn] = await Promise.all([
    Actions.amm.getLiquidityBalance(client, {
      address: client.account.address,
      userToken: alphaUsd,
      validatorToken: Addresses.pathUsd,
    }),
    Actions.amm.getPool(client, {
      userToken: alphaUsd,
      validatorToken: Addresses.pathUsd,
    }),
  ])
  const burn = await Actions.amm.burnSync(client, {
    liquidity: liquidityBeforeBurn,
    to: client.account.address,
    userToken: alphaUsd,
    validatorToken: Addresses.pathUsd,
  })
  const [liquidityAfterBurn, poolAfterBurn] = await Promise.all([
    Actions.amm.getLiquidityBalance(client, {
      address: client.account.address,
      userToken: alphaUsd,
      validatorToken: Addresses.pathUsd,
    }),
    Actions.amm.getPool(client, {
      userToken: alphaUsd,
      validatorToken: Addresses.pathUsd,
    }),
  ])
  return {
    burn,
    first,
    liquidityAfterBurn,
    liquidityBeforeBurn,
    poolAfterBurn,
    poolBeforeBurn,
    second,
  }
}
