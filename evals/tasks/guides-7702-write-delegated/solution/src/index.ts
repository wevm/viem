import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi } from 'viem/utils'

const abi = Abi.from([
  'function store(uint256 value)',
  'function retrieve() view returns (uint256)',
])

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xd52ca50b7cca7d19e9a2301bd3a1bb5a471db800093e8823db7f9f49f6bed834',
  ),
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

export async function example() {
  await Actions.contract.writeSync(client, {
    abi,
    address: client.account.address,
    args: [741_852_963n],
    functionName: 'store',
  })
  return Actions.contract.read(client, {
    abi,
    address: client.account.address,
    functionName: 'retrieve',
  })
}
