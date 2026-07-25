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

export function example() {
  return Actions.transaction.sendSync(client, {
    calls: [
      tempo_Actions.token.approve.call({
        amount: { decimals: 6, formatted: '25.5' },
        spender: '0x5151515151515151515151515151515151515151',
        token: pathUsd,
      }),
      tempo_Actions.token.transfer.call({
        amount: { decimals: 6, formatted: '10.5' },
        to: '0x5252525252525252525252525252525252525252',
        token: pathUsd,
      }),
    ],
  })
}
