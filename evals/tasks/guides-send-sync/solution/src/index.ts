import { Actions, type Client } from 'viem'
import { type Address, Value } from 'viem/utils'

export async function sendPayment(
  client: Client.Client,
  options: sendPayment.Options,
) {
  const { amountEther, to } = options
  return Actions.transaction.sendSync(client, {
    to,
    value: Value.fromEther(amountEther),
  })
}

export declare namespace sendPayment {
  type Options = {
    amountEther: string
    to: Address.Address
  }
}
