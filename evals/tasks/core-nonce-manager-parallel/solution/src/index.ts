import { Account, Actions, Client, http, NonceManager } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    { nonceManager: NonceManager.jsonRpc() },
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const values = [
    1_000_000_000_000_000n,
    2_000_000_000_000_000n,
    3_000_000_000_000_000n,
    4_000_000_000_000_000n,
    5_000_000_000_000_000n,
  ]
  return Promise.all(
    values.map((value) =>
      Actions.transaction.send(client, {
        to: '0x4242424242424242424242424242424242424242',
        value,
      }),
    ),
  )
}
