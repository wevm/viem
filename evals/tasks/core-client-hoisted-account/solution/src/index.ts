import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Value } from 'viem/utils'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export function example() {
  return Actions.transaction.sendSync(client, {
    to: '0x4242424242424242424242424242424242424242',
    value: Value.fromEther('1.25'),
  })
}
