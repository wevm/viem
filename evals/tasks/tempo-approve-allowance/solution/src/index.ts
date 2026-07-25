import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const owner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const spender = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const ownerClient = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

const spenderClient = Client.create({
  account: Account.fromSecp256k1(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const approval = await Actions.token.approveSync(ownerClient, {
    amount: { decimals: 6, formatted: '75.5' },
    spender,
    token: pathUsd,
  })
  const approved = await Actions.token.getAllowance(ownerClient, {
    account: owner,
    spender,
    token: pathUsd,
  })
  const transfer = await Actions.token.transferSync(spenderClient, {
    amount: { decimals: 6, formatted: '20.25' },
    from: owner,
    to: '0x4545454545454545454545454545454545454545',
    token: pathUsd,
  })
  const remaining = await Actions.token.getAllowance(ownerClient, {
    account: owner,
    spender,
    token: pathUsd,
  })
  return {
    approval,
    approved: approved.amount,
    remaining: remaining.amount,
    transfer,
  }
}
