import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Addresses, Client, http } from 'viem/tempo'
import { Value } from 'viem/utils'

const alphaUsd = '0x20c0000000000000000000000000000000000001'
const liquidityProvider = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const user = Account.fromSecp256k1(
  '0x1111111111111111111111111111111111111111111111111111111111111111',
)
const client = Client.create({
  account: user,
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  await Actions.amm.mintSync(client, {
    account: liquidityProvider,
    to: liquidityProvider.address,
    userTokenAddress: alphaUsd,
    validatorTokenAddress: Addresses.pathUsd,
    validatorTokenAmount: Value.from('1000', 6),
  })
  const preference = await Actions.fee.setUserTokenSync(client, {
    token: alphaUsd,
  })
  const token = await Actions.fee.getUserToken(client)
  const transfer = await Actions.token.transferSync(client, {
    amount: Value.from('5', 6),
    to: '0x4545454545454545454545454545454545454545',
    token: Addresses.pathUsd,
  })
  return { preference, token, transfer }
}
