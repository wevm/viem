import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import type { Hex } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const originalRecipient = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
  const replacementRecipient = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
  const value = 1_234_567_890_123_456n

  let pendingHash: Hex.Hex | undefined
  await Actions.block.setAutomine(client, { enabled: false })
  try {
    const { request } = await Actions.transaction.prepare(client, {
      account: sender,
      to: originalRecipient,
      value,
    })

    const originalHash = await Actions.transaction.send(client, request)
    pendingHash = originalHash

    // Doubling both fee caps clears the node's replacement price bump.
    const replacementHash = await Actions.transaction.send(client, {
      ...request,
      maxFeePerGas: request.maxFeePerGas * 2n,
      maxPriorityFeePerGas: request.maxPriorityFeePerGas * 2n,
      to: replacementRecipient,
    })
    pendingHash = replacementHash

    await Actions.block.mine(client, { blocks: 1 })
    pendingHash = undefined

    const block = await Actions.block.get(client, {
      includeTransactions: true,
    })
    const landed = block.transactions.find(
      (transaction) => transaction.hash === replacementHash,
    )
    if (!landed) throw new Error('replacement did not land')

    return { originalHash, replacementHash, landedHash: landed.hash }
  } catch (error) {
    if (pendingHash)
      await Promise.allSettled([
        Actions.txpool.dropTransaction(client, { hash: pendingHash }),
      ])
    throw error
  } finally {
    await Actions.block.setAutomine(client, { enabled: true })
  }
}
