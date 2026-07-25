import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const address = '0x53e205a3d2286c93630f4e1de81b95dbbf2ec241'

export async function example() {
  const [balance, nonce, code, storageSlot0] = await Promise.all([
    Actions.address.getBalance(client, { address }),
    Actions.address.getTransactionCount(client, { address }),
    Actions.address.getCode(client, { address }),
    Actions.address.getStorageAt(client, { address, slot: '0x0' }),
  ])
  return { balance, code, nonce, storageSlot0 }
}
