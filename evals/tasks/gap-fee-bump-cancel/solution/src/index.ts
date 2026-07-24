import { Actions, type Client } from 'viem'
import type { Address, Hex } from 'viem/utils'

export async function replaceTransfer(
  client: Client.Client,
  options: replaceTransfer.Options,
) {
  const { sender, originalRecipient, replacementRecipient, value } = options

  await Actions.block.setAutomine(client, { enabled: false })
  try {
    const nonce = await Actions.address.getTransactionCount(client, {
      address: sender,
    })
    const fees = await Actions.fee.estimateFeesPerGas(client)

    const originalHash = await Actions.transaction.send(client, {
      account: sender,
      maxFeePerGas: fees.maxFeePerGas,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      nonce,
      to: originalRecipient,
      value,
    })

    // Doubling both fee caps clears the node's replacement price bump.
    const replacementHash = await Actions.transaction.send(client, {
      account: sender,
      maxFeePerGas: fees.maxFeePerGas * 2n,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas * 2n,
      nonce,
      to: replacementRecipient,
      value,
    })

    await Actions.block.mine(client, { blocks: 1 })

    const getReceipt = async (hash: Hex.Hex) => {
      try {
        return await Actions.transaction.getReceipt(client, { hash })
      } catch (error) {
        if (
          error instanceof
          Actions.transaction.Errors.TransactionReceiptNotFoundError
        )
          return null
        throw error
      }
    }
    const [originalReceipt, replacementReceipt] = await Promise.all([
      getReceipt(originalHash),
      getReceipt(replacementHash),
    ])
    const landed = replacementReceipt ?? originalReceipt
    if (!landed) throw new Error('neither transfer landed')

    return { originalHash, replacementHash, landedHash: landed.transactionHash }
  } finally {
    await Actions.block.setAutomine(client, { enabled: true })
  }
}

export declare namespace replaceTransfer {
  type Options = {
    sender: Address.Address
    originalRecipient: Address.Address
    replacementRecipient: Address.Address
    value: bigint
  }
}
