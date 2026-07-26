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
  const { timestamp } = await client.block.get()
  const validAfter = Number(timestamp) + 6
  const amount = Value.from('12.5', 6)
  const to = '0x5151515151515151515151515151515151515151'
  const gas = await Actions.token.transfer.estimateGas(client, {
    amount,
    to,
    token: Addresses.pathUsd,
  })
  const result = await Actions.token.transferSync(client, {
    amount,
    gas,
    to,
    token: Addresses.pathUsd,
    validAfter,
  })
  return { result, validAfter }
}
