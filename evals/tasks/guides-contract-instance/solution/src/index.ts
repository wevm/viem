import { Client, Contract, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const contract = Contract.from({
  abi: Abis.erc20,
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  client,
})
const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'

export async function example() {
  const [symbol, decimals, holderBalance] = await Promise.all([
    contract.read.symbol(),
    contract.read.decimals(),
    contract.read.balanceOf([holder]),
  ])
  const { result: transferOk } = await contract.simulate.transfer(
    ['0x4242424242424242424242424242424242424242', 1_234_567n],
    { account: holder },
  )
  return { decimals, holderBalance, symbol, transferOk }
}
