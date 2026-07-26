import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  await Actions.transaction.sendSync(client, {
    to: token,
    value: 2_000_000_000_000_000_000n,
  })
  const { receipt } = await Actions.token.transferSync(client, {
    amount: { decimals: 18, formatted: '1.5' },
    to: '0x4242424242424242424242424242424242424242',
    token,
  })
  return receipt
}
