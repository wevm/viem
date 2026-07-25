import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi } from 'viem/utils'

const abi = Abi.from([
  'constructor(address owner)',
  'function owner() view returns (address)',
])

const bytecode = '0x6020601c5f395f515f55600860145f3960085ff35f545f5260205ff3'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  const receipt = await Actions.contract.deploySync(client, {
    abi,
    args: [owner],
    bytecode,
  })
  if (!receipt.contractAddress) throw new Error('contract not deployed')
  return { address: receipt.contractAddress, owner }
}
