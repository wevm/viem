import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'
const tokens = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0xcA11bde05977b3631167028862bE2a173976CA11',
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
] as const

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const { results } = await Actions.multicall(client, {
    calls: tokens.map((token) =>
      Actions.token.getBalance.call(client, { account: holder, token }),
    ),
  })
  return results.map((entry) =>
    entry.status === 'success'
      ? { status: 'success', balance: entry.result }
      : { status: 'failure', error: entry.error },
  )
}
