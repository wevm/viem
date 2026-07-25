import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { usdc } from 'viem/tokens'

const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const recipient = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
const spender = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const token = usdc(mainnet.id).address

const ownerClient = Client.create({
  account: Account.fromPrivateKey(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const spenderClient = Client.create({
  account: Account.fromPrivateKey(
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  await Actions.token.approveSync(ownerClient, {
    amount: 25_000_000n,
    spender,
    token,
  })
  const approved = await Actions.token.getAllowance(ownerClient, {
    account: owner,
    spender,
    token,
  })

  await Actions.token.transferSync(spenderClient, {
    amount: 10_000_000n,
    from: owner,
    to: recipient,
    token,
  })
  const remaining = await Actions.token.getAllowance(ownerClient, {
    account: owner,
    spender,
    token,
  })

  return { approved: approved.amount, remaining: remaining.amount }
}
