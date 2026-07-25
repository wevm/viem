import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Value } from 'viem/utils'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  await Actions.block.setAutomine(client, { enabled: false })
  try {
    for (let i = 0; i < 3; i++)
      await Actions.transaction.send(client, {
        to: '0x4242424242424242424242424242424242424242',
        value: Value.fromEther('1'),
      })

    const { pending } = await Actions.txpool.getStatus(client)
    await Actions.block.mine(client, { blocks: 1 })
    const minedTxCount = await Actions.block.getTransactionCount(client)
    return { minedTxCount, pooledBefore: pending }
  } finally {
    await Actions.block.setAutomine(client, { enabled: true })
  }
}
