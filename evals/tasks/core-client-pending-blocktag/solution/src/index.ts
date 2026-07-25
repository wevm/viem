import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  blockTag: 'pending',
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export function example() {
  return Actions.address.getBalance(client, {
    address: '0x1111000000000000000000000000000000001111',
  })
}
