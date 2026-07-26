import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Addresses, Client, http, P256 } from 'viem/tempo'
import { Value } from 'viem/utils'

const client = Client.create({
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const firstAccount = Account.fromP256(P256.randomPrivateKey())
  const secondAccount = Account.fromP256(P256.randomPrivateKey())

  await Promise.all([
    Actions.faucet.fundSync(client, { account: firstAccount }),
    Actions.faucet.fundSync(client, { account: secondAccount }),
  ])

  const [firstTransfer, secondTransfer] = await Promise.all([
    Actions.token.transferSync(client, {
      account: firstAccount,
      amount: Value.from('10.5', 6),
      to: '0x5151515151515151515151515151515151515151',
      token: Addresses.pathUsd,
    }),
    Actions.token.transferSync(client, {
      account: secondAccount,
      amount: Value.from('0.25', 6),
      to: '0x5252525252525252525252525252525252525252',
      token: Addresses.pathUsd,
    }),
  ])

  return {
    first: { ...firstTransfer, sender: firstAccount.address },
    second: { ...secondTransfer, sender: secondAccount.address },
  }
}
