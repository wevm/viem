import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { usdc } from 'viem/tokens'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const { receipt } = await Actions.token.transferSync(client, {
    amount: { formatted: '1.5' },
    to: '0x4242424242424242424242424242424242424242',
    token: usdc(mainnet.id).address,
  })
  return receipt
}
