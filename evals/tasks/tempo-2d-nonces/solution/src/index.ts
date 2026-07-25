import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const transfers = await Promise.all([
    Actions.token.transferSync(client, {
      amount: { decimals: 6, formatted: '1.5' },
      nonceKey: 77001n,
      to: '0x5151515151515151515151515151515151515151',
      token: pathUsd,
    }),
    Actions.token.transferSync(client, {
      amount: { decimals: 6, formatted: '2.25' },
      nonceKey: 77002n,
      to: '0x5252525252525252525252525252525252525252',
      token: pathUsd,
    }),
    Actions.token.transferSync(client, {
      amount: { decimals: 6, formatted: '3.75' },
      nonceKey: 77003n,
      to: '0x5353535353535353535353535353535353535353',
      token: pathUsd,
    }),
  ])
  const nonces = await Promise.all([
    Actions.nonce.get(client, { account: sender, nonceKey: 77001n }),
    Actions.nonce.get(client, { account: sender, nonceKey: 77002n }),
    Actions.nonce.get(client, { account: sender, nonceKey: 77003n }),
    Actions.nonce.get(client, { account: sender, nonceKey: 606060606n }),
  ])
  return { nonces, receipts: transfers.map(({ receipt }) => receipt) }
}
