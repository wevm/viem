import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const owner = '0x28C6c06298d514Db089934071355E5743bf21d60'
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export async function example() {
  const { results } = await Actions.multicall(client, {
    allowFailure: false,
    calls: [
      { abi: Abis.erc20, functionName: 'name', to: usdc },
      { abi: Abis.erc20, functionName: 'symbol', to: usdc },
      { abi: Abis.erc20, functionName: 'decimals', to: usdc },
      { abi: Abis.erc20, args: [owner], functionName: 'balanceOf', to: usdc },
    ],
  })
  const [name, symbol, decimals, balance] = results
  return { balance, decimals, name, symbol }
}
