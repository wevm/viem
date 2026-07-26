import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const amount = 12_345_678n
  const to = '0x4242424242424242424242424242424242424242'

  await Actions.transaction.sendSync(client, {
    to: token,
    value: 1_000_000_000_000_000_000n,
  })
  const { request, result } = await Actions.token.transfer.simulate(client, {
    amount,
    to,
    token,
  })
  const receipt = await Actions.transaction.sendSync(client, request)
  return { amount, receipt, simulated: result, to, token }
}
