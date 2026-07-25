import { Actions, Client, http, publicActions } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const appClient = client.extend(publicActions()).extend((client) => ({
    health: {
      async check() {
        const [blockNumber, chainId] = await Promise.all([
          Actions.block.getNumber(client),
          Actions.chains.getId(client),
        ])
        return { blockNumber, chainId }
      },
    },
  }))

  const [health, blockNumber] = await Promise.all([
    appClient.health.check(),
    appClient.block.getNumber(),
  ])
  return {
    blockNumber,
    chain: appClient.chain,
    health,
  }
}
