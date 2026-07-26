import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Addresses, Client, http } from 'viem/tempo'
import { Value } from 'viem/utils'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const first = await Actions.token.transferSync(client, {
    amount: Value.from('10.5', 6),
    to: '0x4242424242424242424242424242424242424242',
    token: Addresses.pathUsd,
  })
  const second = await Actions.token.transferSync(client, {
    amount: Value.from('0.25', 6),
    to: '0x4343434343434343434343434343434343434343',
    token: Addresses.pathUsd,
  })
  return { first, second }
}
