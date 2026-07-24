import { Actions, type Client, Errors, RpcError } from 'viem'
import { type Address, Value } from 'viem/utils'

export async function sendPayment(
  client: Client.Client,
  options: sendPayment.Options,
): Promise<sendPayment.Status> {
  const { amountEther, to } = options
  try {
    await Actions.transaction.send(client, {
      to,
      value: Value.fromEther(amountEther),
    })
    return 'sent'
  } catch (error) {
    if (
      error instanceof Errors.BaseError &&
      error.walk((cause) => cause instanceof RpcError.InsufficientFundsError)
    )
      return 'insufficient-funds'
    return 'unknown'
  }
}

export declare namespace sendPayment {
  type Options = {
    amountEther: string
    to: Address.Address
  }

  type Status = 'insufficient-funds' | 'sent' | 'unknown'
}
