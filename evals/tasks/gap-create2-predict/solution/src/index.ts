import { Account, Actions, Addresses, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { ContractAddress } from 'viem/utils'

const bytecode = '0x6001600c60003960016000f300'
const salt =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const predicted = ContractAddress.fromCreate2({
    bytecode,
    from: Addresses.create2,
    salt,
  })
  await Actions.contract.deploySync(client, {
    abi: [],
    bytecode,
    salt,
  })
  const code = await Actions.address.getCode(client, { address: predicted })
  if (!code || code === '0x') throw new Error('no code at predicted address')
  return { predicted, deployed: predicted }
}
