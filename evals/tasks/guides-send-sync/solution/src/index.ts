import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Value } from 'viem/utils'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xf71f379f68c738d29b7a90474497eb9ce74c699bb9ada94bda359f8c2f101263',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export function example() {
  return Actions.transaction.sendSync(client, {
    to: '0x4242424242424242424242424242424242424242',
    value: Value.fromEther('0.5'),
  })
}
