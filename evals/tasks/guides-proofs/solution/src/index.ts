import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export function example() {
  return Actions.address.getProof(client, {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    storageKeys: [
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    ],
  })
}
