import { Account, Actions, Addresses, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import { Value } from 'viem/utils'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export function example() {
  return client.transaction.sendSync({
    calls: [
      Actions.token.approve.call({
        amount: Value.from('25.5', 6),
        spender: '0x5151515151515151515151515151515151515151',
        token: Addresses.pathUsd,
      }),
      Actions.token.transfer.call({
        amount: Value.from('10.5', 6),
        to: '0x5252525252525252525252525252525252525252',
        token: Addresses.pathUsd,
      }),
    ],
  })
}
