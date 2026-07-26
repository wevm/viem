import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Ens } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const [resolvedAddress, name] = await Promise.all([
    Actions.ens.getAddress(client, { name: Ens.normalize('vitalik.eth') }),
    Actions.ens.getName(client, {
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    }),
  ])
  return { address: resolvedAddress, name }
}
