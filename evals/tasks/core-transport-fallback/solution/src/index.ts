import { Actions, Client, fallback, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: fallback([http('http://anvil:1'), http('http://anvil:8545')]),
})

export function example() {
  return Actions.block.getNumber(client)
}
