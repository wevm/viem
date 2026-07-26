import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const owner = Account.fromPrivateKey(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)
const recipient = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
const spender = Account.fromPrivateKey(
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
)
const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const ether = 1_000_000_000_000_000_000n

export async function example() {
  await Actions.transaction.sendSync(client, {
    account: owner,
    to: token,
    value: 50n * ether,
  })
  await Actions.token.approveSync(client, {
    account: owner,
    amount: 25n * ether,
    spender: spender.address,
    token,
  })
  const approved = await Actions.token.getAllowance(client, {
    account: owner.address,
    spender: spender.address,
    token,
  })

  await Actions.token.transferSync(client, {
    account: spender,
    amount: 10n * ether,
    from: owner.address,
    to: recipient,
    token,
  })
  const remaining = await Actions.token.getAllowance(client, {
    account: owner.address,
    spender: spender.address,
    token,
  })

  return { approved: approved.amount, remaining: remaining.amount }
}
