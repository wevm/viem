import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const alphaUsd = '0x20c0000000000000000000000000000000000001'
const pathUsd = '0x20c0000000000000000000000000000000000000'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  await Actions.amm.mintSync(client, {
    to: client.account.address,
    userTokenAddress: alphaUsd,
    validatorTokenAddress: pathUsd,
    validatorTokenAmount: 1_000_000_000n,
  })

  return Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: '12.5' },
    feeToken: alphaUsd,
    to: '0x4242424242424242424242424242424242424242',
    token: pathUsd,
  })
}
