import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { priceFeedAbi } from './abi.js'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const [ethUsd, btcUsd] = await Promise.all([
    Actions.contract.read(client, {
      abi: priceFeedAbi,
      address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      functionName: 'latestRoundData',
    }),
    Actions.contract.read(client, {
      abi: priceFeedAbi,
      address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
      functionName: 'latestRoundData',
    }),
  ])
  return { btcUsd, ethUsd }
}
