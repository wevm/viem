import { Client, Contract, http, publicActions } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http(),
}).extend(publicActions())

export const contract = Contract.from({
  abi: Abi.from([
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
  ]),
  address: '0x0000000000000000000000000000000000000000',
  client,
})
