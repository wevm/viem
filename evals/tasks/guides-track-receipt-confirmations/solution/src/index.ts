import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Value } from 'viem/utils'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  cacheTime: 0,
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const recipient = '0x4242424242424242424242424242424242424242'

export async function example() {
  const receipt = await Actions.transaction.sendSync(client, {
    to: recipient,
    value: Value.fromEther('1'),
  })
  const before = await Actions.transaction.getConfirmations(client, {
    hash: receipt.transactionHash,
  })
  await Actions.block.mine(client, { blocks: 3 })
  const after = await Actions.transaction.getConfirmations(client, {
    hash: receipt.transactionHash,
  })

  await Actions.block.setAutomine(client, { enabled: false })
  const pending = await (async () => {
    try {
      const hash = await Actions.transaction.send(client, {
        to: recipient,
        value: 1n,
      })
      return await Actions.transaction.getConfirmations(client, { hash })
    } finally {
      await Actions.block.setAutomine(client, { enabled: true })
      await Actions.block.mine(client, { blocks: 1 })
    }
  })()

  return { after, before, pending, receipt }
}
