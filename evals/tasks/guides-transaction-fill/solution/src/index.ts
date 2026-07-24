import { Actions, type Client } from 'viem'
import { type Address, Value } from 'viem/utils'

export async function completeTransferRequest(
  client: Client.Client,
  options: completeTransferRequest.Options,
) {
  const { amountEther, from, to } = options
  const { transaction } = await Actions.transaction.fill(client, {
    account: from,
    to,
    value: Value.fromEther(amountEther),
  })
  const { chainId, gas, maxFeePerGas, maxPriorityFeePerGas, nonce, value } =
    transaction
  if (
    chainId === undefined ||
    gas === undefined ||
    maxFeePerGas === undefined ||
    maxPriorityFeePerGas === undefined ||
    nonce === undefined ||
    !transaction.to ||
    value === undefined
  )
    throw new Error('node returned an incomplete transaction')
  return {
    ...transaction,
    chainId,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    to: transaction.to,
    value,
  }
}

export declare namespace completeTransferRequest {
  type Options = {
    amountEther: string
    from: Address.Address
    to: Address.Address
  }
}
