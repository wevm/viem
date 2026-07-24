import { Actions, type Client } from 'viem'
import { Abis } from 'viem/utils'

const usdc = {
  abi: Abis.erc20,
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
} as const

export async function getTokenMetadata(client: Client.Client) {
  const [decimals, name, symbol, totalSupply] = await Promise.all([
    Actions.contract.read(client, { ...usdc, functionName: 'decimals' }),
    Actions.contract.read(client, { ...usdc, functionName: 'name' }),
    Actions.contract.read(client, { ...usdc, functionName: 'symbol' }),
    Actions.contract.read(client, { ...usdc, functionName: 'totalSupply' }),
  ])
  return { decimals, name, symbol, totalSupply }
}
