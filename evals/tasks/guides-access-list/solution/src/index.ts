import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis, AbiFunction } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export function example() {
  return Actions.transaction.createAccessList(client, {
    data: AbiFunction.encodeData(Abis.erc20, 'name'),
    to: usdc,
  })
}
