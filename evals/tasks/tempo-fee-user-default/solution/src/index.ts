import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const alphaUsd = '0x20c0000000000000000000000000000000000001'
const pathUsd = '0x20c0000000000000000000000000000000000000'

const liquidityClient = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

const client = Client.create({
  account: Account.fromSecp256k1(
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  await Actions.amm.mintSync(liquidityClient, {
    feeToken: pathUsd,
    nonceKey: (1n << 255n) + 77n,
    to: liquidityClient.account.address,
    userTokenAddress: alphaUsd,
    validatorTokenAddress: pathUsd,
    validatorTokenAmount: 1_000_000_000n,
  })
  const preference = await Actions.fee.setUserTokenSync(client, {
    token: alphaUsd,
  })
  const token = await Actions.fee.getUserToken(client)
  const transfer = await Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: '5' },
    to: '0x4545454545454545454545454545454545454545',
    token: pathUsd,
  })
  return { preference, token, transfer }
}
