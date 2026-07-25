import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://127.0.0.1:18545', { batch: true }),
})

export async function example() {
  const [blockNumber, chainId, gasPrice] = await Promise.all([
    Actions.block.getNumber(client),
    Actions.chains.getId(client),
    Actions.fee.getGasPrice(client),
  ])
  return { blockNumber, chainId, gasPrice }
}
