import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export async function example() {
  const [decimals, name, symbol, totalSupply] = await Promise.all([
    Actions.contract.read(client, {
      abi: Abis.erc20,
      address: usdc,
      functionName: 'decimals',
    }),
    Actions.contract.read(client, {
      abi: Abis.erc20,
      address: usdc,
      functionName: 'name',
    }),
    Actions.contract.read(client, {
      abi: Abis.erc20,
      address: usdc,
      functionName: 'symbol',
    }),
    Actions.contract.read(client, {
      abi: Abis.erc20,
      address: usdc,
      functionName: 'totalSupply',
    }),
  ])
  return { decimals, name, symbol, totalSupply }
}
