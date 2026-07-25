import { Actions } from 'viem'
import { Account, Actions as tempo_Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

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
  const { timestamp } = await Actions.block.get(client)
  const validAfter = Number(timestamp) + 6
  const gas = await tempo_Actions.token.transfer.estimateGas(client, {
    amount: { decimals: 6, formatted: '12.5' },
    to: '0x5151515151515151515151515151515151515151',
    token: pathUsd,
  })
  const result = await tempo_Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: '12.5' },
    gas,
    to: '0x5151515151515151515151515151515151515151',
    token: pathUsd,
    validAfter,
  })
  return { result, validAfter }
}
