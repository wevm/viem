import { Actions, type Client, Errors, RpcError } from 'viem'
import { AbiFunction, type Address } from 'viem/utils'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const transfer = AbiFunction.from(
  'function transfer(address to, uint256 amount) returns (bool)',
)

export async function wouldTransferSucceed(
  client: Client.Client,
  options: wouldTransferSucceed.Options,
): Promise<boolean> {
  const { amount, from } = options
  try {
    await Actions.call(client, {
      account: from,
      data: AbiFunction.encodeData(transfer, [recipient, amount]),
      to: usdc,
    })
    return true
  } catch (error) {
    if (
      error instanceof Errors.BaseError &&
      error.walk((cause) => cause instanceof RpcError.ExecutionRevertedError)
    )
      return false
    throw error
  }
}

export declare namespace wouldTransferSucceed {
  type Options = {
    amount: bigint
    from: Address.Address
  }
}
