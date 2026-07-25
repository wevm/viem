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

const token = '0x20c0000000000000000000000000000000000000'

export async function example() {
  const first = await Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: '10.5' },
    to: '0x4242424242424242424242424242424242424242',
    token,
  })
  const second = await Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: '0.25' },
    to: '0x4343434343434343434343434343434343434343',
    token,
  })
  return { first, second }
}
