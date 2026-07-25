import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { usdc } from 'viem/tokens'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const address = usdc(mainnet.id).address
  const metadata = await Actions.token.getMetadata(client, { token: address })
  return { address, ...metadata }
}
