import { Account, Actions, Addresses, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import { Value } from 'viem/utils'

const owner = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const spender = Account.fromSecp256k1(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)
const client = Client.create({
  account: owner,
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const approval = await Actions.token.approveSync(client, {
    amount: Value.from('75.5', 6),
    spender: spender.address,
    token: Addresses.pathUsd,
  })
  const { amount: approved } = await Actions.token.getAllowance(client, {
    account: client.account.address,
    spender: spender.address,
    token: Addresses.pathUsd,
  })
  const transfer = await Actions.token.transferSync(client, {
    account: spender,
    amount: Value.from('20.25', 6),
    from: client.account.address,
    to: '0x4545454545454545454545454545454545454545',
    token: Addresses.pathUsd,
  })
  const { amount: remaining } = await Actions.token.getAllowance(client, {
    account: client.account.address,
    spender: spender.address,
    token: Addresses.pathUsd,
  })
  return { approval, approved, remaining, transfer }
}
