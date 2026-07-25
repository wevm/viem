import { Account, Actions, Client, http, P256 } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const client = Client.create({
  chain: tempoLocalnet,
  feeToken: pathUsd,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

async function transfer(options: { amount: string; to: Address.Address }) {
  const account = Account.fromP256(P256.randomPrivateKey())
  await Actions.faucet.fundSync(client, { account })
  const { receipt } = await Actions.token.transferSync(client, {
    account,
    amount: { decimals: 6, formatted: options.amount },
    feeToken: pathUsd,
    to: options.to,
    token: pathUsd,
  })
  return { receipt, sender: account.address }
}

export async function example() {
  const first = await transfer({
    amount: '10.5',
    to: '0x5151515151515151515151515151515151515151',
  })
  const second = await transfer({
    amount: '0.25',
    to: '0x5252525252525252525252525252525252525252',
  })
  return { first, second }
}
