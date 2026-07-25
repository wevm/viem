import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const alphaUsd = '0x20c0000000000000000000000000000000000001'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const provider = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
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
    to: provider,
    userTokenAddress: alphaUsd,
    validatorTokenAddress: pathUsd,
    validatorTokenAmount: 25_000_000n,
  })
  const second = await Actions.amm.mintSync(client, {
    to: provider,
    userTokenAddress: alphaUsd,
    validatorTokenAddress: pathUsd,
    validatorTokenAmount: 10_000_000n,
  })
  const poolBeforeBurn = await Actions.amm.getPool(client, {
    userToken: alphaUsd,
    validatorToken: pathUsd,
  })
  const liquidityBeforeBurn = await Actions.amm.getLiquidityBalance(client, {
    address: provider,
    userToken: alphaUsd,
    validatorToken: pathUsd,
  })
  const burn = await Actions.amm.burnSync(client, {
    liquidity: liquidityBeforeBurn,
    to: provider,
    userToken: alphaUsd,
    validatorToken: pathUsd,
  })
  const poolAfterBurn = await Actions.amm.getPool(client, {
    userToken: alphaUsd,
    validatorToken: pathUsd,
  })
  const liquidityAfterBurn = await Actions.amm.getLiquidityBalance(client, {
    address: provider,
    userToken: alphaUsd,
    validatorToken: pathUsd,
  })
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
